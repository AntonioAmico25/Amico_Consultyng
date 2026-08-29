# Agenda Manager v0.1 RC

Produto SaaS independente e módulo transversal do Ecossistema AMICO.

## Escopo desta RC

Fluxo funcional demonstrável com persistência local no navegador:

1. Dashboard
2. Meu Dia
3. Caixa de Entrada Universal
4. Agenda semanal
5. Tarefas com prioridade, prazo e contexto
6. Workspaces
7. Administração e visão de gate
8. F1 contextual
9. Tema claro/escuro
10. PWA/offline básico

## Princípios

- Funciona de forma independente do Teams, Microsoft 365 ou qualquer conector externo.
- Integrações Microsoft/Google são opcionais e ativáveis por cliente.
- IA sugere; pessoas autorizadas decidem.
- Nenhuma integração externa é pré-requisito para tarefas, agenda, Meu Dia ou workspaces.
- Arquitetura-alvo multiempresa, RBAC, auditável e configurável por plano/módulo.

## Estrutura técnica

- `index.html`: RC executável sem build.
- `manifest.webmanifest`: instalação PWA.
- `sw.js`: cache/offline básico.
- `schema.sql`: modelo PostgreSQL inicial da fundação SaaS.

## Gate RC v0.1

| Requisito | Evidência atual | Status |
|---|---|---|
| Navegação modular | UI executável | PASS |
| Tema claro/escuro | UI executável | PASS |
| F1 contextual | UI executável | PASS |
| Criar tarefa | localStorage | PASS |
| Persistir tarefa após recarga | localStorage | PASS |
| Concluir/reabrir tarefa | localStorage | PASS |
| Captura Inbox | localStorage | PASS |
| Inbox → tarefa | localStorage | PASS |
| Criar evento | localStorage | PASS |
| Visualizar próximos 7 dias | UI | PASS |
| Meu Dia | regra local | PASS |
| Workspaces | localStorage | PASS |
| Audit trail RC | log local de ações | PASS PARCIAL |
| Tenant | identificador local | PASS PARCIAL |
| Banco PostgreSQL | schema definido | READY, NÃO EXECUTADO |
| Login/autenticação | fundação backend | PENDENTE |
| RBAC real | fundação backend | PENDENTE |
| RLS multiempresa | banco/backend | PENDENTE |
| Outlook/SharePoint | integração opcional | PENDENTE |
| Teste E2E automatizado | suíte futura | PENDENTE |

## Decisão GO/NO-GO

**GO para homologação funcional da interface e do fluxo local.**

**NO-GO para produção comercial com dados reais** até comprovar autenticação, banco persistente de servidor, RBAC/RLS, backup/restauração, logs imutáveis e testes automatizados.

## Próximo incremento obrigatório

Fundação SaaS: autenticação → tenant → RBAC → PostgreSQL/RLS → API de tarefas/eventos → audit log → testes negativos entre tenants.
