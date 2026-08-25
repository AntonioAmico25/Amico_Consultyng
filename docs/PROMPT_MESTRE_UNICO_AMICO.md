# AMICO CONSULTYNG — PROMPT MESTRE ÚNICO

Revisão: R00
Data-base: 25/08/2026
Status: ATIVO COMO REGRA MESTRE DE EVOLUÇÃO

## Princípio mestre

AMICO CONSULTYNG é tratado como plataforma empresarial integrada: ERP + SGQ/QMS + BPM + GRC + BI + planejamento + automação + gestão documental + riscos + pessoas + agentes de IA + integrações empresariais.

Objetivo: evoluir o sistema existente sem apagar, regredir ou duplicar funcionalidades aprovadas, com arquitetura modular, multitenant, segura, auditável, escalável e integrada.

Sequência obrigatória de execução:

1. Consolidar.
2. Implementar.
3. Testar.
4. Auditar.
5. Homologar.
6. Emitir GO / GO CONDICIONAL / NO-GO.
7. Documentar e definir a próxima evolução.

## Regras de consolidação

Antes de qualquer alteração funcional, levantar versão, branch, ambiente, banco, migrations, autenticação, usuários, tenants, RBAC, RLS, módulos, rotas, componentes, agentes, automações, integrações, workflows, dashboards, documentos, testes, CI/CD e erros conhecidos. Preservar o que estiver funcional e aprovado, procurar duplicidades, gaps, regressões e dependências e classificar cada item em E0 Planejado, E1 Protótipo, E2 Homologado ou E3 Operacional. Nunca declarar E3 sem evidência real.

## Arquitetura macro obrigatória

Governança; Estratégia; Processos; Operação; Ferramentas de Gestão; BI/Indicadores; IA/Agentes; Automações; Documentos/Evidências; Riscos/Compliance; Integrações.

## Setores e módulos

Direção, Estratégia, SGQ, Engenharia de Produto, Engenharia de Processo, Desenvolvimento, PPCP, Produção, Montagem, Logística, Expedição, Almoxarifado, Suprimentos, Qualidade de Fornecedores, Manutenção, Ferramentaria, Laboratório, Metrologia, RH, Treinamentos, SST, Meio Ambiente, ESG, Financeiro, Controladoria, Fiscal, Contábil, Comercial, Marketing, CRM, Pós-vendas, Assistência Técnica, Garantia, Recall, TI, Segurança da Informação, Jurídico, Compliance, Projetos, Auditorias, Documentação, Riscos, Facilities, Frota, Gestão de Ativos e CEO Master.

## Ferramentas transversais

PDCA, MASP, 8D, CAPA, DMAIC, A3, 5 Porquês, Ishikawa, Pareto, 5W2H, GUT, RACI, SWOT, PESTEL, BSC, OKR, Hoshin Kanri, SIPOC, BPMN, VSM, FMEA/DFMEA/PFMEA, APQP, PPAP, MSA, CEP/SPC, DOE, Lean, Kaizen, 5S, TPM, RCM, SMED, Poka-Yoke, Kanban, Heijunka, Andon, Jidoka, OEE, Takt Time, MTBF, MTTR, MRP/MRP II, CRP, APS, S&OP, Kraljic, TCO, Supplier Scorecard, 9 Box, PDI, DRE, EBITDA, ROI, ROIC, Payback, CRM, CAC, LTV, NPS, CSAT, PMBOK, Scrum, Kanban de Projetos, EAP/WBS, ITIL, COBIT, APR, JSA, Bow-Tie, ERM, Benchmarking, Análise de Cenários, Gestão de Mudanças e Plano de Contingência.

## Implementação técnica

Priorizar gaps críticos e reutilizar tabelas, componentes, APIs, serviços, workflows, agentes, automações, indicadores e cadastros existentes antes de criar novos recursos. Garantir multitenancy, RBAC, RLS, Audit Log, histórico, rastreabilidade e Human-in-the-Loop quando necessário.

Arquitetura de referência: Frontend → API/Backend → Serviços → Motor de Eventos → Orquestrador → Agentes IA → Banco → Audit Log → BI.

## Cores transversais

Action Core; Risk Core; Document Core; Audit Core; Indicator Core; Notification Core; Workflow Core; Evidence Core; Training Core; AI Agent Core; Integration Core; Reporting/BI Core; Master Data Core; Change Management Core; Compliance Core.

### Action Core

Estrutura comum: ID, origem, tenant, empresa, unidade, processo, setor, categoria, problema/anomalia, causa, ação, responsável, coparticipantes, prioridade, risco, prazo, status, evidência, eficácia, aprovação e histórico.

### Risk Core

Risco, causa, consequência, probabilidade, impacto, criticidade, controles, risco residual, ação, responsável, prazo, evidência, eficácia, status e histórico. Categorias incluem estratégico, financeiro, operacional, qualidade, fornecedor, cliente, mercado, produto, processo, projeto, ambiental, SST, jurídico, compliance, LGPD, TI, cibernético e reputacional.

