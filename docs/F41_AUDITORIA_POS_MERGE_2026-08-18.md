# F4.1 — Auditoria pós-merge

Data: 2026-08-18
Branch: `audit/f41-post-merge-correction`
Baseline auditada: `main` após o merge consolidado do RC.

## Constatação

A `main` incorporou o backend, testes, dataset e documentação do F4.1, porém o workflow `.github/workflows/f41.yml` permaneceu somente com o gate determinístico/offline. A evidência de provider real não estava representada no CI da baseline pós-merge.

## Correção controlada

O workflow F4.1 foi restaurado nesta branch com duas camadas:

1. `f41-offline`: obrigatório em PR para `main` e em push desta branch de auditoria; executa instalação, testes e dataset determinístico.
2. `f41-rc-real`: somente por `workflow_dispatch` com `run_real=true`, depois do offline, usando o environment protegido `f41-rc`.

O job real lê exclusivamente:
- `secrets.AMICO_OPENAI_API_KEY`;
- `vars.AMICO_F41_MODEL`.

Nenhuma credencial ou ID de modelo é gravado no workflow. O job valida presença de ambos antes de chamar o provider.

## Execução auditada do RC real

Foi realizado um disparo controlado one-shot da etapa real exclusivamente para auditoria desta PR e, em seguida, o workflow foi restaurado para `workflow_dispatch` humano exclusivo.

Evidência da execução:
- Workflow: `F4.1 Cognitive Gate`;
- Run: `32167129909`;
- Job offline: `f41-offline` — **SUCCESS**;
- Job real: `f41-rc-real` — **FAILURE**;
- Passo que falhou: `Validate RC secrets`;
- Causa registrada no log: `AMICO_OPENAI_API_KEY ausente no environment f41-rc.`;
- `AMICO_F41_MODEL` também chegou vazio ao runner;
- `Real provider homologation` foi corretamente **skipped**, portanto nenhuma chamada ao provider real foi executada.

## Decisão atual

**NO-GO PARA MERGE DA PR #6 E NO-GO PARA PROMOÇÃO DO F5 ENQUANTO O ENVIRONMENT `f41-rc` NÃO ESTIVER CONFIGURADO.**

O problema não está no código do gateway ou nos testes offline. O bloqueio atual é de configuração segura do ambiente de homologação.

## Critério de aceite da PR corretiva

- gate offline verde na branch;
- workflow real presente e protegido por environment;
- `AMICO_OPENAI_API_KEY` configurada como environment secret em `f41-rc`;
- `AMICO_F41_MODEL` configurado como environment variable em `f41-rc`;
- nenhuma chave/token versionado;
- provider real somente sob acionamento humano explícito;
- execução real com provider concluída;
- thresholds de grounding, segurança, ausência de fonte, isolamento, latência e custo aprovados;
- aceite humano explícito do gate.

## Rastreabilidade

Esta correção não reescreve o histórico nem desfaz o merge consolidado. Ela adiciona o controle ausente sobre a baseline já promovida, preservando a cadeia de evidência do Ecossistema AMICO.
