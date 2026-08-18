from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Protocol

import httpx

from app.config import get_settings

CITATION_RE = re.compile(r"\[SOURCE:([A-Za-z0-9_.:-]+)\]")
INJECTION_PATTERNS = (
    "ignore previous instructions", "ignore all previous instructions", "system prompt",
    "developer message", "reveal your instructions", "exfiltrate", "bypass policy", "jailbreak",
)

@dataclass(frozen=True)
class CognitiveSource:
    source_id: str
    code: str
    title: str
    excerpt: str
    score: float

@dataclass(frozen=True)
class CognitiveRequest:
    model: str
    system_instruction: str
    user_query: str
    sources: list[CognitiveSource]
    correlation_id: str
    metadata: dict = field(default_factory=dict)

@dataclass(frozen=True)
class CognitiveResponse:
    text: str
    provider: str
    model: str
    provider_request_id: str | None = None
    input_tokens: int | None = None
    output_tokens: int | None = None
    raw_metadata: dict = field(default_factory=dict)
    latency_ms: int | None = None
    estimated_cost_usd: float | None = None

class CognitiveProvider(Protocol):
    name: str
    def analyze(self, request: CognitiveRequest) -> CognitiveResponse: ...

def contains_prompt_injection(text: str) -> bool:
    normalized = text.lower()
    return any(pattern in normalized for pattern in INJECTION_PATTERNS)

def prepare_sources(hits: list[dict]) -> tuple[list[CognitiveSource], list[dict]]:
    clean, flags = [], []
    for hit in hits:
        excerpt = str(hit.get("excerpt", ""))
        if contains_prompt_injection(excerpt):
            flags.append({"type": "prompt_injection_source", "source_id": hit.get("source_id"), "code": hit.get("code")})
            continue
        clean.append(CognitiveSource(
            source_id=str(hit["source_id"]), code=str(hit["code"]), title=str(hit["title"]),
            excerpt=excerpt, score=float(hit.get("score", 0)),
        ))
    return clean, flags

class DeterministicProvider:
    name = "deterministic"
    def analyze(self, request: CognitiveRequest) -> CognitiveResponse:
        if request.sources:
            citations = " ".join(f"[SOURCE:{s.code}]" for s in request.sources[:3])
            text = (
                "Conclusão preliminar: há contexto autorizado recuperado para análise. " + citations + "\n\n"
                "Evidências/fontes: revisar os trechos citados no contexto autorizado.\n"
                "Lacunas: este provider é determinístico e não substitui análise de um LLM.\n"
                "Próxima ação humana recomendada: validar a interpretação antes de qualquer decisão ou execução."
            )
        else:
            text = (
                "Conclusão preliminar: fontes autorizadas insuficientes para emitir afirmação factual.\n\n"
                "Evidências/fontes: nenhuma fonte recuperada.\n"
                "Lacunas: ausência de contexto governado.\n"
                "Próxima ação humana recomendada: incluir ou autorizar fontes aplicáveis antes de prosseguir."
            )
        return CognitiveResponse(text=text, provider=self.name, model=request.model)

class OpenAIResponsesProvider:
    name = "openai"
    def __init__(self, client: httpx.Client | None = None) -> None:
        settings = get_settings()
        if not settings.openai_api_key:
            raise RuntimeError("AMICO_OPENAI_API_KEY não configurada")
        self._settings = settings
        self._client = client or httpx.Client(
            base_url=settings.openai_base_url.rstrip("/"), timeout=settings.openai_timeout_seconds,
            headers={"Authorization": f"Bearer {settings.openai_api_key.get_secret_value()}", "Content-Type": "application/json"},
        )

    @staticmethod
    def _extract_text(payload: dict) -> str:
        if isinstance(payload.get("output_text"), str):
            return payload["output_text"]
        parts = []
        for item in payload.get("output", []) or []:
            for content in item.get("content", []) or []:
                if content.get("type") in {"output_text", "text"} and isinstance(content.get("text"), str):
                    parts.append(content["text"])
        return "\n".join(parts).strip()

    def analyze(self, request: CognitiveRequest) -> CognitiveResponse:
        started = time.perf_counter()
        response = self._client.post("/responses", json={"model": request.model, "instructions": request.system_instruction, "input": request.user_query, "store": False})
        latency_ms = round((time.perf_counter() - started) * 1000)
        if response.status_code >= 400:
            raise RuntimeError(f"OpenAI Responses API falhou ({response.status_code}): {response.text[:500]}")
        payload = response.json(); usage = payload.get("usage") or {}
        input_tokens, output_tokens = usage.get("input_tokens"), usage.get("output_tokens")
        cost = None
        if input_tokens is not None or output_tokens is not None:
            cost = round(((input_tokens or 0)/1_000_000)*self._settings.openai_input_usd_per_mtok + ((output_tokens or 0)/1_000_000)*self._settings.openai_output_usd_per_mtok, 8)
        return CognitiveResponse(
            text=self._extract_text(payload), provider=self.name, model=request.model,
            provider_request_id=payload.get("id"), input_tokens=input_tokens, output_tokens=output_tokens,
            latency_ms=latency_ms, estimated_cost_usd=cost, raw_metadata={"status": payload.get("status")},
        )

def get_provider(provider_name: str) -> CognitiveProvider:
    normalized = provider_name.strip().lower()
    if normalized in {"deterministic", "mock", "none", "offline"}: return DeterministicProvider()
    if normalized == "openai": return OpenAIResponsesProvider()
    raise ValueError(f"Provider cognitivo não suportado no F4: {provider_name}")

def evaluate_grounding(text: str, sources: list[CognitiveSource]) -> tuple[int, list[dict]]:
    valid_codes = {s.code for s in sources}; cited = CITATION_RE.findall(text); flags = []
    unknown = sorted(set(cited) - valid_codes)
    if unknown: flags.append({"type": "unknown_source_citation", "codes": unknown})
    if not sources:
        sufficient = any(x in text.lower() for x in ("insuficiente", "nenhuma fonte", "ausência de contexto", "ausencia de contexto"))
        return (100 if sufficient and not cited else 0), flags
    if not cited:
        flags.append({"type": "missing_citation"}); return 0, flags
    valid_count = sum(1 for c in cited if c in valid_codes)
    return round(100 * valid_count / max(len(cited), 1)), flags

def evaluate_security(text: str, source_security_flags: list[dict]) -> tuple[int, list[dict]]:
    flags = list(source_security_flags); lower = text.lower()
    if any(marker in lower for marker in ("api_key=", "bearer ey", "password=", "senha=")):
        flags.append({"type": "possible_secret_exposure"})
    if "system prompt" in lower and ("aqui está" in lower or "instruções" in lower):
        flags.append({"type": "possible_instruction_disclosure"})
    severe = any(f["type"] in {"possible_secret_exposure", "possible_instruction_disclosure", "unknown_source_citation"} for f in flags)
    return (0 if severe else max(0, 100 - 20 * len(flags))), flags
