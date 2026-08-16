# Amico Consultyng — Ecossistema Corporativo

A **Amico Consultyng** evolui como um ecossistema modular de gestão empresarial, integrando **Sistema de Gestão, ERP, MRP, PPCP, BI, automação e inteligência artificial**.

## AMICO Core

O **AMICO Core** é a camada central de arquitetura, governança, segurança, dados, workflows, IA e integrações do ecossistema.

Documentação oficial da arquitetura:

- [`docs/AMICO_CORE_ARQUITETURA.md`](docs/AMICO_CORE_ARQUITETURA.md) — arquitetura mestre, módulos, agentes, regras e prioridades técnicas.
- [`config/amico-core.json`](config/amico-core.json) — manifesto estruturado de capacidades para evolução técnica e integrações.

## SGI Integrado

O **SGI Integrado** consolida manual, diagnóstico, evidências, riscos, plano de ação, auditoria, análise crítica, gestão de IA e privacidade como capacidade transversal vinculada ao SGQ Digital.

- [`docs/AMICO_SGI_ARQUITETURA.md`](docs/AMICO_SGI_ARQUITETURA.md) — fluxo, bounded contexts, controles e critérios de homologação.
- [`config/amico-sgi.schema.json`](config/amico-sgi.schema.json) — contrato mínimo para avaliações e itens de diagnóstico.
- Estado inicial: **fundação funcional para desenvolvimento e homologação**.

## Estrutura funcional

O ecossistema contempla:

- Direção & Governança
- Sistema de Gestão / SGQ Digital
- Engenharia de Produtos
- Engenharia de Processos
- PPCP + MRP + OPs/OFs
- Suprimentos
- Logística
- Produção
- Recursos Humanos
- Segurança do Trabalho
- Manutenção Industrial
- Ferramentaria
- Comercial & CRM
- Financeiro & Controladoria
- BI & Relatórios
- Central de IA com agentes especializados

## Diretrizes de produto

- A marca é **Amico Consultyng**; evita-se repetir “Amico” antes dos nomes dos módulos.
- O sistema deve operar como **plataforma modular integrada**, não como páginas independentes.
- Recursos críticos devem utilizar multitenancy, autenticação, RBAC, segregação de dados e trilha de auditoria.
- Todos os módulos devem possuir relatórios em tela e exportação PDF/Excel, conforme permissão.
- IA e automações devem respeitar permissões, contexto da empresa, logs e aprovações humanas configuráveis.
- OPs e OFs pertencem ao PPCP e integram Produção, Engenharia, Suprimentos e Logística.
- O MRP deve ser executável sob demanda e programável; referência padrão: três ciclos diários.

## Estados de evolução

Cada recurso deve ser identificado como:

- **Publicado**
- **Em homologação**
- **Em desenvolvimento**
- **Planejado**

Recursos planejados não devem ser apresentados como funcionalidades já operacionais.

## Estrutura publicada atualmente

O repositório contém o site institucional em `index.html`, com apresentação do SGQ Digital, OS SaaS, Central IA, BI/Relatórios, módulos corporativos, implantação e roadmap.

## Segurança de publicação

Este repositório público não deve conter:

- dados ou identidade visual de clientes sem autorização;
- documentos internos ou confidenciais;
- código privado de produtos SaaS;
- arquivos `.env`, tokens ou chaves;
- contratos editáveis ou planejamento financeiro interno.

## Arquivo principal do site

`index.html`
