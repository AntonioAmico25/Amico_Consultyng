# POL-IA-001 — Política Corporativa de Inteligência Artificial

**Organização:** AMICO CONSULTYNG  
**Revisão:** R00  
**Status:** EM HOMOLOGAÇÃO  
**Data de emissão:** 2026-09-01  
**Classificação:** Política Corporativa  
**Abrangência:** Ecossistema AMICO CONSULTYNG, SGQ Manager, ERP, BPM, GRC, BI, agentes, automações, integrações, serviços e projetos de clientes.  

> Documento AMICO independente, elaborado a partir da política de IA da DNV fornecida como referência pelo usuário e adaptado à arquitetura, governança e operação do Ecossistema AMICO.

## 1. Objetivo

Estabelecer princípios, responsabilidades, critérios de governança e controles para assegurar o uso lícito, ético, seguro, responsável, transparente, rastreável e auditável da Inteligência Artificial no Ecossistema AMICO CONSULTYNG.

A Política aplica-se à aquisição, contratação, desenvolvimento, configuração, integração, treinamento, utilização, manutenção, monitoramento e descontinuação de modelos, componentes, APIs, agentes, algoritmos, serviços e aplicações habilitados por IA, doravante denominados **Sistemas de IA**.

A IA deve apoiar produtividade, gestão, qualidade, análise, tomada de decisão, automação e geração de valor, preservando a responsabilidade humana sobre decisões críticas.

## 2. Escopo

Aplica-se a administradores, colaboradores, desenvolvedores, consultores, prestadores, parceiros e terceiros que utilizem ou desenvolvam Sistemas de IA em nome da AMICO CONSULTYNG.

Abrange:

- sistemas internos de gestão, desenvolvimento, documentação, suporte e operação;
- produtos e módulos do Ecossistema AMICO;
- agentes especializados e automações;
- modelos, APIs e serviços de terceiros;
- processamento de dados e informações de clientes;
- infraestrutura, segurança, observabilidade e suporte tecnológico;
- informações pertencentes à AMICO, clientes, usuários, parceiros ou terceiros sob sua custódia.

## 3. Princípio fundamental

A Inteligência Artificial deve **ampliar a capacidade humana sem eliminar indevidamente a responsabilidade humana**.

Decisões relevantes para segurança, conformidade, direitos das pessoas, qualidade de produto, auditorias, certificações, riscos elevados, contratos ou impactos significativos devem possuir supervisão humana compatível com o risco.

A responsabilidade final por decisões críticas não pode ser transferida exclusivamente a um Sistema de IA.

## 4. Princípios de governança de IA

1. **Legalidade:** observar legislação, regulamentações, contratos e requisitos aplicáveis.
2. **Gestão de riscos:** classificar a criticidade de cada uso de IA e aplicar controles proporcionais.
3. **Supervisão humana:** manter Human-in-the-Loop em processos críticos ou de alto impacto.
4. **Segurança:** aplicar autenticação, autorização, segregação, monitoramento e proteção contra uso indevido.
5. **Privacidade:** tratar dados pessoais, confidenciais e de clientes segundo finalidade, autorização e necessidade.
6. **Qualidade:** validar exatidão, consistência, adequação à finalidade e limitações dos resultados.
7. **Rastreabilidade:** registrar ações relevantes, logs, evidências, versões, fontes e decisões humanas.
8. **Transparência:** informar quando IA tiver participação material em uma atividade ou resultado.
9. **Explicabilidade:** permitir compreender, quando aplicável, os fatores, fontes, regras ou evidências que sustentam uma recomendação.
10. **Responsabilidade:** manter responsável humano ou organizacional identificável por cada Sistema de IA e processo.
11. **Propriedade intelectual:** respeitar direitos autorais, marcas, licenças, dados proprietários e segredos comerciais.
12. **Não discriminação:** evitar resultados injustos, discriminatórios, prejudiciais ou incompatíveis com a finalidade autorizada.
13. **Resiliência:** prever falhas, indisponibilidade, alterações de modelo e eventos adversos.
14. **Melhoria contínua:** utilizar desempenho, incidentes, feedbacks e evidências para aperfeiçoar sistemas e controles.

## 5. Classificação de risco

