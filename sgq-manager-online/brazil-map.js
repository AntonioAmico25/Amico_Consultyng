(() => {
'use strict';

const $ = id => document.getElementById(id);
const SOUTH = ['PR','SC','RS'];
const STATE_NAME = {PR:'Paraná',SC:'Santa Catarina',RS:'Rio Grande do Sul'};
const IBGE = {
  PR:'https://servicodados.ibge.gov.br/api/v3/malhas/estados/41?formato=application/vnd.geo+json&qualidade=minima',
  SC:'https://servicodados.ibge.gov.br/api/v3/malhas/estados/42?formato=application/vnd.geo+json&qualidade=minima',
  RS:'https://servicodados.ibge.gov.br/api/v3/malhas/estados/43?formato=application/vnd.geo+json&qualidade=minima'
};
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = n => Math.max(0,Math.min(100,Math.round(Number(n)||0)));
const color = v => v == null ? '#6f8196' : v >= 80 ? '#36c46b' : v >= 60 ? '#e7b93f' : v >= 40 ? '#ef8d3e' : '#e45b5b';
const status = v => v == null ? 'Sem dados UF' : v >= 80 ? 'Bom / Conforme' : v >= 60 ? 'Atenção' : v >= 40 ? 'Risco' : 'Crítico';
let selectedUF = 'ALL';
let selectedModule = 'ACTIONS';
let mapFeatures = {};

function installStyle(){
  if ($('sgqSouthDataStyle')) return;
  const s=document.createElement('style');
  s.id='sgqSouthDataStyle';
  s.textContent=`
  .sgqs-shell{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(360px,.85fr);gap:16px;margin-top:14px}
  .sgqs-card{background:linear-gradient(180deg,var(--panel),color-mix(in srgb,var(--panel) 94%,#000));border:1px solid var(--line);border-radius:18px;box-shadow:0 12px 34px rgba(0,0,0,.12)}
  .sgqs-pad{padding:16px}.sgqs-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.sgqs-head h2,.sgqs-head h3{margin:0}.sgqs-head h2{font-size:23px}.sgqs-head p{margin:5px 0 0;color:var(--muted);max-width:720px}
  .sgqs-badge{padding:6px 10px;border-radius:999px;border:1px solid rgba(54,196,107,.4);background:rgba(54,196,107,.08);color:#8ae9ae;font-size:10px;font-weight:900;letter-spacing:.07em}
  .sgqs-map{position:relative;height:560px;margin-top:14px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:radial-gradient(circle at 58% 35%,rgba(27,113,183,.12),transparent 48%),#0b1725}
  .sgqs-svg{width:100%;height:100%;display:block}.sgqs-state{cursor:pointer;transition:filter .16s ease,opacity .16s ease}.sgqs-state path{stroke:#7f98b1;stroke-width:1.2;vector-effect:non-scaling-stroke}.sgqs-state:hover{filter:brightness(1.12)}.sgqs-state.active path{stroke:#d8ecff;stroke-width:2.3}.sgqs-label{pointer-events:none;text-anchor:middle;fill:#fff;font-weight:900}.sgqs-label .uf{font-size:20px}.sgqs-label .count{font-size:14px}.sgqs-label .health{font-size:10px;fill:#d8e4ee}
  .sgqs-mapmsg{position:absolute;left:14px;bottom:14px;right:14px;padding:9px 10px;border-radius:11px;background:rgba(4,13,23,.88);border:1px solid #31465d;color:#bdd0df;font-size:10px}.sgqs-mapmsg strong{color:#fff}
  .sgqs-statefilters{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.sgqs-statebtn{padding:9px;border:1px solid var(--line);border-radius:11px;background:var(--panel2);text-align:left;cursor:pointer}.sgqs-statebtn.active{border-color:#7cc9ff}.sgqs-statebtn b{display:block;font-size:11px}.sgqs-statebtn small{display:block;margin-top:2px;color:var(--muted);font-size:9px}
  .sgqs-side{display:grid;gap:12px;align-content:start}.sgqs-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.sgqs-kpi{padding:12px;background:var(--panel2);border:1px solid var(--line);border-radius:12px}.sgqs-kpi small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase}.sgqs-kpi b{display:block;font-size:24px;margin-top:2px}.sgqs-kpi span{font-size:9px;color:var(--muted)}
  .sgqs-mods{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sgqs-mod{display:grid;grid-template-columns:10px 1fr auto;gap:8px;align-items:center;padding:9px;border:1px solid var(--line);border-radius:11px;background:var(--panel2);cursor:pointer;min-width:0}.sgqs-mod.active{border-color:var(--mc);box-shadow:0 0 0 1px color-mix(in srgb,var(--mc) 35%,transparent)}.sgqs-mod i{width:8px;height:8px;border-radius:50%;background:var(--mc)}.sgqs-mod strong{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgqs-mod small{display:block;color:var(--muted);font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgqs-mod b{font-size:16px}
  .sgqs-detail{padding:13px;background:var(--panel2);border:1px solid var(--line);border-radius:14px}.sgqs-detail h3{margin:0 0 9px}.sgqs-detailgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.sgqs-detailgrid div{padding:8px;border:1px solid var(--line);border-radius:9px}.sgqs-detailgrid small{display:block;color:var(--muted);font-size:9px}.sgqs-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
  .sgqs-tablecard{margin-top:16px;padding:16px}.sgqs-tablewrap{overflow:auto;max-height:350px}.sgqs-table{width:100%;min-width:840px;border-collapse:collapse}.sgqs-table th,.sgqs-table td{padding:9px;border-bottom:1px solid var(--line);font-size:12px;text-align:left}.sgqs-table th{position:sticky;top:0;background:var(--panel);z-index:1}.sgqs-pill{display:inline-block;padding:3px 7px;border-radius:999px;font-weight:800}.sgqs-foot{margin-top:8px;color:var(--muted);font-size:10px}
  @media(max-width:1150px){.sgqs-shell{grid-template-columns:1fr}.sgqs-mods{grid-template-columns:repeat(4,1fr)}}
  @media(max-width:820px){.sgqs-mods{grid-template-columns:1fr 1fr}.sgqs-statefilters{grid-template-columns:1fr 1fr}.sgqs-map{height:470px}}
  @media(max-width:560px){.sgqs-mods,.sgqs-statefilters,.sgqs-kpis,.sgqs-detailgrid{grid-template-columns:1fr}.sgqs-map{height:420px}}
  `;
  document.head.appendChild(s);
}

function store(){
  const d = typeof db !== 'undefined' && db ? db : {};
  return {
    actions:Array.isArray(d.actions)?d.actions:[], audits:Array.isArray(d.audits)?d.audits:[],
    kpis:Array.isArray(d.kpis)?d.kpis:[], risks:Array.isArray(d.risks)?d.risks:[],
    alerts:Array.isArray(d.alerts)?d.alerts:[], events:Array.isArray(d.events)?d.events:[],
    docs:Array.isArray(window.docItems)?window.docItems:[], norms:Array.isArray(window.normItems)?window.normItems:[],
    normAlerts:Array.isArray(window.normAlerts)?window.normAlerts:[]
  };
}

function ufOf(x){
  if(!x || typeof x!=='object') return '';
  const m=x.metadata&&typeof x.metadata==='object'?x.metadata:{};
  const vals=[x.uf,x.state_code,x.estado,x.state,x.company_state,x.unit_state,m.uf,m.state_code,m.estado,m.state,m.company_state,m.unit_state];
  const raw=vals.find(v=>typeof v==='string'&&v.trim());
  if(!raw) return '';
  const t=raw.trim().toUpperCase();
  if(SOUTH.includes(t)) return t;
  if(t.includes('PARAN')) return 'PR';
  if(t.includes('SANTA CATARINA')) return 'SC';
  if(t.includes('RIO GRANDE DO SUL')) return 'RS';
  return '';
}

function moduleData(){
  const s=store(), now=new Date();
  const closed=['concluída','concluida','completed','closed','verified','cancelled','cancelado'];
  const open=s.actions.filter(x=>!closed.includes(String(x.status||'').toLowerCase()));
  const late=open.filter(x=>{const due=x.due||x.due_date;return due&&new Date(String(due).slice(0,10)+'T23:59:59')<now;});
  const badK=s.kpis.filter(x=>Number.isFinite(+x.value)&&Number.isFinite(+x.target)&&+x.value<+x.target);
  const crit=s.risks.filter(x=>(+(x.p||x.probability||0)*+(x.i||x.impact||0))>=15 || String(x.classification||x.level||'').toLowerCase().includes('crít'));
  const due=s.docs.filter(x=>x.next_review_date&&new Date(String(x.next_review_date).slice(0,10)+'T23:59:59')<now);
  const allAlerts=s.alerts.concat(s.normAlerts);
  const score=(base,bad,total)=>clamp(base-(total?(bad/total)*45:0));
  const defs=[
    ['DOCS','Documentos','docs',s.docs,due,score(96,due.length,Math.max(1,s.docs.length)),`${due.length} revisão(ões) vencida(s)`],
    ['ACTIONS','RQ 045 / Ações','actions',open,late,score(95,late.length,Math.max(1,open.length)),`${late.length} ação(ões) atrasada(s)`],
    ['AUDITS','Auditorias','audits',s.audits,[],s.audits.length?88:70,'programadas / realizadas'],
    ['KPIS','Indicadores','kpis',s.kpis,badK,score(94,badK.length,Math.max(1,s.kpis.length)),`${badK.length} fora da meta`],
    ['RISKS','Riscos','risks',s.risks,crit,score(93,crit.length,Math.max(1,s.risks.length)),`${crit.length} crítico(s)`],
    ['NORMS','Normas / Portarias','norms',s.norms,s.normAlerts,score(97,s.normAlerts.length,Math.max(1,s.norms.length)),`${s.normAlerts.length} alerta(s)`],
    ['ALERTS','Agenda / Alertas','agenda',allAlerts,allAlerts,Math.max(45,95-allAlerts.length*3),'pendências e alertas'],
    ['HISTORY','Histórico','history',s.events,[],90,'eventos registrados']
  ];
  return defs.map(([key,name,view,items,badItems,scoreValue,sub])=>({key,name,view,items,badItems,score:scoreValue,sub,count:items.length,bad:badItems.length}));
}

function stateData(mods){
  const out={};
  SOUTH.forEach(code=>{
    let count=0,bad=0;
    mods.forEach(m=>{
      count += m.items.filter(x=>ufOf(x)===code).length;
      bad += m.badItems.filter(x=>ufOf(x)===code).length;
    });
    out[code]={count,bad,score:count?clamp(96-(bad/count)*50):null};
  });
  return out;
}

function ensureShell(){
  const exec=$('execDashboard');
  if(!exec || $('brazilMapBlock')) return;
  const w=document.createElement('div');
  w.id='brazilMapBlock';
  w.innerHTML=`
  <div class="sgqs-shell">
    <section class="sgqs-card sgqs-pad">
      <div class="sgqs-head"><div><h2>Região Sul — Dados do SGQ Manager</h2><p>PR, SC e RS com registros reais carregados no SGQ Manager Online. O consolidado permanece completo mesmo quando o registro ainda não possui UF.</p></div><span class="sgqs-badge">DADOS SGQ · ONLINE</span></div>
      <div class="sgqs-map" id="sgqsMap"><div class="sgqs-mapmsg"><strong>Carregando malhas do IBGE…</strong> Os valores dentro de cada estado serão calculados somente a partir de registros que possuam UF cadastrada.</div></div>
      <div class="sgqs-statefilters" id="sgqsStates"></div>
    </section>
    <aside class="sgqs-side">
      <section class="sgqs-card sgqs-pad"><div class="sgqs-kpis" id="sgqsKpis"></div></section>
      <section class="sgqs-card sgqs-pad"><div class="sgqs-head"><div><h3>Módulos do SGQ</h3><p>Dados atuais do sistema. Clique para detalhar.</p></div></div><div class="sgqs-mods" id="sgqsMods"></div></section>
      <section class="sgqs-detail" id="sgqsDetail"></section>
    </aside>
  </div>
  <section class="sgqs-card sgqs-tablecard"><div class="sgqs-head"><div><h3>Resumo operacional do SGQ</h3><p id="sgqsTableSub">Consolidado do SGQ Manager Online.</p></div><button class="btn alt" id="sgqsExport" type="button">Exportar CSV</button></div><div class="sgqs-tablewrap" id="sgqsTable"></div><div class="sgqs-foot">Saúde é um indicador operacional do painel. Registros sem UF não são atribuídos artificialmente a um estado.</div></section>`;
  const ribbon=$('vectorRibbon');
  (ribbon?.parentNode||exec).insertBefore(w,ribbon?ribbon.nextSibling:exec.firstChild);
}

function allCoordinates(geometry){
  const out=[];
  const walk=a=>{if(!Array.isArray(a))return;if(typeof a[0]==='number'&&typeof a[1]==='number')out.push(a);else a.forEach(walk);};
  walk(geometry?.coordinates);
  return out;
}

function bounds(features){
  const pts=Object.values(features).flatMap(f=>allCoordinates(f.geometry));
  if(!pts.length) return null;
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  pts.forEach(([x,y])=>{minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);});
  return {minX,maxX,minY,maxY};
}

function pathFromGeometry(geometry,b, W=720,H=500,p=28){
  if(!geometry||!b) return '';
  const sx=(W-p*2)/(b.maxX-b.minX||1), sy=(H-p*2)/(b.maxY-b.minY||1), sc=Math.min(sx,sy);
  const ox=(W-(b.maxX-b.minX)*sc)/2, oy=(H-(b.maxY-b.minY)*sc)/2;
  const proj=([x,y])=>[ox+(x-b.minX)*sc,H-(oy+(y-b.minY)*sc)];
  const ring=r=>r.map((pt,i)=>{const [x,y]=proj(pt);return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ')+' Z';
  if(geometry.type==='Polygon') return geometry.coordinates.map(ring).join(' ');
  if(geometry.type==='MultiPolygon') return geometry.coordinates.flatMap(poly=>poly.map(ring)).join(' ');
  return '';
}

function centroid(geometry,b,W=720,H=500,p=28){
  const pts=allCoordinates(geometry);if(!pts.length)return[0,0];
  const avg=[pts.reduce((a,q)=>a+q[0],0)/pts.length,pts.reduce((a,q)=>a+q[1],0)/pts.length];
  const sx=(W-p*2)/(b.maxX-b.minX||1), sy=(H-p*2)/(b.maxY-b.minY||1), sc=Math.min(sx,sy);
  const ox=(W-(b.maxX-b.minX)*sc)/2, oy=(H-(b.maxY-b.minY)*sc)/2;
  return [ox+(avg[0]-b.minX)*sc,H-(oy+(avg[1]-b.minY)*sc)];
}

async function loadIBGE(){
  const tasks=SOUTH.map(async uf=>{
    const r=await fetch(IBGE[uf],{cache:'force-cache'});
    if(!r.ok) throw new Error(`IBGE ${uf}: ${r.status}`);
    const j=await r.json();
    const f=j.type==='FeatureCollection'?j.features?.[0]:j.type==='Feature'?j:null;
    if(!f?.geometry) throw new Error(`Malha ${uf} inválida`);
    mapFeatures[uf]=f;
  });
  await Promise.all(tasks);
}

function fallbackFeatures(){
  const mk=(type,coordinates)=>({type:'Feature',geometry:{type,coordinates},properties:{}});
  mapFeatures={
    PR:mk('Polygon',[[[-54.7,-22.6],[-49.0,-22.6],[-48.4,-25.0],[-54.5,-25.5],[-54.7,-22.6]]]),
    SC:mk('Polygon',[[[-53.9,-25.8],[-48.4,-25.8],[-48.6,-29.3],[-53.8,-28.4],[-53.9,-25.8]]]),
    RS:mk('Polygon',[[[-57.7,-27.1],[-49.7,-28.0],[-49.8,-33.7],[-53.4,-33.8],[-57.7,-30.2],[-57.7,-27.1]]])
  };
}

function drawMap(mods){
  const st=stateData(mods), b=bounds(mapFeatures);
  if(!b){fallbackFeatures();return drawMap(mods);}
  const paths=SOUTH.map(uf=>{
    const d=pathFromGeometry(mapFeatures[uf].geometry,b), [cx,cy]=centroid(mapFeatures[uf].geometry,b), v=st[uf];
    return `<g class="sgqs-state ${selectedUF===uf?'active':''}" data-uf="${uf}"><path d="${d}" fill="${color(v.score)}" fill-opacity="${v.score==null?.28:.72}"/><text class="sgqs-label" x="${cx.toFixed(1)}" y="${(cy-12).toFixed(1)}"><tspan class="uf" x="${cx.toFixed(1)}">${uf}</tspan><tspan class="count" x="${cx.toFixed(1)}" dy="18">${v.count} registro(s)</tspan><tspan class="health" x="${cx.toFixed(1)}" dy="14">${v.score==null?'Sem dados UF':`${v.score}% · ${status(v.score)}`}</tspan></text></g>`;
  }).join('');
  $('sgqsMap').innerHTML=`<svg class="sgqs-svg" viewBox="0 0 720 500" role="img" aria-label="Mapa da Região Sul com dados do SGQ Manager">${paths}</svg><div class="sgqs-mapmsg"><strong>Fonte territorial: IBGE.</strong> Fonte operacional: SGQ Manager Online. Clique em um estado para filtrar os módulos e a tabela.</div>`;
  document.querySelectorAll('.sgqs-state').forEach(el=>el.onclick=()=>{selectedUF=el.dataset.uf;render();});
}

function filteredModule(m){
  if(selectedUF==='ALL') return m;
  const items=m.items.filter(x=>ufOf(x)===selectedUF), badItems=m.badItems.filter(x=>ufOf(x)===selectedUF);
  const score=items.length?clamp(96-(badItems.length/items.length)*50):null;
  return {...m,items,badItems,count:items.length,bad:badItems.length,score};
}

function render(){
  installStyle();ensureShell();if(!$('sgqsMap'))return;
  const mods=moduleData(), fmods=mods.map(filteredModule), selected=fmods.find(x=>x.key===selectedModule)||fmods[0];
  drawMap(mods);
  const st=stateData(mods);
  $('sgqsStates').innerHTML=`<button class="sgqs-statebtn ${selectedUF==='ALL'?'active':''}" data-uf="ALL"><b>Todos</b><small>Consolidado SGQ</small></button>`+SOUTH.map(u=>`<button class="sgqs-statebtn ${selectedUF===u?'active':''}" data-uf="${u}"><b>${u} · ${STATE_NAME[u]}</b><small>${st[u].count} registro(s) · ${st[u].score==null?'sem dados':st[u].score+'%'}</small></button>`).join('');
  document.querySelectorAll('.sgqs-statebtn').forEach(b=>b.onclick=()=>{selectedUF=b.dataset.uf;render();});

  const total=fmods.reduce((a,m)=>a+m.count,0), bad=fmods.reduce((a,m)=>a+m.bad,0), health=fmods.filter(m=>m.score!=null).length?Math.round(fmods.filter(m=>m.score!=null).reduce((a,m)=>a+m.score,0)/fmods.filter(m=>m.score!=null).length):0;
  const noUF=mods.reduce((a,m)=>a+m.items.filter(x=>!ufOf(x)).length,0);
  $('sgqsKpis').innerHTML=`
    <div class="sgqs-kpi"><small>Registros</small><b>${total}</b><span>${selectedUF==='ALL'?'SGQ consolidado':selectedUF}</span></div>
    <div class="sgqs-kpi"><small>Pendências</small><b>${bad}</b><span>itens requerendo atenção</span></div>
    <div class="sgqs-kpi"><small>Saúde média</small><b>${health}%</b><span>${status(health)}</span></div>
    <div class="sgqs-kpi"><small>Sem UF</small><b>${selectedUF==='ALL'?noUF:0}</b><span>permanecem no consolidado</span></div>`;

  $('sgqsMods').innerHTML=fmods.map(m=>`<button class="sgqs-mod ${m.key===selectedModule?'active':''}" data-key="${m.key}" style="--mc:${color(m.score)}"><i></i><span><strong>${esc(m.name)}</strong><small>${esc(m.sub)}</small></span><b>${m.count}</b></button>`).join('');
  document.querySelectorAll('.sgqs-mod').forEach(b=>{b.onclick=()=>{selectedModule=b.dataset.key;render();};b.ondblclick=()=>{const m=fmods.find(x=>x.key===b.dataset.key);const nav=document.querySelector(`.nav[data-view="${m?.view}"]`);if(nav)nav.click();};});

  $('sgqsDetail').innerHTML=`<h3>${esc(selected.name)}</h3><div class="sgqs-detailgrid"><div><small>Registros</small><b>${selected.count}</b></div><div><small>Pendências</small><b>${selected.bad}</b></div><div><small>Saúde</small><b>${selected.score==null?'N/A':selected.score+'%'}</b></div></div><div class="sgqs-actions"><button class="btn alt" id="sgqsOpenModule" type="button">Abrir módulo</button><span class="sgqs-pill" style="background:${color(selected.score)}22;color:${color(selected.score)}">${status(selected.score)}</span></div>`;
  $('sgqsOpenModule').onclick=()=>{const nav=document.querySelector(`.nav[data-view="${selected.view}"]`);if(nav)nav.click();};

  $('sgqsTableSub').textContent=selectedUF==='ALL'?'Consolidado do SGQ Manager Online.':`Filtrado por ${selectedUF} · ${STATE_NAME[selectedUF]}.`;
  $('sgqsTable').innerHTML=`<table class="sgqs-table"><thead><tr><th>Módulo</th><th>Registros</th><th>Pendências</th><th>Saúde</th><th>Situação</th><th>Escopo</th></tr></thead><tbody>${fmods.map(m=>`<tr><td>${esc(m.name)}</td><td>${m.count}</td><td>${m.bad}</td><td>${m.score==null?'N/A':m.score+'%'}</td><td><span class="sgqs-pill" style="background:${color(m.score)}22;color:${color(m.score)}">${status(m.score)}</span></td><td>${selectedUF==='ALL'?'Consolidado':selectedUF}</td></tr>`).join('')}</tbody></table>`;
  $('sgqsExport').onclick=()=>exportCsv(fmods);
}

function exportCsv(mods){
  const rows=[['Escopo','Módulo','Registros','Pendências','Saúde','Situação'],...mods.map(m=>[selectedUF,m.name,m.count,m.bad,m.score==null?'':m.score,status(m.score)])];
  const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`sgq-regiao-sul-${selectedUF.toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

async function init(){
  try{
    if(window.SGQCentralSync?.pullCentral) await window.SGQCentralSync.pullCentral();
  }catch(e){console.warn('[SGQ mapa] sincronização central:',e);}
  try{await loadIBGE();}catch(e){console.warn('[SGQ mapa] IBGE indisponível, usando fallback:',e);fallbackFeatures();}
  render();
}

let tries=0;const timer=setInterval(()=>{tries++;if($('execDashboard')){clearInterval(timer);init();}else if(tries>40)clearInterval(timer);},250);
window.SGQBrazilMap={render,refresh:init,getData:()=>({modules:moduleData(),states:stateData(moduleData())}),setState:uf=>{selectedUF=SOUTH.includes(uf)?uf:'ALL';render();},setModule:key=>{selectedModule=key;render();}};
window.renderBrazilMap=render;
})();