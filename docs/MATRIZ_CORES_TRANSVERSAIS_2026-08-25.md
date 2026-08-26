# Matriz de Cores Transversais — 25/08/2026

Objetivo: aplicar a regra anti-duplicidade do Prompt Mestre e identificar o que já existe no Supabase conectado antes de criar novos cores.

## Resultado do inventário

| Core Mestre | Implementação existente principal | Cobertura atual | Gap principal | Decisão |
|---|---|---|---|---|
| Action Core | `rq045_actions`, `rq045_evidence`, `rq045_transitions` | tenant, empresa, origem, tipo, descrição/plano, responsável, setor, prioridade, prazo, status, validador, eficácia, evidência, metadata, histórico temporal | faltam campos explícitos universais para processo, categoria, anomalia, causa, coparticipantes e risco; parte pode estar em metadata | **AMPLIAR, NÃO CRIAR NOVA TABELA DE AÇÕES** |
| Risk Core | `sgq_risks` | tenant, empresa, código, tipo, responsável, probabilidade, impacto, score, tratamento, prazo, status e vínculo RQ045 | faltam causa, consequência, controles existentes, risco residual, evidência/eficácia e histórico explícitos | **AMPLIAR `sgq_risks`** |
| Document Core | `sgq_documents`, `sgq_document_revisions` | tipo, revisão, status, responsável, vigência, revisão futura, arquivo, histórico de revisão/aprovação | vínculos universais com processo/requisito/treinamento/relacionados e distribuição/obsolescência precisam consolidação | **AMPLIAR** |
| Evidence Core | `sgq_evidence`, `rq045_evidence`, evidências JSON em módulos | evidência contextual, entidade, arquivo, checksum, captura, tenant | duplicidade conceitual entre evidência universal, RQ045 e campos JSON; falta contrato canônico | **DEFINIR `sgq_evidence` COMO CORE E ADAPTAR ESPECIALIZAÇÕES** |
| Indicator Core | `sgq_indicators`, `sgq_indicator_values` | fórmula/regra, meta/faixas, frequência, dono, valores e status | generalizar além de SGQ e padronizar gatilho de análise/ação | **AMPLIAR** |
| Notification Core | `notifications`, `sgq_alerts` | notificação por usuário + alertas por módulo/entidade | definir contrato entre alerta de negócio e entrega ao usuário; evitar dois subsistemas concorrentes | **INTEGRAR, NÃO DUPLICAR** |
| Workflow Core | `sgq_events`, estados/transições por módulo, automações | event_type, origem, payload, retries, status e motor de eventos existente | falta motor universal de estados/alçadas/RACI/delegação/SLA comprovado | **EVOLUIR SOBRE EVENT ENGINE** |
| Audit Core | `audit_log`, auditorias funcionais `sgq_audits`/findings | before/after, ator, tempo, origem, correlação + auditoria SGQ | consolidar convenções de action/source e imutabilidade comprovada | **PRESERVAR E ENDURECER** |
| Training Core | `sgq_trainings`, `sgq_training_requirements` | requisitos, agenda, conclusão, instrutor, evidência | competência, matriz, validade, avaliação e vínculo documental precisam ampliar | **AMPLIAR** |
| AI Agent Core | `ai_agents`, tasks, runs, approvals, proposals, context, routes | agentes, tarefas, execuções, aprovações, propostas, fontes e roteamento | fechamento do F4.1 e integração governada ao Gateway/RAG | **PRESERVAR; F5 BLOQUEADO** |
| Integration Core | portais, eventos, sync jobs/cycles, APIs do Supabase | catálogos externos, jobs, eventos e ciclos 3x/dia | catálogo universal de conectores, idempotência/outbox e contratos versionados | **EVOLUIR** |
| Reporting / BI Core | indicadores e dashboards web atuais | KPIs SGQ e painéis | camada semântica e relatórios universais tela/PDF/Excel ainda não comprovados | **EVOLUIR** |
| Master Data Core | tenants, companies, units, departments, profiles, roles, permissions | estrutura organizacional e IAM persistidos | governança universal de cadastros mestres e deduplicação | **AMPLIAR** |
| Change Management Core | não identificado como core persistente único nesta inspeção | conceitos dispersos | entidade/fluxo transversal ainda não comprovado | **GAP — projetar após P0/P1** |
| Compliance Core | requirements, certifications, risks, audits e portais normativos | componentes relevantes já existem | falta agregação universal requisito→controle→evidência→ação | **INTEGRAR, NÃO CRIAR SILO** |

## Regras consolidadas

1. `rq045_actions` passa a ser a base candidata do **Action Core universal**, mediante evolução compatível e migrations controladas.
2. `sgq_risks` passa a ser a base candidata do **Risk Core**.
3. `sgq_documents` + `sgq_document_revisions` formam a base do **Document Core**.
4. `sgq_evidence` deve ser tratado como repositório canônico de evidências; tabelas/JSON específicos devem referenciar ou especializar o core, não substituí-lo.
5. `sgq_events` é a base do **Event/Workflow Core**, mas ainda não equivale a um BPM/workflow universal completo.
6. `audit_log` deve continuar único como trilha técnica transversal; `sgq_audits` representa auditoria de gestão, não substitui o Audit Log.
7. Nenhum novo módulo deve criar tabela de ações, riscos, documentos, evidências, indicadores, notificações ou agentes sem justificar por que o core existente não atende.

## Status

Classificação geral desta matriz: **E2 — arquitetura baseada em entidades reais do banco, ainda pendente de evolução/homologação universal por core**.
