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

## Critério de aceite da PR corretiva

- gate offline verde na branch;
- workflow real presente e protegido por environment;
- nenhuma chave/token versionado;
- provider real somente sob acionamento humano explícito;
- PR corretiva aberta contra `main` apenas após o gate offline verde;
- GO definitivo para F5 continua dependente da execução real no `f41-rc` e dos thresholds do relatório F4.1.

## Rastreabilidade

Esta correção não reescreve o histórico nem desfaz o merge consolidado. Ela adiciona o controle ausente sobre a baseline já promovida, preservando a cadeia de evidência do Ecossistema AMICO.
