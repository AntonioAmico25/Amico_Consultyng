# MAPA MESTRE AMICO — R01

Data-base: 2026-08-12
Status: Homologação / evolução controlada

## Objetivo
Consolidar o ecossistema Amico Consultyng em uma única fonte técnica de verdade e conduzir a evolução do protótipo institucional para uma plataforma SaaS produtiva, sem declarar como operacional aquilo que ainda não foi validado.

## Regra de maturidade
1. Definido
2. Documentado
3. Código existente
4. Integrado
5. Testado
6. Homologado
7. Produção

## Estado consolidado
| Componente | Estado atual | Próxima evidência obrigatória |
|---|---|---|
| Site institucional | Código existente / revisão | Publicação e smoke test |
| SGQ Digital / SGQ Manager | Homologação conceitual/MVP | Persistência + autenticação + RBAC + tenant |
| OS | Arquitetado | Shell autenticado + módulos conectados |
| ERP/MRP/PPCP | Arquitetado | Modelo de dados + primeiro fluxo transacional |
| Central IA / agentes | Arquitetado/demonstrativo | Orquestração real, autorização e auditoria |
| BI e relatórios | Especificado | Dados persistidos + exportações validadas |
| Portal do Cliente | Planejado/parcial | Autenticação e segregação por empresa |
| Mobile | Planejado | API estável antes dos clientes nativos |
| Marketing/Marca | Avançado | Biblioteca oficial versionada |
| TCC/Pesquisa | Em evolução | Documento mestre versionado |

## Fundação SaaS — bloqueadores P0
- Banco relacional persistente.
- Multiempresa (tenant_id obrigatório nos dados de negócio).
- Autenticação segura.
- RBAC por usuário, empresa, setor e função.
- Segregação de dados entre empresas.
- Trilha de auditoria imutável para ações críticas.
- Gestão de sessão e recuperação de acesso.
- Migrações versionadas do banco.
- Configuração por variáveis de ambiente sem segredos no Git.
- Logs estruturados, healthcheck e tratamento padronizado de erros.
- Backup/restauração e política de retenção.
- Testes automatizados de isolamento, permissões e fluxos críticos.

## Primeiro fluxo produtivo
SGQ Digital: Empresa -> Usuário -> Perfil/RBAC -> Documento/Registro -> Revisão/Aprovação -> Evidência -> Plano de ação -> Histórico/Auditoria.

Critério de saída: o fluxo deve sobreviver a reinício da aplicação, respeitar tenant e permissões, registrar autoria/data/hora e possuir teste automatizado.

## Ambientes
- Produção: somente releases homologadas.
- Homologação: integração e aceite funcional.
- Desenvolvimento: implementação e testes locais.

## Gate de produção
Nenhum módulo será marcado como PRODUÇÃO sem: persistência real, autenticação, autorização, isolamento multiempresa, trilha de auditoria quando aplicável, testes críticos aprovados, backup/restauração definido, observabilidade mínima e aceite de homologação.

## Ordem de execução
P0 Fundação SaaS -> P1 SGQ Digital produtivo -> P2 OS shell + módulos prioritários -> P3 ERP/MRP/PPCP -> P4 IA multiagente -> P5 Portal/Mobile -> P6 escala comercial e integrações.

## Fonte de verdade
Este documento e o código versionado neste repositório controlam o estado técnico. Materiais de marketing e site devem refletir os estados daqui, evitando apresentar roadmap como funcionalidade liberada.
