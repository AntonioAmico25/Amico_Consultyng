# F4.1 — Relatório GO / NO-GO para F5

Data-base revisada: 18/08/2026
Baseline consolidada: `main`

## Decisão

**NO-GO PARA F5 COGNITIVO, ATÉ FECHAMENTO DAS EVIDÊNCIAS COM PROVIDER REAL.**

Esta decisão não bloqueia a disponibilização do **SGQ Manager FOCA para piloto operacional controlado**. O piloto do SGQ Manager e o gate cognitivo F4.1 são controles distintos e devem permanecer registrados separadamente.

## Situação confirmada em 18/08/2026

- O layout aprovado do SGQ Manager FOCA foi restaurado.
- As correções de autenticação, redefinição de senha MASTER, status de tenant/membership e versionamento/cache foram incorporadas à baseline.
- O RC consolidado foi executado no commit `e127b845b3646475cb7abdbda7068d203efd9c9d`.
- GitHub Actions `RC Consolidado`, run `32155667353`: **SUCCESS**.
- GitHub Actions `F4.1 Cognitive Gate`, run `32155667391`: **SUCCESS**.
- No RC Consolidado foram aprovados: instalação, testes F4.1, dataset offline e verificações estruturais.
- O merge consolidado foi incorporado à `main` no commit `183ffec8e3d4d5fb59ce8ac28dd83d443cd24a18`.
- O SGQ Manager está autorizado para **piloto operacional controlado**, conforme `docs/SGQ_MANAGER_RELEASE_2026-08-18.md`.

## Evidências F4.1 já aprovadas

- Causa raiz do primeiro CI identificada: `setuptools` detectava `app` e `datasets` como pacotes top-level no layout plano.
- Correção aplicada no `pyproject.toml` com descoberta explícita somente de `app*`.
- GitHub Actions F4.1: instalação aprovada.
- GitHub Actions F4.1: testes aprovados.
- Dataset offline aprovado.
- Pacote técnico completo v0.5.2 executado localmente: **22/22 testes aprovados**.
- Testes incluem isolamento RAG entre Empresa A e Empresa B.
- Autonomia acima de A1 é negada no fluxo cognitivo controlado.
- Prompt injection em fonte recuperada é filtrado antes do provider.
- Citações inexistentes reduzem grounding e geram flag de segurança.

## Critérios ainda pendentes exclusivamente para promoção ao F5

1. Executar o dataset F4.1 no RC com provider OpenAI autorizado e modelo aprovado para o ambiente.
2. Confirmar grounding médio >= 80.
3. Confirmar segurança média >= 90.
4. Confirmar 100% dos casos sem fonte respondendo com insuficiência, sem invenção factual.
5. Confirmar zero recuperação cross-tenant no RC real.
6. Confirmar latência p95 <= 15 s.
7. Confirmar custo <= US$ 0,02 por caso no dataset inicial.
8. Registrar aceite humano explícito do gate cognitivo.

## Regra de promoção

Somente declarar **GO PARA F5** quando os oito critérios acima forem comprovados no RC real e o aceite humano estiver registrado.

Até lá, a classificação correta é:

- **SGQ Manager FOCA — piloto operacional controlado:** GO.
- **RC offline / estrutura / suíte de testes:** GO.
- **F4.1 com provider real / F5 cognitivo:** NO-GO.

A credencial de provider deve existir exclusivamente como segredo de ambiente. Não versionar `.env`, chaves, tokens ou relatórios contendo segredo.
