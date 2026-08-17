# F4.1 — Relatório final GO / NO-GO para F5

Data-base: 16/08/2026
Branch: `feat/f4-1-homologacao-cognitiva`

## Decisão

**NO-GO TEMPORÁRIO PARA F5.**

O gate F4.1 está tecnicamente preparado e o CI offline está verde, mas ainda falta a evidência obrigatória de execução real no ambiente RC com provider OpenAI autorizado. Nenhum merge na `main` deve ocorrer antes dessa evidência e do aceite humano final.

## Evidências aprovadas

- Causa raiz do primeiro CI identificada: `setuptools` detectava `app` e `datasets` como pacotes top-level no layout plano.
- Correção aplicada no `pyproject.toml` com descoberta explícita somente de `app*`.
- GitHub Actions F4.1: `Install` aprovado.
- GitHub Actions F4.1: `pytest -q` aprovado.
- GitHub Actions F4.1: dataset offline aprovado.
- Pacote técnico completo v0.5.2 executado localmente: **22/22 testes aprovados**.
- Testes do pacote completo incluem isolamento RAG entre Empresa A e Empresa B e verificação de que fonte do tenant B não é recuperada pelo tenant A.
- Autonomia acima de A1 é negada no fluxo cognitivo controlado.
- Prompt injection em fonte recuperada é filtrado antes do provider.
- Citações inexistentes reduzem o grounding e geram flag de segurança.
- Modelo real preparado: `gpt-5.6-luna`, via OpenAI Responses API, `store=false`, sem tools expostas ao LLM e chave somente por `AMICO_OPENAI_API_KEY` no secret manager do RC.

## Critérios ainda pendentes

1. Executar o dataset F4.1 no RC com provider `openai` e modelo `gpt-5.6-luna`.
2. Confirmar grounding médio >= 80.
3. Confirmar segurança média >= 90.
4. Confirmar 100% dos casos sem fonte respondendo com insuficiência, sem invenção factual.
5. Confirmar zero recuperação cross-tenant no RC.
6. Confirmar latência p95 <= 15 s.
7. Confirmar custo <= US$ 0,02 por caso no dataset inicial.
8. Registrar aceite humano explícito do gate.

## Comando de homologação RC

```bash
cd backend
python scripts/run_f41.py \
  --provider openai \
  --model gpt-5.6-luna \
  --out f41_openai_report.json
```

A credencial deve existir apenas como segredo de ambiente `AMICO_OPENAI_API_KEY`. Não versionar `.env`, chave, token ou relatório contendo segredo.

## Regra de promoção

Somente alterar a decisão para **GO PARA F5** quando todos os oito critérios pendentes forem comprovados no RC e o aceite humano estiver registrado. Até lá, manter a PR aberta e sem merge.
