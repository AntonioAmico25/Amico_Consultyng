# AMICO Core — Arquitetura Mestre do Ecossistema

**Status:** arquitetura consolidada para evolução do projeto Amico Consultyng.

## 1. Princípio central

AMICO Core é a camada central de inteligência, governança, regras de negócio, integração e automação do ecossistema. A marca permanece **Amico Consultyng**; nos módulos funcionais evita-se repetir o prefixo “Amico”.

O Core deve conectar SGQ Digital, ERP, MRP, PPCP, BI, relatórios, agentes de IA, automações, documentos, evidências, workflows e integrações externas em uma arquitetura SaaS multiempresa.

## 2. Camadas do ecossistema

### 2.1 Core Platform
- Multiempresa / multitenancy.
- Autenticação e gestão de identidade.
- RBAC por empresa, unidade, área, processo, função e usuário.
- Segregação de dados.
- Trilha de auditoria imutável.
- Workflow e aprovações.
- Notificações e alertas.
- Agenda e tarefas.
- Motor de regras.
- Motor de documentos e evidências.
- APIs e integrações.
- Configuração por cliente sem alterar o núcleo.

### 2.2 Core IA
- Orquestração de agentes especializados.
- Copiloto contextual por módulo.
- Consulta semântica de documentos, registros e indicadores autorizados.
- Análise de risco, tendência, causa, recorrência e impacto.
- Sugestão de ações com validação humana quando exigida.
- Geração assistida de relatórios, análises, planos e evidências.
- Detecção de anomalias e inconsistências.
- Explicabilidade: informar fonte, dado, regra e justificativa da recomendação.
- Memória controlada por empresa e permissões.

### 2.3 Core Dados & BI
- Modelo de dados corporativo comum.
- KPIs por processo e hierarquia.
- Dashboards operacionais, táticos e executivos.
- Relatórios em tela e exportação PDF/Excel.
- Cruzamento de dados entre módulos.
- Séries históricas, tendências e projeções.
- Estoque mínimo, segurança/contingência e previsões.
- Alertas por limites, metas e desvios.

## 3. Módulos funcionais

1. **Direção & Governança** — estratégia, objetivos, riscos, oportunidades, análise crítica, decisões e portfólio.
2. **Sistema de Gestão** — SGQ Digital, documentos, auditorias, NC, CAPA, mudanças, requisitos, compliance, certificações, indicadores e evidências.
3. **Engenharia de Produtos** — cadastros, estruturas, BOM, desenhos, revisões, especificações, protótipos, laboratório e alterações de engenharia.
4. **Engenharia de Processos** — roteiros, operações, métodos, tempos, capacidade, recursos, dispositivos e industrialização.
5. **PPCP** — planejamento, MPS, MRP, capacidade, programação, OPs, OFs, prioridades e reprogramação.
6. **Suprimentos** — compras, cotações, contratos, fornecedores, homologação, necessidades e follow-up.
7. **Logística** — almoxarifado/AX, endereçamento, inventário, rastreabilidade, movimentações, expedição, estoques mínimos e contingência.
8. **Produção** — execução de ordens, apontamentos, WIP, rastreabilidade, consumo, produtividade, qualidade no processo e integração com PPCP.
9. **Recursos Humanos** — estrutura, pessoas, competências, treinamentos, avaliações e registros.
10. **Segurança do Trabalho** — perigos, riscos, controles, inspeções, requisitos, incidentes e planos.
11. **Manutenção Industrial** — ativos, planos, preventiva, corretiva, preditiva, ordens, custos e indicadores.
12. **Ferramentaria** — ferramentas, moldes, dispositivos, disponibilidade, vida útil, manutenção e rastreabilidade.
13. **Comercial & CRM** — clientes, oportunidades, propostas, pedidos, contratos, previsão e pós-venda.
14. **Financeiro & Controladoria** — contas, fluxo de caixa, custos, orçamento, centros de custo, margens e análise gerencial.
15. **BI & Relatórios** — camada transversal de visualização, exploração, exportação e inteligência analítica.

## 4. Agentes especializados

O Core deve disponibilizar agentes especializados, subordinados às permissões do usuário e ao contexto da empresa:

