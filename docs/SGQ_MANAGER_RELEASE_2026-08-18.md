# SGQ Manager FOCA — Registro de Liberação Controlada

Data: 18/08/2026
Status: **LIBERADO PARA PILOTO OPERACIONAL CONTROLADO**

## Escopo desta liberação

Esta liberação cobre o SGQ Manager FOCA na baseline atual da `main`, incluindo a restauração do layout aprovado, fluxo de autenticação e redefinição de senha MASTER, tratamento de tenant/membership ativo, versionamento de assets/cache e integração com a baseline consolidada do ecossistema.

## Evidências técnicas

- Layout aprovado restaurado no commit `e52867290ed66d77156b633b16c13f173713e5cf`.
- RC consolidado executado no commit `e127b845b3646475cb7abdbda7068d203efd9c9d`.
- Workflow `RC Consolidado`, run `32155667353`: **success**.
- Workflow `F4.1 Cognitive Gate`, run `32155667391`: **success**.
- No RC Consolidado foram aprovados: instalação, testes F4.1, dataset offline e verificações estruturais.
- Merge consolidado incorporado à `main` no commit `183ffec8e3d4d5fb59ce8ac28dd83d443cd24a18`.

## Limite de escopo

A liberação do **SGQ Manager para piloto operacional** não significa liberação automática do **Gate F4.1 para F5 cognitivo**.

O F4.1 permanece em **NO-GO PARA F5** enquanto não houver evidência de execução real no ambiente RC com provider OpenAI autorizado e atendimento dos thresholds definidos no relatório `backend/F4_1_RELATORIO_GO_NO_GO.md`.

Portanto:

- **SGQ Manager FOCA / piloto operacional:** GO controlado.
- **RC offline e testes estruturais:** GO.
- **F4.1 com provider real / promoção para F5:** NO-GO até fechamento das evidências específicas.

## Regra de governança

Nenhum documento, commit ou interface deve declarar “F5 aprovado” enquanto os critérios cognitivos reais não forem comprovados. A evolução do SGQ Manager pode continuar dentro do piloto operacional sem violar esse bloqueio.

## Decisão

**SGQ Manager FOCA corrigido e autorizado para disponibilização em piloto operacional controlado em 18/08/2026.**