| Nível | Exemplos | Controle mínimo |
|---|---|---|
| BAIXO | organização de texto, resumo, apoio administrativo | revisão do usuário |
| MODERADO | análise de indicadores, classificação documental, priorização | validação humana e registro |
| ALTO | avaliação de riscos, recomendação de ações corretivas, decisões de SGQ | aprovação humana obrigatória, evidências e trilha de auditoria |
| CRÍTICO | segurança de pessoas, decisão legal, certificação, bloqueio operacional relevante | IA apenas como apoio; decisão humana formal obrigatória |

Quanto maior o risco, maior deve ser o nível de documentação, validação, supervisão, monitoramento, autorização e evidência.

## 6. Proteção de dados e informações

As informações utilizadas por Sistemas de IA devem ser adequadas à finalidade, verificadas e protegidas proporcionalmente à sua criticidade.

Dados confidenciais, estratégicos, pessoais, sensíveis, documentos de clientes, propriedade intelectual ou informações sujeitas a restrição contratual não devem ser inseridos indiscriminadamente em serviços públicos de IA.

Para fornecedores externos devem ser avaliados, conforme aplicável: finalidade, contrato, retenção, localização, segurança, confidencialidade, utilização para treinamento, exclusão e direitos das partes.

No ambiente multitenant AMICO, dados de um tenant não podem ser disponibilizados, inferidos ou utilizados no contexto de outro tenant.

## 7. Aquisição, desenvolvimento e integração

Antes da entrada de um novo Sistema de IA no ecossistema, devem ser avaliados proporcionalmente ao risco:

- finalidade e caso de uso;
- owner funcional e técnico;
- modelo, fornecedor, versão e dependências;
- tipos, origem e sensibilidade dos dados;
- autenticação, autorização e segregação;
- requisitos de privacidade;
- classificação de risco e mitigação;
- pontos de Human-in-the-Loop;
- critérios de qualidade e validação;
- logs, evidências e auditabilidade;
- contingência e retorno seguro;
- testes, critérios de aceite e homologação.

## 8. Uso de IA generativa

Conteúdo gerado por IA é **conteúdo assistido** e não se torna automaticamente informação verdadeira, aprovada ou oficial.

Textos, relatórios, análises, cálculos, requisitos normativos, interpretações técnicas e recomendações devem ser verificados proporcionalmente ao impacto da decisão.

Documentos oficiais, procedimentos, análises de risco, 8D, auditorias, ações corretivas e registros de SGQ somente assumem caráter oficial após o fluxo de aprovação aplicável.

## 9. Agentes e automações

Agentes de IA podem executar atividades automaticamente quando seus limites, permissões, responsabilidades e critérios de parada estiverem previamente definidos.

Deve ser aplicado o princípio do **menor privilégio**. Cada agente recebe apenas as permissões necessárias à finalidade autorizada.

Ações irreversíveis, exclusões, liberações críticas, alterações de permissões, mudanças de controles e outras operações de alto impacto exigem autorização humana configurável.

Agentes relevantes devem possuir identidade, owner, escopo, permissões, versão, registro de atividade e mecanismo de contenção/desligamento.

## 10. Transparência e explicabilidade

Quando a IA participar materialmente de análise, recomendação ou decisão, o sistema deve manter, conforme criticidade, rastreabilidade do fluxo:

**entrada → fontes → modelo/agente → ferramentas → processamento → resultado → validação humana → decisão → evidência**.

Sempre que tecnicamente possível e necessário ao risco, o usuário deve conseguir compreender por que determinado resultado, classificação ou recomendação foi produzido.

## 11. Qualidade, validação e monitoramento

Sistemas de IA devem ser avaliados quanto a precisão, consistência, robustez, adequação à finalidade, segurança, desempenho, disponibilidade e comportamento inesperado.

Alterações relevantes de modelo, fornecedor, versão, prompt mestre, regras, base de conhecimento, integrações ou arquitetura devem passar por Gestão de Mudanças e, quando aplicável, nova homologação.

Resultados incorretos, alucinações, falhas de integração, comportamento inesperado ou degradação de desempenho devem ser registrados como evento, ocorrência, risco ou não conformidade conforme criticidade.

## 12. Segurança e resiliência

Devem existir controles apropriados contra acesso não autorizado, manipulação, vazamento, abuso de credenciais, prompt injection, uso indevido de agentes e outros riscos de segurança.

Quando aplicável, devem existir backup, recuperação, logs, observabilidade, segregação por tenant, RBAC, limites operacionais e mecanismo seguro de retorno ao estado operacional.

## 13. Propriedade intelectual