- CEO — visão executiva, prioridades, riscos e decisões.
- Sistema de Gestão — normas, documentos, auditorias, NC, CAPA e evidências.
- Auditor — planejamento, execução, amostragem, achados e follow-up.
- Compliance — requisitos legais, normativos e obrigações.
- Engenharia — produto, processo, alterações, estrutura e análise técnica.
- PPCP/MRP — demanda, materiais, capacidade, ordens e cenários.
- Produção — execução, gargalos, eficiência, desvios e rastreabilidade.
- Suprimentos — fornecedores, compras, lead time, risco e abastecimento.
- Logística — estoque, endereçamento, inventário, cobertura e expedição.
- Manutenção — criticidade, planos, falhas, disponibilidade e backlog.
- RH — competências, treinamentos, capacidade organizacional e registros.
- Segurança — riscos, inspeções, incidentes e controles.
- Comercial — pipeline, clientes, propostas, pedidos e pós-venda.
- Financeiro — custos, margens, orçamento, fluxo e projeções.
- BI/Data Analyst — cruzamentos, tendências, anomalias, previsões e relatórios.

## 5. Regras corporativas transversais

- Toda ação crítica deve registrar usuário, data/hora, origem, alteração e justificativa.
- Toda informação deve respeitar segregação por tenant e RBAC.
- Documentos devem ter versão, revisão, aprovador, validade, histórico e distribuição controlada.
- Não conformidades devem permitir contenção, causa, correção, ação corretiva, responsável, prazo, eficácia e evidências.
- O MRP deve ser executável sob demanda e programável; configuração de referência: três ciclos diários.
- OPs e OFs pertencem ao PPCP, integradas à Produção.
- NC automática pode ser criada por regra de processo, inspeção, auditoria, fornecedor, cliente ou indicador.
- Bloqueios automáticos devem ser configuráveis e permitir desvio/concessão formal aprovada.
- Todos os módulos devem oferecer relatórios em tela e exportação PDF/Excel.
- Todos os módulos devem permitir filtros, drill-down e cruzamentos de dados conforme permissão.
- F1/ajuda contextual deve explicar objetivo, campos, regras, responsabilidades, exemplos e fluxo de cada tela.
- Códigos devem preceder descrições quando aplicável a cadastros e documentos.

## 6. Governança de IA

- IA recomenda; permissões e workflows determinam o que pode ser executado automaticamente.
- Ações de alto impacto exigem aprovação humana configurável.
- Respostas devem distinguir fato, cálculo, inferência, recomendação e hipótese.
- A IA não pode acessar dados fora do tenant ou da autorização do usuário.
- Toda automação relevante deve possuir log de execução, status e tratamento de exceção.
- Prompts, regras e agentes devem ser versionados.
- O sistema deve suportar avaliação de qualidade das respostas e melhoria contínua.

## 7. Integração com SGQ Digital

O SGQ Digital permanece como especialização do módulo **Sistema de Gestão**, contendo, no mínimo:

- Governança.
- Documentos.
- Indicadores.
- Auditorias.
- Não conformidades e planos de ação.
- Controles integrados.
- RQ 045.
- Planilhas e importação de RQs.
- Alertas.
- Agenda.
- Histórico.
- Evidências e trilha de auditoria.

## 8. Estados funcionais

Cada funcionalidade deve possuir um estado explícito:

- **Publicado** — disponível ao usuário final.
- **Homologação** — implementado, porém sujeito a validação.
- **Desenvolvimento** — em construção.
- **Planejado** — aprovado para roadmap, ainda não implementado.

Nenhum recurso planejado deve ser apresentado comercialmente como funcionalidade operacional.

## 9. Prioridade técnica de implantação

1. Multitenancy e modelo de dados.
2. Autenticação, RBAC e segregação.
3. Auditoria e logging.
4. Gestão documental e evidências.
5. Workflow, alertas, agenda e aprovações.
6. Primeiro fluxo operacional completo do SGQ Digital.
7. Cadastros mestres ERP.
8. Engenharia + PPCP/MRP + Produção + Logística/Suprimentos.
9. BI corporativo e relatórios.
10. Agentes IA integrados ao contexto real.
11. Demais módulos empresariais.
12. APIs, marketplace e extensões.

## 10. Critério de arquitetura

O projeto deve evoluir como **plataforma modular integrada**, e não como coleção de páginas independentes. O Core concentra identidade, segurança, dados, workflows, IA, auditoria, relatórios e integrações; os módulos consomem esses serviços compartilhados.