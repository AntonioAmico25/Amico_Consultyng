# RC de Consolidação AMICO — 2026-08-18

## Objetivo
Consolidar, sobre a `main` atual, os componentes já aprovados do Ecossistema AMICO sem perder o layout restaurado do SGQ Manager FOCA nem misturar funcionalidades ainda não homologadas.

## Base
- Base: `main` no commit `e52867290ed66d77156b633b16c13f173713e5cf`.
- F4.1: componentes incorporados seletivamente a partir de `feat/f4-1-homologacao-cognitiva`.
- Web Shell corporativo: baseline visual permanece referência; integração funcional será feita após recuperação completa do shell e testes.
- AMICO AI v0.9.0: pacote local aprovado como fonte de consolidação para Marketplace, Engineering Factory, identidade comercial, créditos e Web/PWA; entrada será seletiva e testada, não sobrescrita em bloco.

## Componentes já incorporados neste RC
- Workflow `F4.1 Cognitive Gate`.
- Backend cognitivo F4.1.
- Dataset controlado F4.1.
- Testes F4.1.
- Relatórios e documentação do gate.

## Regras de não regressão
1. Não alterar o layout aprovado do SGQ Manager FOCA sem teste visual.
2. Não promover F5 sem GO formal do F4.1.
3. Nenhum LLM recebe autonomia crítica direta.
4. Tenant, RBAC/ABAC, Audit Log e Human-in-the-loop permanecem obrigatórios.
5. Nenhuma funcionalidade será marcada como concluída apenas por possuir tela.

## Próximas ondas do RC
### Onda A — Fundação AMICO AI
- identidade pessoal/corporativa;
- tenant pessoal;
- Free Tier;
- UsageEvent;
- CreditLedger;
- shadow billing;
- catálogo/Marketplace humanizado.

### Onda B — Engineering / Artifact Factory
- Project, Requirement, Artifact;
- App Factory;
- Spreadsheet/Dashboard/Document Factory;
- GitHub integration;
- Build/Test/Deployment;
- API Keys AMICO e referências seguras de secrets.

### Onda C — P1 Industrial Core
- TechnicalAsset;
- ProductRevision;
- MachineProgram;
- ToolingResource;
- MetrologyAsset;
- IndustrialAsset;
- ScrapRecord;
- QualityEvent;
- DomainEvent.

### Onda D — Web/PWA
- incorporar IA-001 ao shell corporativo;
- Marketplace AMICO AI;
- Criar com a AMICO;
- experiência responsiva/PWA;
- UAT desktop/iPhone/Android.

## Gate final
`CI consolidado → segurança → cross-tenant → testes E2E → F4.1 real → UAT → GO/NO-GO → merge`.
