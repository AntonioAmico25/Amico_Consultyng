# AMICO CONSULTYNG — Auditoria Mestre R00

Data: 25/08/2026
Branch de trabalho: `rc/master-consolidacao-2026-08-25`
Baseline analisada: `main` @ `20243c21d6d951339d38d6ea698b61fe1e1d7df9`
Escopo: repositório GitHub + projeto Supabase conectado + CI/CD + SGQ Manager + PWA/Web + camada cognitiva existente.

## 1. Estado inicial encontrado

### Repositório / versão / branch

- Repositório principal: `AntonioAmico25/Amico_Consultyng`.
- Branch padrão: `main`.
- A branch `main` está sem proteção obrigatória no GitHub no momento desta auditoria.
- Baseline contém site institucional, PWA em `/app`, backend cognitivo F4.1, configurações, documentação e SGQ Manager FOCA.

### Banco / ambiente

- Supabase conectado: projeto `jldmisisyqewmzqhcdob`.
- Região: `ca-central-1`.
- Estado: ACTIVE_HEALTHY.
- PostgreSQL 17.
- Banco possui 1 tenant e 1 empresa cadastrados no momento da verificação.
- Há 1 membership ativo.
- 4 roles e 58 permissions.
- 33 módulos SGQ ativos.

### Migrations

Foram encontradas migrations aplicadas no Supabase desde a fundação 001, hardening de segurança, bootstrap, RQ045, orquestração, 5S, módulos operacionais, permissões, automação, Central de Agentes, integração de agentes com motor de eventos, acesso exclusivo por módulo, catálogo de certificação/portais, redefinição de senha e storage documental.

Gap relevante: as migrations aplicadas no banco não estão versionadas no repositório GitHub analisado. Isso quebra a rastreabilidade plena entre banco e código.

### Autenticação / tenant / RBAC / RLS

- SGQ Manager usa Supabase Auth diretamente no frontend com publishable key.
- O login usa e-mail/senha e busca membership ativa em `user_memberships`.
- O contexto carregado inclui tenant, empresa e role.
- O banco possui RLS habilitado nas tabelas públicas verificadas.
- Existem políticas baseadas em membership e `private.has_permission(...)`.
- `audit_log` possui RLS e leitura condicionada a permissão.
- O frontend declara dados filtrados por RLS/RBAC após autenticação, mas isso não substitui teste de isolamento real.

### Audit Log / rastreabilidade

- `audit_log`: 28 registros no momento da verificação.
- Estrutura inclui tenant, usuário, timestamp, tabela, registro, ação, dados anteriores/novos, motivo, correlation_id, origem, IP e user-agent.
- Existem triggers/funções de auditoria no banco.

### SGQ / dados operacionais

Contagens encontradas:

- Documentos: 1.
- Auditorias: 0.
- Indicadores: 0.
- Riscos: 0.
- NC/CAPA: 0.
- Ações RQ045 abertas: 0.
- Alertas abertos: 2.
- Regras de automação: 5.
- Execuções de automação: 26.

Conclusão: a fundação de dados está mais avançada que o volume operacional real. Várias estruturas existem, mas não podem ser tratadas como E3 apenas por existirem no banco.

### IA / Agentes

- 21 agentes cadastrados.
- Agentes possuem domínio, nível de autonomia, módulos/ações permitidos, ações proibidas e flag de aprovação humana.
- Existem agentes mestres e especializações FOCA.
- `ai_agent_runs`: 0.
- `ai_approvals`: 0.

Classificação: configuração de agentes está em E1/E2 estrutural, não E3 operacional. Não há evidência de execução produtiva real registrada.

### Backend cognitivo

O repositório contém `backend/app/cognitive_gateway.py`, homologação F4.1, dataset controlado e testes. O relatório vigente declara:

- RC offline / estrutura / suíte de testes: GO.
- SGQ Manager FOCA piloto controlado: GO.
- F4.1 com provider real / promoção para F5 cognitivo: NO-GO enquanto faltarem evidências de provider real, grounding, segurança, latência, custo, isolamento cross-tenant e aceite humano.