### Document Core

Manual, procedimentos, instruções, documentos complementares, registros, formulários, modelos, revisões, aprovação, distribuição, obsolescência, histórico, treinamentos vinculados, documentos relacionados e evidências. Estados: Rascunho, Em revisão, Em aprovação, Aprovado, Publicado e Obsoleto.

## Motor de eventos

EVENTO → ORQUESTRADOR → REGRA → CONTEXTO → AGENTE ESPECIALIZADO → ANÁLISE → RISCO → RECOMENDAÇÃO → APROVAÇÃO HUMANA QUANDO APLICÁVEL → AÇÃO → EVIDÊNCIA → AUDIT LOG → BI → HISTÓRICO.

## Agentes de IA

Arquitetura orquestrada com Diretor Executivo, Estratégia, SGQ, Auditor, Normativo, Documental, Indicadores, Riscos, Engenharia, Produção, PPCP, Manutenção, Logística, Suprimentos, RH, Financeiro, Comercial, Marketing, Projetos, Segurança, ESG, Compliance, TI, Dados e BI.

A IA pode analisar, calcular, cruzar dados, identificar desvios, sugerir, priorizar, preencher, preparar documentos, gerar planos, criar rascunhos e sugerir decisões. Operações críticas exigem regra de autorização adequada.

## Human-in-the-Loop obrigatório

Aplicar conforme criticidade em aprovação documental, encerramento de NC, mudanças estruturais, alteração de acesso/política, liberação de pagamento, exclusão de dados, publicação em produção, ações irreversíveis, aprovação legal e mudança de cadastro mestre crítico.

## Banco e rastreabilidade

Entidades relevantes devem considerar tenant_id, company_id, business_unit_id, department_id, process_id, owner_id, status, revision, source, created_by, created_at, updated_by e updated_at. Operações críticas devem registrar quem, quando, onde, o quê, valor anterior/posterior, motivo, origem, aprovação e evidência.

## Testes obrigatórios

Unitário, integração, CRUD, autenticação, autorização, RBAC, RLS, isolamento entre tenants, validações, workflows, aprovações, Audit Log, histórico, alertas, agenda, indicadores, dashboard, importação/exportação, responsividade, desktop, tablet, mobile, Safari/iPhone, idiomas, tratamento de erros, segurança, performance, integrações e regressão.

Interface visual não é evidência suficiente de funcionalidade.

## Auditoria

Auditar requisitos funcionais e não funcionais, interface, navegação, responsividade, mobile, idiomas, banco, persistência, autenticação, RBAC, RLS, tenant, segurança, Audit Log, histórico, versionamento, workflows, aprovações, alertas, agenda, indicadores, dashboard, IA, HITL, integrações, importação/exportação, erros, performance, disponibilidade, logs, backup, documentação, testes, CI/CD, publicação, links, dados existentes e regressões.

Classificação: CONFORME, PARCIAL, NÃO CONFORME, NÃO TESTADO, NÃO APLICÁVEL. Toda NC deve registrar ID, descrição, evidência, causa provável, risco, criticidade, correção, ação corretiva, responsável quando conhecido, dependência, critério de aceitação e status.

## Homologação e GO/NO-GO

E0 = requisito definido sem implementação funcional; E1 = protótipo/implementação parcial; E2 = testado e homologado em ambiente controlado; E3 = validado em produção com evidência real.

Não publicar quando houver falha crítica de autenticação/autorização, RLS quebrada, vazamento entre tenants, risco de perda/corrupção de dados, regressão severa, CI crítico falhando ou bloqueador de segurança.

## Definition of Done

Conforme aplicabilidade: interface, banco, CRUD, validações, RBAC, RLS, Audit Log, histórico, pesquisa, filtros, indicadores, dashboard, alertas, exportação, importação, responsividade, tratamento de erros, segurança, integração, documentação, testes e homologação.

## Anti-duplicidade

Antes de criar recurso novo, procurar tabela, componente, serviço, API, workflow, agente, automação, indicador e cadastro mestre existentes. Reutilizar e ampliar antes de criar.

## Prioridade

P0 Fundação: Governança, Tenant, Usuários, RBAC, RLS, Audit Log, Cadastros Mestres.
P1 Cores Transversais: Document, Action, Risk, Indicator, Notification, Workflow, Evidence.
P2 SGQ.
P3 Operações.
P4 Gestão.
P5 BI.
P6 IA.
P7 Comercialização.

## Entrega obrigatória por ciclo

Estado inicial, preservações, implementações, correções, duplicidades, gaps, arquivos e migrations alterados, testes/resultados, NCs, correções, pendências, bloqueadores, riscos, evidências, E0–E3 por item, status geral, GO/GO CONDICIONAL/NO-GO, histórico de revisão e próxima evolução.

## Regra final

Executar as fases na ordem definida, até o limite real das ferramentas e acessos. Não inventar implementação, teste, publicação ou evidência. Dependências externas indisponíveis devem ser registradas como BLOQUEADA ou PENDENTE sem impedir as demais atividades possíveis.