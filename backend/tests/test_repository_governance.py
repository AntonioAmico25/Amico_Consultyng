from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_master_prompt_and_audit_exist():
    assert (ROOT / "docs/PROMPT_MESTRE_UNICO_AMICO.md").is_file()
    assert (ROOT / "docs/AUDITORIA_MESTRE_2026-08-25_R00.md").is_file()


def test_public_site_language_control_does_not_reintroduce_layout_bar():
    html = read("index.html")
    # Regressão de 25/08: barra sticky de idiomas desconfigurou o layout.
    assert ".lang-fab" in html
    assert 'id="langFab"' in html
    assert 'id="langSelect"' in html
    assert "restorePtBr" in html
    assert ".langbar{position:sticky" not in html
    assert html.count(":root{") == 1


def test_public_site_exposes_many_languages_and_ptbr_return():
    html = read("index.html")
    options = re.findall(r'<option value="([a-z-]+)"', html)
    # Exige catálogo amplo, evitando regressão para apenas PT-BR.
    assert len(set(options)) >= 20
    for lang in ("en", "es", "fr", "de", "it", "ja", "ko", "zh-CN"):
        assert lang in options
    assert "PT-BR" in html


def test_pwa_manifest_is_valid_and_scoped():
    manifest = json.loads(read("app/manifest.webmanifest"))
    assert manifest.get("display") in {"standalone", "fullscreen", "minimal-ui"}
    assert manifest.get("start_url")
    assert manifest.get("scope")


def test_ai_governance_configs_are_valid_json():
    for path in (
        "config/ai-governance-2026-08-24.json",
        "config/amico-core.json",
        "app/ai-governance.json",
        "sgq-manager-foca/ai-governance.json",
    ):
        json.loads(read(path))


def test_no_obvious_private_api_secret_in_public_javascript():
    public_files = [
        "index.html",
        "app/index.html",
        "sgq-manager-foca/app.js",
        "sgq-manager-foca/doc-manager.js",
        "sgq-manager-foca/navigation.js",
    ]
    forbidden = ("service_role", "SUPABASE_SERVICE_ROLE_KEY", "sk-proj-", "sk-live-")
    for path in public_files:
        content = read(path)
        for token in forbidden:
            assert token not in content, f"Possível segredo privado em {path}: {token}"


def test_sgq_frontend_uses_publishable_supabase_key_only():
    app_js = read("sgq-manager-foca/app.js")
    assert "sb_publishable_" in app_js
    assert "service_role" not in app_js
