# AMICO AI R02.1 — Matriz de Homologação

Data-base: 17/08/2026. R01 preservada como baseline histórica.

## Escala oficial
- E0 Planejado: requisito aprovado, sem protótipo verificável.
- E1 Protótipo/Implementado: código ou fluxo executável, sem homologação completa.
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
| FOCA-001 | SGQ Manager FOCA | E1 | homologação funcional |
| FOCA-002 | Automação 5S/RQ 176 | E1 | imparcialidade e sorteio |
| FOCA-003 | 30 módulos automatizados | E1 | testes módulo × módulo |
| MOB-001 | PWA AMICO | E1 | homologação multiplataforma |
| SAAS-001 | Multiempresa/IAM/RBAC | E1 | segregação e segurança |
| COM-001 | AMICO AI comercial | E0 | billing, planos e metering |

## Evidências GitHub em 17/08/2026
- 5c22590544e3d715d54bfbb28481e5f24997db51 — painel piloto SGQ Manager FOCA com automação e 5S.
- 15f31ff99dee2bd9f879f469691c8f9e8e51b8ea — fechamento funcional e 30 módulos automatizados.

Commit comprova implementação E1, não homologação E2.

## Gate E1 → E2
Requisito + arquivo/commit + cenário de teste + esperado + obtido + evidência + responsável + data + aceite + nenhuma falha crítica aberta.

## Gate E2 → E3
Produção + acesso autorizado + monitoramento + Audit Log + segurança/segregação + contingência/rollback + aceite operacional.

## Ordem de homologação
1. FOCA: SGQ Manager → 5S → 30 módulos → sincronismo → rotinas 3x/dia → alertas → Audit Log.
2. AMICO AI: orquestrador → agentes → ferramentas → guardrails → HITL → Audit Log → modelo real.
3. Dados/BI: dataset AMICO → WitCloud → indicadores → CEO Master.
4. Comercial: IAM → gratuito controlado → créditos → metering → billing/licenciamento.
5. Multiplataforma: web/PWA → Windows → iOS → Android.

## CEO Master
Campos mínimos: ID, módulo, versão, responsável, E0-E3, testes aprovados, falhas abertas, criticidade, última evidência, atualização, próximo gate e previsão.

## Governança
R01 não será apagada. R02 consolida a evolução de 17/08/2026. R02.1 formaliza homologação E0-E3. Toda promoção ou rebaixamento deve ser rastreável.