### Web / PWA / Mobile

- Site principal publicado em GitHub Pages.
- PWA em `/app` com manifest, service worker, ícone e versionamento.
- Correção recente de idiomas restaurou o layout e moveu seleção de idiomas para seletor flutuante.
- O funcionamento visual foi observado anteriormente em iPhone, porém a correção mais recente de idiomas ainda exige novo teste de regressão em Safari/iPhone e desktop.

## 2. Funcionalidades preservadas

- Site institucional.
- PWA Mobile RC.
- SGQ Manager FOCA conectado ao Supabase.
- Autenticação Supabase.
- Contexto tenant/empresa/role.
- RQ045.
- Documentos.
- Catálogo de portais externos.
- Controle de acesso por módulo.
- 5S.
- Motor de eventos/automações.
- Catálogo de agentes IA.
- Audit Log.
- CI F4.1 / RC Consolidado.
- GitHub Pages.

## 3. Duplicidades e riscos de duplicidade

- O banco possui `rq045_actions` e `sgq_nc_capa`; deve-se consolidar o Action Core para impedir planos de ação paralelos por módulo.
- O banco possui `rq045_evidence` e `sgq_evidence`; precisa haver regra clara entre evidência específica de ação e Evidence Core transversal.
- Existem `BI_DATA_ANALYST` e `BI_ANALYST`; a relação mestre/especialização deve ser mantida explícita para evitar dois agentes concorrentes.
- Existem várias políticas SELECT sobre algumas tabelas SGQ: políticas tenant-member e políticas por permission. Isso pode ser intencional, mas deve ser revisado para evitar permissões mais amplas do que o necessário.

## 4. Não conformidades / gaps

### NC-MST-001 — Migrations do banco não versionadas no GitHub

Classificação: NÃO CONFORME
Criticidade: ALTA
Risco: perda de reprodutibilidade, rollback e auditoria técnica.
Correção: exportar e versionar migrations aplicadas em diretório próprio, preservando ordem e checksums.
Critério de aceitação: banco reconstruível a partir do repositório em ambiente limpo.
Status: ABERTA.

### NC-MST-002 — Branch `main` sem proteção

Classificação: NÃO CONFORME
Criticidade: ALTA
Risco: merge/publicação sem gate de CI/review.
Correção: ativar ruleset/branch protection exigindo CI crítico e PR antes de merge.
Critério de aceitação: push direto crítico bloqueado e status checks obrigatórios.
Status: ABERTA.

### NC-MST-003 — Avisos de segurança Supabase

Classificação: NÃO CONFORME
Criticidade: ALTA
Evidência: Supabase Security Advisor apontou:
- tabela `sgq_password_reset_tokens` com RLS e sem policy;
- funções SECURITY DEFINER executáveis por `authenticated` que exigem revisão de grants/intenção;
- proteção contra senha vazada desabilitada.
Risco: superfície de privilégio excessiva e política de senha inferior ao desejável.
Correção: revisar função por função, restringir EXECUTE quando não necessário e habilitar leaked-password protection.
Critério de aceitação: advisor sem WARN não justificado e matriz de RPC autorizadas documentada.
Status: ABERTA.

### NC-MST-004 — Isolamento cross-tenant não testável com dataset produtivo atual

Classificação: NÃO TESTADO
Criticidade: CRÍTICA PARA ESCALA
Evidência: existe apenas 1 tenant no banco operacional conectado.
Risco: não há evidência empírica atual de isolamento entre dois tenants reais no ambiente.
Correção: executar teste em ambiente controlado com pelo menos 2 tenants e usuários distintos.
Critério de aceitação: zero leitura/escrita cross-tenant em CRUD e RPCs.
Status: BLOQUEADA até ambiente de teste adequado.

### NC-MST-005 — Agentes configurados sem execução produtiva registrada

