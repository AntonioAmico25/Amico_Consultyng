# AMICO AI R02.1 — Matriz de Homologação

Data-base original: 17/08/2026. Atualização de governança: 01/09/2026. R01 preservada como baseline histórica.

## Escala oficial
- E0 Planejado: requisito aprovado, sem protótipo verificável.
- E1 Protótipo/Implementado: código, fluxo ou controle executável, sem homologação completa.
- E2 Homologado: testes, evidências e aceite concluídos.
- E3 Operacional: produção monitorada, auditável e controlada.

Fluxo: E0 → E1 → E2 → E3. Nenhuma promoção ocorre sem evidência objetiva.

## Matriz
| ID | Componente | Estado | Próximo gate |
|---|---|---:|---|
| AI-001 | AMICO AI | E1 | homologação integrada |
| AI-002 | Orquestrador multiagente | E1 | teste end-to-end |
| AI-003 | Agentes especialistas | E1 | ferramentas, permissões e testes |
| AI-004 | Human-in-the-loop | E1 | evidência operacional |
| AI-005 | Guardrails | E1 | testes positivos/negativos |
| AI-006 | Audit Log IA | E1 | rastreabilidade ponta a ponta |
| AI-007 | Consumo/créditos | E0 | metering e ledger |
| AI-008 | OpenAI/modelo real | E1 | teste controlado do runtime |
| AI-009 | WitCloud/BI | E0/E1 | projeto e dataset AMICO |
| AI-010 | POL-IA-001 Política Corporativa de IA R00 | E1 | revisão MASTER + RBAC/tenant + HITL + Audit Log + aprovação formal |
| AI-011 | Matriz de risco IA (Baixo/Moderado/Alto/Crítico) | E1 | cenários positivos/negativos e bloqueio de alto/crítico sem aprovação |
| AI-012 | Governança de agentes / menor privilégio / kill switch | E1 | teste de permissões, escopo e contenção |
| FOCA-001 | SGQ Manager FOCA | E1 | homologação funcional |
| FOCA-002 | Automação 5S/RQ 176 | E1 | imparcialidade e sorteio |
| FOCA-003 | 30 módulos automatizados | E1 | testes módulo × módulo |
| MOB-001 | PWA AMICO | E1 | homologação multiplataforma |
| SAAS-001 | Multiempresa/IAM/RBAC | E1 | segregação e segurança |
| COM-001 | AMICO AI comercial | E0 | billing, planos e metering |

## Evidências GitHub
### Baseline 17/08/2026
- 5c22590544e3d715d54bfbb28481e5f24997db51 — painel piloto SGQ Manager FOCA com automação e 5S.
- 15f31ff99dee2bd9f879f469691c8f9e8e51b8ea — fechamento funcional e 30 módulos automatizados.

### Governança 01/09/2026
- `docs/POL-IA-001_POLITICA_CORPORATIVA_DE_IA_R00.md` — política corporativa R00 em homologação.
- `config/ai-governance-2026-09-01.json` — matriz operacional de risco, Human-in-the-Loop, isolamento de tenant, Audit Log, agentes e gates.
- Registro `POL-IA-001 / R00 / EM_APROVACAO` no módulo documental do SGQ Manager, com revisão e evidência no Audit Log.

Commit comprova implementação E1, não homologação E2.

## Gate E1 → E2
Requisito + arquivo/commit + cenário de teste + esperado + obtido + evidência + responsável + data + aceite + nenhuma falha crítica aberta.

Para `POL-IA-001 R00`, o gate E1 → E2 exige adicionalmente:
1. revisão integral pelo MASTER/Direção;
2. teste de RBAC e negação cross-tenant;
3. evidência de Human-in-the-Loop em fluxo classificado ALTO;
4. evidência de Audit Log ponta a ponta;
5. validação de confidencialidade e tratamento de dados;
6. teste da matriz BAIXO/MODERADO/ALTO/CRÍTICO;
7. aprovação formal da revisão R00 no Histórico de Revisões.

## Gate E2 → E3
Produção + acesso autorizado + monitoramento + Audit Log + segurança/segregação + contingência/rollback + aceite operacional.

Para Sistemas de IA ALTO ou CRÍTICO, E3 também exige evidência de bloqueio ou retorno seguro quando a aprovação humana obrigatória não estiver presente.

## Cenários mínimos de teste da Política de IA
| Caso | Classificação | Resultado esperado |
|---|---|---|
| Resumo de texto não confidencial | BAIXO | permitir com revisão do usuário |
| Classificação de documento SGQ | MODERADO | exigir validação humana e registro |
| Sugestão de causa/ação corretiva | ALTO | bloquear execução até aprovação humana e registrar evidências |
| Liberação crítica / decisão de segurança | CRÍTICO | IA somente consultiva; decisão humana formal obrigatória |
| Tentativa de acesso a outro tenant | qualquer | negar acesso e registrar evento de segurança |
| Alteração de permissão por agente | ALTO/CRÍTICO | exigir autorização humana; menor privilégio |
| Falha de modelo/indisponibilidade | qualquer | acionar contingência e retorno seguro |
| Resultado com fonte insuficiente | MODERADO+ | indicar lacuna e impedir afirmação factual não sustentada |

## Ordem de homologação
1. FOCA: SGQ Manager → 5S → 30 módulos → sincronismo → rotinas 3x/dia → alertas → Audit Log.
2. AMICO AI: política R00 → matriz de risco → orquestrador → agentes → ferramentas → guardrails → HITL → Audit Log → modelo real.
3. Dados/BI: dataset AMICO → WitCloud → indicadores → CEO Master.
4. Comercial: IAM → gratuito controlado → créditos → metering → billing/licenciamento.
5. Multiplataforma: web/PWA → Windows → iOS → Android.

## CEO Master
Campos mínimos: ID, módulo, versão, responsável, E0-E3, testes aprovados, falhas abertas, criticidade, última evidência, atualização, próximo gate e previsão.

Para IA, incluir adicionalmente: classificação de risco, owner humano, modelo/versão, fontes autorizadas, HITL exigido, evidência de Audit Log, status da Política e decisão GO/NO-GO.

## Governança
R01 não será apagada. R02 consolida a evolução de 17/08/2026. R02.1 formaliza homologação E0-E3. A atualização de 01/09/2026 incorpora a `POL-IA-001 R00` sem promover automaticamente seu estado para E2. Toda promoção ou rebaixamento deve ser rastreável.
