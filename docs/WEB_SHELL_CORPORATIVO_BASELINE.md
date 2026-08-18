# AMICO Web Shell Corporativo — Baseline de Homologação

## Objetivo

Registrar a decisão de arquitetura e o ponto de partida para consolidar, no repositório oficial, a interface corporativa apresentada no ambiente de homologação do projeto AMICO.

## Decisão oficial

A experiência principal do AMICO será **Web responsiva com PWA instalável**, evoluindo depois para distribuição em app sem reconstrução do Core. O shell corporativo aprovado deve ser preservado como referência visual e funcional.

## Baseline visual aprovada

A interface de referência contém, no mínimo:

- menu lateral vertical por módulos com códigos antes das descrições;
- barra superior com seletor de aplicações, identificação do ambiente de Homologação, busca global, idioma, F1, tema e usuário;
- navegação por abas;
- breadcrumbs;
- cards executivos/KPIs;
- tabelas operacionais com status e ações contextuais;
- tema escuro/claro;
- experiência responsiva para desktop, tablet e celular;
- PWA instalável.

A captura de referência apresentada pelo proprietário mostra o módulo `MRP-001 — Planejamento MRP`, com execução e análise do MRP, rotina configurada, propostas de OP e compra, exceções, cobertura média e tabela de necessidades calculadas.

## Central de Agentes

O novo ponto de entrada será:

`IA-001 — Central de Agentes`

Agentes iniciais:

1. CEO / Orquestrador
2. SGQ
3. Auditor
4. Normativo / Compliance
5. Dados / BI
6. Documental
7. Segurança / LGPD

A Central deverá reutilizar integralmente o shell corporativo e as fundações já implementadas nos gates F1–F4.1: tenant, IAM, RBAC/ABAC, trilha de auditoria, RAG autorizado, níveis A0–A4, human-in-the-loop, avaliações e gateway cognitivo.

## Regra de segurança

O shell não altera a regra cognitiva atual. Enquanto o gate F4.1 não estiver formalmente homologado, os agentes permanecem limitados a análise A0/A1 no fluxo cognitivo real. Ações críticas continuam fora do LLM e dependem do Policy Engine, Tool Registry e HumanReview.

## Estado do código-fonte

Foi auditado o repositório `AntonioAmico25/Amico_Consultyng` e suas branches disponíveis. O shell corporativo exibido no ambiente `chatgpt.site` não foi localizado nas árvores Git auditadas até este registro. A branch `main` contém o site institucional e a PWA móvel simplificada; a branch `feat/f4-1-homologacao-cognitiva` contém o backend e o gate cognitivo F4.1.

Por isso, a reconstrução visual não deve substituir silenciosamente o código original do ambiente publicado. A prioridade é recuperar/exportar o fonte da publicação de homologação e incorporá-lo nesta branch.

## Branch de consolidação

`feat/web-shell-corporativo-ia001`

Base: `feat/f4-1-homologacao-cognitiva`

## Ordem de integração

1. Recuperar o código-fonte da publicação `chatgpt.site` aprovada.
2. Comparar o fonte recuperado com esta branch e identificar conflitos.
3. Incorporar o shell preservando o backend F4.1.
4. Criar `IA-001 — Central de Agentes` no menu e roteamento.
5. Integrar CEO, SGQ, Auditor e Normativo inicialmente em modo A0/A1.
6. Adaptar responsividade e PWA sem alterar regras de negócio.
7. Executar testes de regressão visual, navegação, tenant, RBAC e isolamento.
8. Publicar somente em ambiente de homologação.
9. Obter aceite formal antes de merge para `main`.

## Critério de Done

A consolidação do shell somente será considerada concluída quando houver evidência de:

- fonte versionado no GitHub;
- interface visual equivalente ao baseline aprovado;
- `IA-001` acessível pelo shell;
- responsividade desktop/tablet/mobile;
- instalação PWA;
- backend F4.1 preservado;
- tenant e RBAC aplicados;
- testes cross-tenant negativos aprovados;
- ações críticas bloqueadas sem aprovação humana;
- workflow de homologação reproduzível;
- aceite do proprietário.
