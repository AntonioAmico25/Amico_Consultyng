# RC Consolidado AMICO — manifesto de integração

Este RC nasce da `main` atual e consolida somente componentes aprovados e rastreáveis. O objetivo é absorver as evoluções AMICO AI, F4.1, Web/PWA e P1 Industrial sem regressão do SGQ Manager FOCA.

## Status inicial
- Base atual da `main`: preservada.
- F4.1: backend, dataset, testes, workflow e documentação incorporados seletivamente.
- Web Shell: baseline documental incorporado; código visual ainda será reconciliado sem substituir o layout aprovado.
- AMICO AI v0.9.0: entrada planejada em ondas, com Marketplace, Engineering Factory, identidade, créditos e shadow billing.
- Política Corporativa de IA `POL-IA-001 R00`: incorporada em **homologação**, com matriz de risco, Human-in-the-Loop, segregação multitenant, Audit Log e gates GO/NO-GO.
- Configuração operacional de governança: `config/ai-governance-2026-09-01.json`.
- Produção: bloqueada até CI consolidado, UAT e GO/NO-GO.

## Definition of Done deste RC
1. CI consolidado verde.
2. Nenhuma regressão visual ou funcional do SGQ Manager FOCA.
3. Cross-tenant 100% negado nos testes críticos.
4. Marketplace/Free Tier/Usage/Credit Ledger persistentes e auditáveis.
5. Artifact Factory versionada e com revisão humana.
6. Web/PWA responsiva validada.
7. F4.1 concluído com provider real e evidências.
8. `POL-IA-001 R00` homologada com evidência de RBAC/isolamento, Human-in-the-Loop e Audit Log.
9. GO/NO-GO formal antes do merge ou promoção para produção.