A aquisição, geração, treinamento e utilização de Sistemas de IA deve respeitar propriedade intelectual, direitos autorais, marcas, patentes, segredos comerciais, contratos, licenças e direitos relacionados aos dados utilizados.

Materiais, códigos, interfaces, ativos ou conteúdos protegidos de terceiros não devem ser incorporados deliberadamente ao produto AMICO sem autorização, licença ou base jurídica apropriada.

## 14. Ética, imparcialidade e prevenção de danos

A IA não deve ser utilizada para práticas ilegais, discriminatórias, fraudulentas, manipulativas ou incompatíveis com os princípios da AMICO CONSULTYNG.

Conteúdo inadequado, discriminatório, enganoso ou com potencial de dano significativo deve ser rejeitado, corrigido ou submetido à revisão humana.

Sistemas mais expostos a vieses devem possuir mecanismos de avaliação, feedback e mitigação compatíveis com o risco.

## 15. Registros e evidências

O uso de IA em processos relevantes deve produzir evidências compatíveis com sua criticidade.

Sempre que aplicável, o Event Engine / Audit Log deve registrar:

- tenant, empresa, módulo e processo;
- usuário e/ou agente;
- data e hora;
- modelo e versão;
- fontes, ferramentas e regras relevantes;
- ação executada ou recomendada;
- resultado;
- decisão ou aprovação humana;
- alteração realizada;
- exceções, falhas e tratamento aplicado.

Os registros devem permitir reconstruir o histórico de uma ação relevante.

## 16. Incidentes de IA

Comportamentos inesperados, erros graves, vazamentos, resultados discriminatórios, ações não autorizadas, problemas de segurança e suspeitas de violação desta Política devem ser comunicados e registrados.

O tratamento pode incluir contenção, suspensão do agente/modelo, investigação, correção, análise de causa, avaliação de impacto, ação corretiva e verificação de eficácia.

## 17. Competência e conscientização

Usuários e responsáveis por Sistemas de IA devem possuir competência compatível com suas atividades.

A AMICO deve promover capacitação sobre uso responsável de IA, segurança, privacidade, qualidade de dados, validação de resultados, proteção de propriedade intelectual e boas práticas de engenharia de prompts, agentes e automações.

## 18. Papéis de governança

| Papel | Responsabilidade |
|---|---|
| Direção / CEO | aprovar a política e definir apetite ao risco |
| Administrador MASTER | governança global, acessos, configurações e controles |
| AI Governance / Agente Governador | monitorar inventário, riscos, limites e evidências dos Sistemas de IA |
| SGQ | controle documental, auditorias, NCs, CAPA e evidências |
| Segurança / TI | identidade, segurança, infraestrutura, continuidade e observabilidade |
| Owner do processo | validar finalidade, regras e resultado funcional |
| Usuário | utilizar IA conforme finalidade e validar resultados conforme responsabilidade |
| Agente de IA | atuar somente dentro do escopo, permissões e limites autorizados |

## 19. Ciclo de vida obrigatório

Os Sistemas de IA devem seguir os gates do Ecossistema AMICO:

**CONSOLIDAR → IMPLEMENTAR → TESTAR → AUDITAR → HOMOLOGAR → GO/NO-GO → DOCUMENTAR E MELHORAR**.

Sistemas classificados como ALTO ou CRÍTICO não devem atingir produção sem evidências suficientes dos gates aplicáveis.

## 20. Revisão da Política

Esta Política deve ser revisada periodicamente e sempre que houver alteração significativa em legislação, tecnologia, modelos, arquitetura, riscos, processos ou estratégia.

Toda revisão deve possuir controle formal de versão, motivo da alteração, responsável, aprovação e data de vigência.

## 21. Histórico de Revisões

| Revisão | Data | Alteração | Situação |
|---|---|---|---|
| R00 | 2026-09-01 | Emissão inicial da Política Corporativa de Inteligência Artificial adaptada ao Ecossistema AMICO CONSULTYNG | Em homologação |

## 22. Critérios para homologação da R00

A R00 somente deve mudar para **VIGENTE** após:

1. revisão integral do conteúdo pelo responsável MASTER/Direção;
2. teste dos controles de acesso e segregação aplicáveis;
3. evidência de Human-in-the-Loop em ao menos um fluxo de alto risco;
4. evidência de Audit Log/Event Engine para ação de IA relevante;
5. confirmação de tratamento de dados e confidencialidade;
6. validação da matriz de risco e dos gates GO/NO-GO;
7. registro formal da aprovação no Histórico de Revisões.