Classificação: PARCIAL
Criticidade: MÉDIA
Evidência: 21 agentes; 0 agent_runs; 0 approvals.
Risco: interface/configuração ser confundida com capacidade operacional.
Correção: manter E1/E2 até rodar fluxo real governado com Audit Log e aprovação.
Status: ABERTA.

### NC-MST-006 — Arquitetura de referência ainda não materializada ponta a ponta

Classificação: PARCIAL
Criticidade: ALTA
Evidência: SGQ Manager acessa Supabase diretamente; backend versionado é principalmente o gateway cognitivo F4.1, não uma API empresarial completa para todos os domínios.
Risco: regras críticas espalhadas entre frontend, RLS e RPCs, dificultando governança e integração.
Correção: introduzir camada de serviço/API progressivamente sem quebrar clientes existentes.
Status: ABERTA.

### NC-MST-007 — Regressão recente de idiomas/layout exige revalidação

Classificação: NÃO TESTADO
Criticidade: MÉDIA
Evidência: correção em `index.html` substituiu barra por seletor flutuante.
Risco: seletor de idioma falhar ou layout divergir entre Windows/Safari/iPhone.
Correção: incluir teste estrutural automático e teste manual Safari/iPhone.
Status: EM CORREÇÃO.

### NC-MST-008 — Baixa evidência operacional de módulos SGQ

Classificação: PARCIAL
Criticidade: MÉDIA
Evidência: 33 módulos ativos, porém auditorias/indicadores/riscos/NC-CAPA sem registros no momento da verificação.
Risco: status visual parecer mais maduro que uso real.
Correção: homologar módulo por fluxo E2E com dados controlados antes de E3.
Status: ABERTA.

## 5. Classificação E0/E1/E2/E3 atual

| Item | Status | Evidência |
|---|---|---|
| Fundação Supabase / tenant / roles / permissions | E2 | Estrutura real e RLS presentes, mas cross-tenant real não retestado |
| SGQ Manager FOCA | E2 | Piloto operacional controlado e persistência real |
| RQ045 | E2 | Tabelas, policies e frontend real; sem ação aberta no snapshot |
| Documentos | E2 parcial | 1 documento real e storage/document manager presentes |
| Auditorias | E1 | Estrutura presente, 0 registros |
| Indicadores | E1 | Estrutura presente, 0 registros |
| Risk Core atual | E1 | `sgq_risks` presente, 0 registros |
| NC/CAPA | E1 | Estrutura presente, 0 registros |
| 5S | E2 | Estruturas, funções e migrations específicas presentes; manter gate de imparcialidade |
| Automação | E2 | 5 regras e 26 execuções registradas |
| Audit Log | E2 | Estrutura + 28 eventos reais |
| Agentes IA | E1/E2 estrutural | 21 agentes configurados; 0 runs e approvals |
| F4.1 offline | E2 | testes/CI aprovados conforme relatório existente |
| F4.1 provider real | E1 | NO-GO vigente |
| PWA/iPhone | E2 de publicação | app publicado; regressão de idiomas necessita reteste |
| ERP corporativo completo | E0/E1 | arquitetura mapeada, não operação E2E completa |

## 6. GO / NO-GO atual

**GO CONDICIONAL para continuidade de desenvolvimento e piloto controlado.**

**NO-GO para declarar plataforma ERP completa E3 ou promover F5 cognitivo/IA operacional plena.**

**NO-GO para expansão multitenant comercial ampla até fechar NC-MST-003 e executar NC-MST-004.**

## 7. Próxima evolução priorizada

P0 imediato:

1. Versionar migrations reais do Supabase no GitHub.
2. Fechar Security Advisor com análise de RPC SECURITY DEFINER e política de password reset.
3. Implementar regras de branch protection/ruleset.
4. Criar suíte automática de regressão estrutural Web/PWA/SGQ Manager, incluindo idiomas e ausência de segredos.
5. Criar ambiente controlado de dois tenants para teste RLS/RBAC E2E.

Somente após P0: consolidar Action Core, Risk Core, Document Core, Indicator Core, Notification Core, Workflow Core e Evidence Core, reutilizando as tabelas já existentes.