# AMICO CONSULTYNG — Consolidação Mestre

Data-base: 25/08/2026
Branch de auditoria: `audit/master-consolidacao-2026-08-25`
Baseline preservada: `main` em `20243c21d6d951339d38d6ea698b61fe1e1d7df9`

## 1. Princípio de execução

Sequência obrigatória: CONSOLIDAR → IMPLEMENTAR → TESTAR → AUDITAR → HOMOLOGAR → GO/NO-GO → DOCUMENTAR/EVOLUIR.

Não declarar E3 sem evidência real em produção. Não recriar recurso existente antes de inventário e análise de dependência.

## 2. Estado real encontrado

### Repositório e publicação
- Repositório oficial: `AntonioAmico25/Amico_Consultyng`.
- Branch padrão: `main`.
- GitHub Pages, PWA e shell web presentes.
- Workflows presentes: `pages.yml`, `rc-consolidado.yml` e `f41.yml`.
- Commits recentes incluem correções de idiomas/UX, atualização coordenada Web/PWA/SGQ Manager e governança IA de 24/08.

### SGQ Manager FOCA
- Estrutura física presente em `sgq-manager-foca/`.
- Arquivos principais: `index.html`, `app.js`, `navigation.js`, `doc-manager.js`, `functional-fix.js`, `recovery.js`, `patch-r6.js`, `styles.css`, `ai-governance.json`.
- Histórico recente registra gestão documental MASTER, importador de RQs, proteção contra regressão de navegação e integração de governança IA.
- Existe PR aberta de reconciliação de dados (#8), ainda não incorporada à `main`.

### IA / F4.1
- Backend cognitivo presente em `backend/` com Gateway Cognitivo, homologação, dataset controlado e testes.
- Relatório atual da `main` mantém NO-GO para F5 até fechar evidência com provider real.
- O workflow `f41.yml` da `main` estava regressado para homologação exclusivamente offline.
- PR antiga #6 contém correção pós-merge, porém está 34 commits atrás da `main`; não deve ser mergeada diretamente.
- Nesta branch mestre o gate real foi restaurado sobre a `main` atual, sem reaproveitar histórico obsoleto.

### Fundação SaaS externa ao repositório principal
O pacote técnico `AMICO_SaaS_Fundacao_Tecnica_v0.1.0` disponível no projeto contém FastAPI, PostgreSQL, autenticação JWT/Argon2, RBAC, `organization_id`, Audit Event e fluxo de não conformidade com teste de isolamento entre duas empresas. Não há evidência suficiente nesta auditoria de que esse pacote tenha sido integrado integralmente à `main` atual ou promovido a produção.

## 3. Classificação de maturidade

| Item | Situação | Maturidade |
|---|---|---|
| Site/Web institucional | publicado e atualizado | E3 para publicação web; funcionalidade empresarial não inferida |
| PWA | código/versionamento presentes; homologação governada | E1/E2 conforme fluxo específico |
| SGQ Manager FOCA | piloto operacional controlado documentado; múltiplas funções presentes | E2; E3 somente por função com evidência produtiva |
| Gestão documental SGQ | código e histórico de integração presentes | E2, sujeito a reconciliação de dados |
| Importador de RQs | correções e CI dedicados no histórico | E2 |
| Fundação SaaS FastAPI do pacote v0.1.0 | executável e testável fora da `main` | E1/E2; integração pendente |
| IAM/RBAC/RLS corporativo completo | arquitetura definida, evidência fragmentada entre pacotes/ambientes | E1/E2; não promover globalmente |
| Gateway Cognitivo F4.1 offline | testes/dataset aprovados | E2 |
| Gateway Cognitivo F4.1 provider real | credencial validada anteriormente; execução real ainda sem fechamento dos thresholds | E1/E2 parcial |
| F5 RAG vetorial/memória/agentes operacionais | bloqueado pelo gate F4.1 | E0 |
| Governança IA 24/08 | baseline e contratos incorporados à main | E2 documental/arquitetural |
| Android | PR #1 aberta em homologação | E1 |
| SGI transversal | PR #2 aberta/draft | E1 |

## 4. Duplicidades e riscos de regressão

1. PRs antigas #4 e #6 tratam do mesmo gate F4.1 e estão divergentes da `main`; risco de regressão se forem mergeadas diretamente.
2. PR #8 foi criada antes de diversas atualizações posteriores da `main`; precisa ser rebaseada/recriada antes de promoção.
3. Existem duas fundações técnicas: backend cognitivo na `main` e pacote SaaS FastAPI separado. Devem ser reconciliadas por arquitetura, não fundidas automaticamente.
4. A arquitetura de dados/tenant/RBAC não deve ser declarada globalmente E3 enquanto persistirem fontes distintas de implementação e ausência de prova consolidada de RLS/migrations na baseline pública.
5. O workflow F4.1 da `main` não representa o gate real; correção foi aplicada somente nesta branch de auditoria.

## 5. Gaps críticos priorizados

### P0
- Consolidar fonte oficial de banco, migrations, IAM, tenant, RBAC e RLS.
- Comprovar isolamento cross-tenant no ambiente integrado real.
- Preservar Audit Log e histórico em todos os fluxos críticos.

### P1
- Unificar Action Core, Risk Core, Document Core, Evidence Core, Indicator Core, Notification Core e Workflow Core antes de expandir módulos.

### P2
- Reconciliar dados existentes do SGQ Manager sem sobrescrever registros.
- Fechar gestão documental, NC/CAPA, auditorias, indicadores, treinamentos, metrologia e rastreabilidade com evidência E2 por fluxo.

### P6 / gate cognitivo
- Executar F4.1 real com modelo válido e medir grounding, segurança, sem-fonte, cross-tenant, latência e custo.
- Registrar aceite humano antes de F5.

## 6. Não conformidades da auditoria inicial

### NC-MASTER-001 — Gate F4.1 real ausente na `main`
- Classificação: NÃO CONFORME.
- Evidência: `.github/workflows/f41.yml` da `main` executa apenas provider determinístico/offline.
- Risco: promoção indevida para F5 sem evidência real.
- Correção: restaurado gate real nesta branch mestre com `environment: f41-rc`, secret de API, variável de modelo e acionamento manual.
- Critério de aceitação: offline verde + execução real verde + thresholds do relatório atendidos + aceite humano.
- Status: CORRIGIDO NA BRANCH / PENDENTE HOMOLOGAÇÃO.

### NC-MASTER-002 — PRs F4.1 obsoletas e divergentes
- Classificação: PARCIAL.
- Evidência: PR #6 está 34 commits atrás da `main`; PR #4 permanece aberta e antiga.
- Risco: regressão e reintrodução de baseline ultrapassada.
- Ação: não mergear; substituir por PR criada a partir desta branch mestre após CI.
- Status: ABERTA.

### NC-MASTER-003 — Fonte única de dados/migrations não comprovada
- Classificação: NÃO TESTADO.
- Evidência: pacote SaaS externo contém modelos SQLAlchemy; repositório público atual não apresenta, nesta inspeção, uma cadeia única e comprovada de migrations/RLS para todo o ERP.
- Risco: inconsistência entre shell, SGQ Manager e backend.
- Ação: inventário técnico específico de banco e ambiente conectado antes de expansão P0/P1.
- Status: ABERTA.

## 7. Decisão atual

**GO CONDICIONAL para continuar consolidação, testes e auditoria na branch.**

**NO-GO para merge automático desta branch e NO-GO para F5** até a execução do gate real e fechamento das NCs críticas aplicáveis.

## 8. Próxima sequência

1. Executar CI da branch mestre.
2. Abrir PR corretiva contra `main` somente após CI verde.
3. Executar `f41-rc-real` manualmente no environment `f41-rc`.
4. Avaliar logs e métricas.
5. Atualizar relatório F4.1 e este relatório mestre.
6. Emitir GO/NO-GO para merge e, separadamente, GO/NO-GO para F5.
7. Em seguida, iniciar inventário P0 de banco/migrations/IAM/tenant/RBAC/RLS e cores transversais.
