# Auditoria P0 — Supabase / IAM / Tenant / RBAC / RLS

Data: 25/08/2026
Projeto auditado: Supabase conectado ao SGQ Manager FOCA
Método: inspeção read-only de catálogo PostgreSQL, migrations, advisors e contagens agregadas. Nenhuma credencial foi registrada.

## 1. Estado confirmado

- Projeto Supabase ativo e saudável.
- PostgreSQL 17.
- 1 tenant e 1 company atualmente cadastrados.
- 1 membership ativo.
- 4 roles e 58 permissions.
- 33 módulos SGQ ativos.
- 21 agentes IA cadastrados e 1 tarefa de agente registrada.
- Audit Log contém eventos persistidos.
- Há 1 documento SGQ; ações RQ045, auditorias, indicadores e treinamentos estão sem registros na contagem atual.

## 2. RLS

Todas as tabelas públicas inspecionadas estão com `rowsecurity=true`, incluindo tenant, memberships, roles/permissões, Action/RQ045, Documentos, Auditorias, Indicadores, Riscos, Treinamentos, automações e tabelas de agentes IA.

A maioria possui pelo menos uma política RLS. A exceção identificada pelo Security Advisor é `public.sgq_password_reset_tokens`: RLS está habilitado e não há policy pública. Isso pode ser intencional para negar acesso direto; deve permanecer documentado e validado contra o fluxo seguro de reset.

## 3. Migrations

A cadeia de migrations existe no banco e contém, entre outras, fundação SGQ, permissões, módulos operacionais, event engine, Central de Agentes, sincronização de agentes, conexão dos agentes ao motor de eventos, 5S, portais externos, controle de acesso exclusivo, recuperação de senha e endurecimento de RPCs.

Últimas migrations observadas incluem endurecimento de RPC `SECURITY DEFINER`, revogação de RPC administrativa para `anon` e storage documental MASTER.

Conclusão: a afirmação anterior de 'migrations não comprovadas' fica parcialmente resolvida no ambiente Supabase real. O gap passa a ser versionar/reconciliar essa cadeia com a fonte de código oficial do repositório para evitar drift.

## 4. Security Advisor — achados

### SEC-P0-001 — função SECURITY DEFINER com efeito cross-tenant potencial
Função: `sgq_cert_ecosystem_verification_alerts(p_tenant uuid)`.

Constatação: executável pelo papel `authenticated`, usa `SECURITY DEFINER` e escreve em `sgq_alerts` para o tenant informado sem verificar membership do usuário chamador.

Risco: usuário autenticado pode tentar provocar geração de alertas em outro tenant se conhecer/obtiver o UUID. Por ser `SECURITY DEFINER`, a função pode contornar RLS na escrita.

Criticidade: ALTA para expansão multitenant.

Tratamento recomendado: restringir `EXECUTE` a `service_role`/rotina interna OU adicionar verificação explícita do tenant do usuário antes de qualquer escrita. Não aplicar diretamente em produção sem migration controlada e teste de regressão das automações de certificação.

Status: ABERTA / BLOQUEIA E3 MULTITENANT.

### SEC-P0-002 — SECURITY DEFINER exposto a usuários autenticados
O Advisor sinaliza também helpers/RPCs de acesso e administração (`sgq_has_module_access`, `sgq_is_access_admin`, `sgq_list_tenant_users`, `sgq_set_module_access`, `sgq_upsert_external_portal`, `sgq_user_role_codes`, `sgq_can_manage_exclusive_access`).

Análise inicial: várias dessas funções contêm verificações de `auth.uid()`, membership ou papel MASTER/SGQ e parecem intencionais para o cliente autenticado. Portanto, não devem ser revogadas automaticamente. Requerem teste negativo por função e revisão de privilégio mínimo.

Status: PARCIAL / REVISÃO NECESSÁRIA.

### SEC-P0-003 — proteção contra senha vazada desabilitada
O Security Advisor informa que Leaked Password Protection está desabilitada.

Risco: autenticação aceita senhas conhecidas em bases de comprometimento, dependendo das demais regras configuradas.

Tratamento recomendado: habilitar proteção no Auth após validação de impacto sobre usuários existentes e política de senhas.

Status: ABERTA.

## 5. Performance Advisor

Achados principais:
- chaves estrangeiras sem índices de cobertura, especialmente em tabelas de agentes IA e alguns registros SGQ;
- policy `sgq_module_access_grants_select` com avaliação de `auth.*` por linha, recomendando initplan via `(select auth.uid())` quando aplicável;
- múltiplas policies permissivas para SELECT em várias tabelas SGQ;
- índices duplicados em `sgq_5s_draw_validation`;
- diversos índices ainda sem uso observado.

Esses pontos não justificam exclusão automática de índices em uma base jovem. Prioridade: corrigir índices duplicados e FKs sem cobertura em tabelas de maior uso; medir antes de remover índices 'unused'.

## 6. Testabilidade multitenant

Há apenas 1 tenant cadastrado atualmente. Portanto, o teste real A × B não pode ser reexecutado no banco produtivo sem criar massa adicional. O cross-tenant permanece E2 por evidências anteriores/controladas e NÃO deve ser promovido a E3 globalmente com esta base de um único tenant.

## 7. Classificação P0

| Controle | Resultado | Maturidade |
|---|---|---|
| Tenant | presente e persistido | E2/E3 no tenant piloto, não global |
| Membership | presente e ativo | E2 |
| RBAC | roles + permissions + grants presentes | E2 |
| RLS | habilitado em todas as tabelas públicas auditadas | E2 |
| Audit Log | persistido e com eventos | E2 |
| Migrations | cadeia presente no Supabase | E2 |
| Cross-tenant | não reproduzível na base atual de 1 tenant | NÃO TESTADO nesta rodada |
| Segurança RPC | 1 risco alto + avisos adicionais | NÃO CONFORME/PARCIAL |
| Senha vazada | proteção desabilitada | PARCIAL |

## 8. GO / NO-GO P0

**GO CONDICIONAL para piloto controlado de tenant único.**

**NO-GO para declarar plataforma multitenant E3 ou ampliar produção para múltiplos tenants** até fechar SEC-P0-001, revisar os RPCs SECURITY DEFINER e executar teste A × B em ambiente controlado.
