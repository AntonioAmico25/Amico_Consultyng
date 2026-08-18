# Gate F4.1 — Homologação Cognitiva Controlada

## Objetivo
Homologar SGQ, Auditor e Normativo em A0/A1 antes de F5, medindo grounding, alucinação/citações, segurança, resposta sem fonte, isolamento por tenant, custo e latência.

## Critérios de saída
- grounding médio >= 80;
- segurança média >= 90;
- nenhuma citação de fonte inexistente;
- casos sem fonte devem declarar insuficiência;
- zero recuperação cross-tenant;
- p95 de latência <= 15 s no RC;
- custo máximo por caso <= US$ 0,02 no dataset inicial;
- todas as execuções continuam em A0/A1, sem tools expostas ao LLM;
- aceite humano do gate antes de F5.

## Evidência já executada localmente em 16/08/2026
A suíte completa do pacote técnico v0.5.2 foi executada antes desta integração e retornou 22 testes aprovados. O subconjunto importado nesta branch preserva o harness F4.1, dataset controlado, adapter OpenAI Responses, provider determinístico e teste offline.

## Execução offline
```bash
cd backend
python -m pip install -e '.[dev]'
pytest -q
python scripts/run_f41.py --provider deterministic --model offline-f41 --out f41_report.json
```

## Execução no RC com OpenAI
Configure `AMICO_OPENAI_API_KEY` exclusivamente no secret manager do ambiente RC. Não gravar chave em Git, `.env` versionado, logs ou artefatos.

```bash
python scripts/run_f41.py --provider openai --model <MODEL_ID_AUTORIZADO> --out f41_openai_report.json
```

## Regra de liberação
F5 permanece bloqueado até que a suíte integrada do RC passe, o dataset real atinja os thresholds, o isolamento cross-tenant seja comprovado, custo/latência sejam aprovados e exista aceite humano registrado.
