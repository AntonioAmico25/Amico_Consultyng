(() => {
'use strict';
const MAP={
 low:'Baixa',medium:'Média',high:'Alta',critical:'Crítica',
 open:'Aberta',in_progress:'Em andamento',awaiting_validation:'Aguardando validação',completed:'Concluída',verified:'Verificada',closed:'Encerrada',overdue:'Atrasada',cancelled:'Cancelada',
 INTERNAL:'Interna',SUPPLIER:'Fornecedor',CERTIFICATION:'Certificação',PROCESS:'Processo',PRODUCT:'Produto',PLANNED:'Planejada',IN_PROGRESS:'Em andamento',COMPLETED:'Concluída',CANCELLED:'Cancelada',
 higher_better:'Maior é melhor',lower_better:'Menor é melhor',target:'Atingir meta',DAILY:'Diária',WEEKLY:'Semanal',MONTHLY:'Mensal',QUARTERLY:'Trimestral',SEMIANNUAL:'Semestral',ANNUAL:'Anual',ACTIVE:'Ativo',INACTIVE:'Inativo',
 RISK:'Risco',OPPORTUNITY:'Oportunidade',OPEN:'Aberto',TREATING:'Em tratamento',MONITORING:'Em monitoramento',CLOSED:'Encerrado',
 REVOKED:'Revogada',SUPERSEDED:'Substituída',DRAFT:'Rascunho',UNDER_REVIEW:'Em revisão',APPROVED:'Aprovada',REJECTED:'Rejeitada'
};
function translateSelects(root=document){
  root.querySelectorAll?.('select option').forEach(o=>{const key=String(o.value||o.textContent||'').trim();if(MAP[key])o.textContent=MAP[key];});
}
function translateBadges(root=document){
  root.querySelectorAll?.('.tag,.pill,.masteritem .muted').forEach(el=>{const t=String(el.textContent||'').trim();if(MAP[t])el.textContent=MAP[t];});
}
function apply(){document.documentElement.lang='pt-BR';translateSelects();translateBadges();}
const mo=new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(n=>{if(n.nodeType===1){translateSelects(n);translateBadges(n);}});}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();mo.observe(document.body,{childList:true,subtree:true});});else{apply();mo.observe(document.body,{childList:true,subtree:true});}
window.SGQ_PTBR={apply,map:MAP};
})();