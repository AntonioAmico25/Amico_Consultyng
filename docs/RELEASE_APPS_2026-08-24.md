# AMICO — Atualização Coordenada de Apps — 24/08/2026

## Escopo
Esta release sincroniza Web, PWA iOS, Android, SGQ Manager e backend com a nova baseline de governança de IA.

## Regras comuns
- Gateway multimodelo: Luna, Terra, Sol e modelo local.
- Limites de consumo por tenant, usuário, módulo, agente e processo.
- Identificação visível de interação com IA.
- Human-in-the-loop obrigatório em decisões críticas.
- Audit Log com prompt, fontes, modelo/versão, ferramentas, horário, decisão humana e resultado.
- Inventário de agentes, responsável humano e canal de contestação/correção.
- Preparação para NIST CSF 2.0 e ISO/IEC 42001.

## Fluxo prioritário SGQ
NC detectada → evidências → causa sugerida → plano sugerido → aprovação humana → execução → acompanhamento → verificação de eficácia → Audit Log.

## Estados por superfície
| Superfície | Estado desta atualização |
|---|---|
| Web institucional | Conteúdo/governança sincronizados |
| PWA iOS | Configuração de governança sincronizada; UI funcional existente preservada |
| Android | Configuração de governança adicionada à branch de homologação |
| SGQ Manager | Baseline de governança sincronizada para integração do fluxo de NC |
| Backend | Contrato de governança definido para implementação do gateway e logs |

## Critério de promoção
Nenhuma capacidade crítica deve ser marcada como operacional antes de teste funcional, segurança, segregação por tenant, rastreabilidade e aprovação humana aplicável.
