# AMICO SGI Integrado

## Decisão arquitetural

O SGI Integrado é uma capacidade transversal do Ecossistema AMICO, ancorada em `SGQ` e conectada a `GRC`, `DOC`, `BPM`, `IA`, `SEC`, `IAM`, `EHS`, `BI`, `DIR`, `PRJ` e `OPS`. O Manual SGI e o Checklist de Gap Analysis são fontes funcionais controladas. Eles não são, isoladamente, implementação produtiva.

Estado inicial: **fundação funcional para desenvolvimento e homologação**.

## Fluxo canônico

`cliente → escopo → aplicabilidade → diagnóstico → evidências → riscos → plano de ação → dashboard → auditoria → análise crítica → melhoria`

## Bounded contexts

- `sgi-scope`: clientes, unidades, processos, produtos e referenciais aplicáveis.
- `sgi-assessment`: questionários, respostas, amostras, notas e justificativas.
- `sgi-evidence`: evidências versionadas, retenção, integridade e vínculos.
- `sgi-risk`: riscos, oportunidades, controles e aceite residual.
- `sgi-action`: ações, responsáveis, prazos, evidências e eficácia.
- `sgi-audit`: programa, plano, constatações, não conformidades e relatórios.
- `sgi-governance`: indicadores, análise crítica, decisões e melhoria.
- `ai-governance`: inventário de IA, impacto, risco, monitoramento e incidentes.
- `privacy`: tratamentos, bases legais, titulares, operadores e incidentes LGPD.

## Regras não negociáveis

1. Toda entidade carrega `tenant_id`; testes negativos comprovam isolamento.
2. Conformidade, aplicabilidade e encerramento de não conformidade exigem decisão humana rastreável.
3. Evidências são versionadas e não podem ser sobrescritas.
4. Pontuação e maturidade usam método versionado, reproduzível e homologado.
5. Sugestões de IA não equivalem a parecer legal, certificação ou autorização regulatória.
6. Acesso segue menor privilégio, segregação de funções e auditoria.
7. Promoção a produção exige testes E2E, segurança, backup, rollback e aceite formal.

## Contratos mínimos

- `Assessment`: tenant, cliente, unidade, escopo, referenciais, versão do método, status, avaliador e aprovador.
- `AssessmentItem`: requisito, aplicabilidade, resposta, nota, justificativa, evidências e decisão humana.
- `Evidence`: tipo, origem, classificação, hash, versão, retenção, proprietário e permissões.
- `Finding`: critério, fato, evidência, classificação, risco e responsável.
- `Action`: causa, ação, owner, prazo, status, evidência de conclusão e avaliação de eficácia.
- `AiSystem`: finalidade, proprietário, fornecedor, dados, impacto, riscos, controles, monitoramento e incidentes.
- `ProcessingActivity`: finalidade, base legal, titulares, dados, operadores, retenção, compartilhamentos e riscos.

## Critérios de homologação

- jornada completa por cliente e unidade;
- regras de aplicabilidade e N/A testadas;
- cálculos reconciliados com casos de referência;
- evidências e trilha de auditoria íntegras;
- RBAC/ABAC e isolamento multiempresa comprovados;
- fluxos de ação, auditoria e análise crítica homologados;
- avaliações ISO/IEC 42001 e LGPD revisadas por responsáveis competentes;
- acessibilidade, responsividade e exportações validadas;
- observabilidade, backup, restauração e rollback ensaiados.

## Fora de escopo desta integração

- declaração de certificação;
- parecer jurídico definitivo;
- homologação de produto perante Inmetro ou Anvisa;
- migração automática das planilhas para banco de produção;
- concessão de autonomia decisória a agentes de IA.
