(() => {
'use strict';

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scoreClass = (v) => v == null ? 'neutral' : v >= 80 ? 'ok' : v >= 60 ? 'warn' : v >= 40 ? 'risk' : 'crit';
const scoreColor = (v) => v == null ? '#6f8194' : v >= 80 ? '#35c46a' : v >= 60 ? '#e7b93f' : v >= 40 ? '#ef8d3e' : '#e45b5b';
const scoreLabel = (v) => v == null ? 'Sem dados por UF' : v >= 80 ? 'Bom / Conforme' : v >= 60 ? 'Atenção' : v >= 40 ? 'Risco' : 'Crítico';
const SOUTH = ['PR','SC','RS'];
let selectedModule = 'ACTIONS';
let selectedUF = 'ALL';

function installStyle(){
  if ($('southMapV2Style')) return;
  const s = document.createElement('style');
  s.id = 'southMapV2Style';
  s.textContent = `
  .sgqs-shell{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:16px;margin-top:14px}
  .sgqs-card{background:linear-gradient(180deg,var(--panel),color-mix(in srgb,var(--panel) 94%,#000));border:1px solid var(--line);border-radius:18px;box-shadow:0 12px 34px rgba(0,0,0,.12)}
  .sgqs-map-card{padding:18px}.sgqs-side-card{padding:14px}.sgqs-table-card{padding:16px;margin-top:16px}
  .sgqs-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap}.sgqs-head h2,.sgqs-head h3{margin:0}.sgqs-head h2{font-size:23px}.sgqs-head p{margin:5px 0 0;color:var(--muted);max-width:720px}
  .sgqs-badge{padding:6px 10px;border-radius:999px;border:1px solid rgba(53,196,106,.42);background:rgba(53,196,106,.08);color:#87e8ab;font-size:10px;font-weight:900;letter-spacing:.08em;white-space:nowrap}
  .sgqs-map-wrap{position:relative;height:560px;margin-top:14px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:radial-gradient(circle at 55% 38%,rgba(38,126,210,.16),transparent 56%),linear-gradient(180deg,var(--panel2),color-mix(in srgb,var(--panel2) 89%,#000))}
  .sgqs-map{width:100%;height:100%;display:block}.sgqs-map-title{fill:#7590aa;font-size:12px;font-weight:900;letter-spacing:.16em}.sgqs-state{cursor:pointer}.sgqs-state path{fill:#193650;stroke:#6f8ca8;stroke-width:2.2;vector-effect:non-scaling-stroke;transition:filter .16s ease,opacity .16s ease,stroke-width .16s ease}.sgqs-state:hover path{filter:brightness(1.14)}.sgqs-state.active path{stroke:#7cc9ff;stroke-width:3.2}.sgqs-state.dim path{opacity:.47}.sgqs-state text{pointer-events:none;text-anchor:middle}.sgqs-uf{fill:#f4f8fb;font-size:27px;font-weight:950}.sgqs-name{fill:#a9bdd1;font-size:10px;font-weight:800;letter-spacing:.04em}.sgqs-state-score{fill:#d8e7f3;font-size:11px;font-weight:900}
  .sgqs-legend{position:absolute;left:14px;bottom:14px;display:flex;gap:11px;flex-wrap:wrap;background:rgba(5,15,27,.9);border:1px solid var(--line);border-radius:12px;padding:8px 10px;font-size:10px;color:#cbd7e4}.sgqs-legend span{display:flex;align-items:center;gap:5px}.sgqs-dot{width:8px;height:8px;border-radius:50%;display:inline-block}.sgqs-map-note{position:absolute;right:14px;bottom:14px;max-width:270px;background:rgba(5,15,27,.86);border:1px solid var(--line);border-radius:12px;padding:9px 10px;font-size:10px;color:#9fb4c8}
  .sgqs-side{display:grid;gap:12px;align-content:start}.sgqs-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.sgqs-kpi{padding:12px;background:var(--panel2);border:1px solid var(--line);border-radius:13px;text-align:center}.sgqs-kpi small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase}.sgqs-kpi b{display:block;font-size:24px;margin-top:3px}.sgqs-kpi span{font-size:10px;color:var(--muted)}
  .sgqs-module-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sgqs-module{display:grid;grid-template-columns:11px 1fr auto;gap:8px;align-items:center;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);cursor:pointer;min-width:0;transition:transform .14s ease,border-color .14s ease}.sgqs-module:hover{transform:translateY(-1px)}.sgqs-module.active{border-color:var(--module-color);box-shadow:0 0 0 1px color-mix(in srgb,var(--module-color) 35%,transparent)}.sgqs-module i{width:9px;height:9px;border-radius:50%;background:var(--module-color)}.sgqs-module strong{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgqs-module small{display:block;font-size:9px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgqs-module b{font-size:17px}
  .sgqs-detail{padding:13px;background:var(--panel2);border:1px solid var(--line);border-radius:14px}.sgqs-detail h3{margin:0 0 9px}.sgqs-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.sgqs-detail-grid div{padding:8px;border:1px solid var(--line);border-radius:9px}.sgqs-detail-grid small{display:block;color:var(--muted);font-size:9px}.sgqs-detail-grid b{font-size:15px}.sgqs-detail-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
  .sgqs-state-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.sgqs-state-chip{padding:9px 10px;border:1px solid var(--line);border-radius:11px;background:var(--panel2);cursor:pointer;text-align:left}.sgqs-state-chip.active{border-color:#7cc9ff}.sgqs-state-chip b{display:block;font-size:12px}.sgqs-state-chip small{display:block;color:var(--muted);font-size:9px;margin-top:2px}
  .sgqs-table-wrap{overflow:auto;max-height:350px}.sgqs-table{width:100%;min-width:820px;border-collapse:collapse}.sgqs-table th,.sgqs-table td{padding:9px;border-bottom:1px solid var(--line);font-size:12px;text-align:left}.sgqs-table th{position:sticky;top:0;background:var(--panel);z-index:1}.sgqs-pill{display:inline-block;padding:3px 7px;border-radius:999px;font-weight:800}.sgqs-pill.ok{color:#86e7aa;background:rgba(53,196,106,.10)}.sgqs-pill.warn{color:#ffe089;background:rgba(231,185,63,.10)}.sgqs-pill.risk{color:#ffb279;background:rgba(239,141,62,.10)}.sgqs-pill.crit{color:#ff9292;background:rgba(228,91,91,.10)}.sgqs-pill.neutral{color:#b5c4d2;background:rgba(111,129,148,.12)}
  .sgqs-foot{margin-top:9px;color:var(--muted);font-size:10px}
  @media(max-width:1150px){.sgqs-shell{grid-template-columns:1fr}.sgqs-map-wrap{height:520px}.sgqs-module-list{grid-template-columns:repeat(4,1fr)}}
  @media(max-width:820px){.sgqs-module-list{grid-template-columns:1fr 1fr}.sgqs-kpis{grid-template-columns:1fr 1fr 1fr}.sgqs-state-strip{grid-template-columns:1fr 1fr}.sgqs-map-wrap{height:470px}.sgqs-map-note{display:none}}
  @media(max-width:560px){.sgqs-module-list,.sgqs-kpis,.sgqs-state-strip,.sgqs-detail-grid{grid-template-columns:1fr}.sgqs-map-wrap{height:420px}.sgqs-map-card,.sgqs-side-card,.sgqs-table-card{padding:12px}}
  `;
  document.head.appendChild(s);
}

function getStore(){
  const d = typeof db !== 'undefined' && db ? db : {actions:[],audits:[],kpis:[],risks:[],alerts:[],events:[]};
  return {
    actions: Array.isArray(d.actions) ? d.actions : [], audits: Array.isArray(d.audits) ? d.audits : [],
    kpis: Array.isArray(d.kpis) ? d.kpis : [], risks: Array.isArray(d.risks) ? d.risks : [],
    alerts: Array.isArray(d.alerts) ? d.alerts : [], events: Array.isArray(d.events) ? d.events : [],
    docs: Array.isArray(window.docItems) ? window.docItems : [], norms: Array.isArray(window.normItems) ? window.normItems : [],
    normAlerts: Array.isArray(window.normAlerts) ? window.normAlerts : []
  };
}

function ufFromRecord(x){
  if (!x || typeof x !== 'object') return '';
  const m = x.metadata && typeof x.metadata === 'object' ? x.metadata : {};
  const cands = [x.uf,x.state_code,x.estado,x.state,x.company_state,x.unit_state,m.uf,m.state_code,m.estado,m.state];
  const raw = cands.find(v => typeof v === 'string' && v.trim());
  if (!raw) return '';
  const t = raw.trim().toUpperCase();
  if (SOUTH.includes(t)) return t;
  if (t.includes('PARAN')) return 'PR';
  if (t.includes('SANTA CATARINA')) return 'SC';
  if (t.includes('RIO GRANDE DO SUL')) return 'RS';
  return '';
}

function moduleData(){
  const s = getStore();
  const now = new Date();
  const openActions = s.actions.filter(x => !['concluída','concluida','completed','closed','verified'].includes(String(x.status||'').toLowerCase()));
  const lateActions = openActions.filter(x => x.due && new Date(x.due + 'T23:59:59') < now);
  const badKpis = s.kpis.filter(x => Number.isFinite(+x.value) && Number.isFinite(+x.target) && +x.value < +x.target);
  const criticalRisks = s.risks.filter(x => (+(x.p||x.probability||0) * +(x.i||x.impact||0)) >= 15);
  const overdueDocs = s.docs.filter(x => x.next_review_date && new Date(x.next_review_date + 'T23:59:59') < now);
  const score = (base,bad,total) => Math.max(0,Math.min(100,Math.round(base-(total ? (bad/total)*45 : 0))));
  const modules = [
    {key:'DOCS',name:'Documentos',view:'docs',items:s.docs,badItems:overdueDocs,score:score(96,overdueDocs.length,Math.max(1,s.docs.length)),sub:`${overdueDocs.length} revisão(ões) vencida(s)`},
    {key:'ACTIONS',name:'RQ 045 / Ações',view:'actions',items:openActions,badItems:lateActions,score:score(95,lateActions.length,Math.max(1,openActions.length)),sub:`${lateActions.length} ação(ões) atrasada(s)`},
    {key:'AUDITS',name:'Auditorias',view:'audits',items:s.audits,badItems:[],score:s.audits.length?88:70,sub:'programadas / realizadas'},
    {key:'KPIS',name:'Indicadores',view:'kpis',items:s.kpis,badItems:badKpis,score:score(94,badKpis.length,Math.max(1,s.kpis.length)),sub:`${badKpis.length} fora da meta`},
    {key:'RISKS',name:'Riscos',view:'risks',items:s.risks,badItems:criticalRisks,score:score(93,criticalRisks.length,Math.max(1,s.risks.length)),sub:`${criticalRisks.length} crítico(s)`},
    {key:'NORMS',name:'Normas / Portarias',view:'norms',items:s.norms,badItems:s.normAlerts,score:score(97,s.normAlerts.length,Math.max(1,s.norms.length)),sub:`${s.normAlerts.length} alerta(s)`},
    {key:'ALERTS',name:'Agenda / Alertas',view:'agenda',items:s.alerts.concat(s.normAlerts),badItems:s.alerts.concat(s.normAlerts),score:Math.max(45,95-(s.alerts.length+s.normAlerts.length)*3),sub:'pendências e alertas'},
    {key:'HISTORY',name:'Histórico',view:'history',items:s.events,badItems:[],score:90,sub:'eventos registrados'}
  ];
  return modules.map(m => ({...m,count:m.items.length,bad:m.badItems.length}));
}

function stateStats(modules){
  const out = {};
  SOUTH.forEach(uf => {
    const rows = modules.map(m => {
      const items = m.items.filter(x => ufFromRecord(x) === uf);
      const bad = m.badItems.filter(x => ufFromRecord(x) === uf);
      return {key:m.key,count:items.length,bad:bad.length};
    });
    const tagged = rows.reduce((a,r)=>a+r.count,0);
    const bad = rows.reduce((a,r)=>a+r.bad,0);
    const health = tagged ? Math.max(0,Math.min(100,Math.round(96-(bad/tagged)*50))) : null;
    out[uf] = {uf,tagged,bad,health,rows};
  });
  return out;
}

function ensureShell(){
  const exec = $('execDashboard');
  if (!exec || $('brazilMapBlock')) return false;
  const wrap = document.createElement('div');
  wrap.id = 'brazilMapBlock';
  wrap.innerHTML = `
    <div class="sgqs-shell">
      <section class="sgqs-card sgqs-map-card">
        <div class="sgqs-head">
          <div><h2>Região Sul — Visão SGQ Manager</h2><p>Mapa executivo com foco em PR, SC e RS. Os estados só recebem números quando os registros do SGQ possuem informação de UF.</p></div>
          <span class="sgqs-badge">REGIÃO SUL · ONLINE</span>
        </div>
        <div class="sgqs-map-wrap"><div id="sgqsMapVisual"></div><div id="sgqsLegend" class="sgqs-legend"></div><div class="sgqs-map-note">Sem atribuição fictícia: registros sem UF continuam no consolidado geral e não são distribuídos pelos estados.</div></div>
        <div class="sgqs-state-strip" id="sgqsStateStrip"></div>
      </section>
      <aside class="sgqs-side">
        <section class="sgqs-card sgqs-side-card"><div class="sgqs-kpis" id="sgqsKpis"></div></section>
        <section class="sgqs-card sgqs-side-card"><div class="sgqs-head"><div><h3>Módulos do SGQ</h3><p>Selecione para detalhar. Duplo clique abre o módulo.</p></div></div><div class="sgqs-module-list" id="sgqsModules"></div></section>
        <section class="sgqs-detail" id="sgqsDetail"></section>
      </aside>
    </div>
    <section class="sgqs-card sgqs-table-card">
      <div class="sgqs-head"><div><h3>Resumo operacional</h3><p id="sgqsTableSub">Consolidado do SGQ Manager Online.</p></div><button class="btn alt" id="sgqsExport" type="button">Exportar CSV</button></div>
      <div class="sgqs-table-wrap" id="sgqsTable"></div>
      <div class="sgqs-foot">Fonte: dados carregados no SGQ Manager Online. A saúde exibida é um indicador operacional do painel, não substitui critérios formais de auditoria ou conformidade.</div>
    </section>`;
  const ribbon = $('vectorRibbon');
  (ribbon?.parentNode || exec).insertBefore(wrap, ribbon ? ribbon.nextSibling : exec.firstChild);
  return true;
}

function openView(view){
  const btn = document.querySelector(`.nav[data-view="${view}"]`);
  if (btn) btn.click();
}

function statePathSvg(stats){
  const state = (uf,name,path,cx,cy) => {
    const st = stats[uf];
    const active = selectedUF === uf;
    const dim = selectedUF !== 'ALL' && !active;
    const score = st.health;
    const fill = score == null ? '#193650' : `color-mix(in srgb, ${scoreColor(score)} 26%, #193650)`;
    return `<g class="sgqs-state ${active?'active':''} ${dim?'dim':''}" data-uf="${uf}"><path style="fill:${fill}" d="${path}"/><text class="sgqs-uf" x="${cx}" y="${cy-7}">${uf}</text><text class="sgqs-name" x="${cx}" y="${cy+12}">${name}</text><text class="sgqs-state-score" x="${cx}" y="${cy+31}">${score==null?'SEM DADOS UF':`${score}% · ${st.tagged} REG.`}</text></g>`;
  };
  return `
  <svg class="sgqs-map" viewBox="0 0 720 560" role="img" aria-label="Mapa executivo da Região Sul do Brasil">
    <text class="sgqs-map-title" x="34" y="38">REGIÃO SUL · BRASIL</text>
    ${state('PR','PARANÁ','M214 70 L310 53 L402 60 L490 48 L554 78 L590 116 L574 154 L520 181 L454 186 L397 176 L338 189 L286 171 L239 143 L207 108 Z',401,121)}
    ${state('SC','SANTA CATARINA','M284 198 L347 181 L408 187 L470 181 L532 198 L576 221 L558 248 L506 258 L457 274 L405 263 L351 269 L305 251 L275 224 Z',426,226)}
    ${state('RS','RIO GRANDE DO SUL','M260 286 L331 262 L399 270 L458 267 L515 285 L553 319 L548 365 L518 410 L493 462 L454 510 L410 541 L365 526 L329 493 L299 453 L273 405 L241 371 L228 326 Z',392,389)}
  </svg>`;
}

function render(){
  installStyle();
  ensureShell();
  if (!$('sgqsMapVisual')) return;
  const modules = moduleData();
  const states = stateStats(modules);
  if (!modules.some(m=>m.key===selectedModule)) selectedModule = 'ACTIONS';
  const selected = modules.find(m=>m.key===selectedModule) || modules[0];
  const scopedItems = selectedUF === 'ALL' ? selected.items : selected.items.filter(x=>ufFromRecord(x)===selectedUF);
  const scopedBad = selectedUF === 'ALL' ? selected.badItems : selected.badItems.filter(x=>ufFromRecord(x)===selectedUF);
  const avg = Math.round(modules.reduce((a,m)=>a+m.score,0)/Math.max(1,modules.length));
  const pending = modules.reduce((a,m)=>a+m.bad,0);
  const total = modules.reduce((a,m)=>a+m.count,0);
  const taggedSouth = SOUTH.reduce((a,uf)=>a+states[uf].tagged,0);

  $('sgqsMapVisual').innerHTML = statePathSvg(states);
  $('sgqsLegend').innerHTML = `<span><i class="sgqs-dot" style="background:#35c46a"></i>Bom ≥80</span><span><i class="sgqs-dot" style="background:#e7b93f"></i>Atenção 60–79</span><span><i class="sgqs-dot" style="background:#ef8d3e"></i>Risco 40–59</span><span><i class="sgqs-dot" style="background:#e45b5b"></i>Crítico &lt;40</span><span><i class="sgqs-dot" style="background:#6f8194"></i>Sem UF</span>`;
  $('sgqsMapVisual').querySelectorAll('.sgqs-state').forEach(el => el.onclick = () => {selectedUF = selectedUF === el.dataset.uf ? 'ALL' : el.dataset.uf; render();});

  $('sgqsStateStrip').innerHTML = `<button class="sgqs-state-chip ${selectedUF==='ALL'?'active':''}" data-uf="ALL"><b>Região Sul</b><small>${taggedSouth} registro(s) com UF</small></button>` + SOUTH.map(uf=>`<button class="sgqs-state-chip ${selectedUF===uf?'active':''}" data-uf="${uf}"><b>${uf} · ${scoreLabel(states[uf].health)}</b><small>${states[uf].tagged} registro(s) · ${states[uf].bad} pendência(s)</small></button>`).join('');
  $('sgqsStateStrip').querySelectorAll('[data-uf]').forEach(b=>b.onclick=()=>{selectedUF=b.dataset.uf;render();});

  $('sgqsKpis').innerHTML = `<div class="sgqs-kpi"><small>Saúde média</small><b style="color:${scoreColor(avg)}">${avg}%</b><span>${scoreLabel(avg)}</span></div><div class="sgqs-kpi"><small>Pendências</small><b>${pending}</b><span>consolidado</span></div><div class="sgqs-kpi"><small>Registros</small><b>${total}</b><span>módulos do painel</span></div>`;

  $('sgqsModules').innerHTML = modules.map(m=>`<div class="sgqs-module ${m.key===selectedModule?'active':''}" data-key="${m.key}" data-view="${m.view}" style="--module-color:${scoreColor(m.score)}"><i></i><div><strong>${esc(m.name)}</strong><small>${esc(m.sub)}</small></div><b>${m.count}</b></div>`).join('');
  $('sgqsModules').querySelectorAll('.sgqs-module').forEach(el=>{
    el.onclick=()=>{selectedModule=el.dataset.key;render();};
    el.ondblclick=()=>openView(el.dataset.view);
  });

  $('sgqsDetail').innerHTML = `<h3>${esc(selected.name)} ${selectedUF==='ALL'?'· Consolidado':`· ${selectedUF}`}</h3><div class="sgqs-detail-grid"><div><small>Registros</small><b>${scopedItems.length}</b></div><div><small>Pendências</small><b>${scopedBad.length}</b></div><div><small>Saúde geral</small><b style="color:${scoreColor(selected.score)}">${selected.score}%</b></div></div><p class="muted" style="margin:10px 0 0">${selectedUF==='ALL' ? esc(selected.sub) : (scopedItems.length ? `Filtro territorial aplicado aos registros com UF ${selectedUF}.` : `Não há registros deste módulo identificados com UF ${selectedUF}.`)}</p><div class="sgqs-detail-actions"><button class="btn" id="sgqsOpenModule" type="button">Abrir módulo</button><button class="btn alt" id="sgqsClearUF" type="button">${selectedUF==='ALL'?'Visão consolidada':'Limpar filtro UF'}</button></div>`;
  $('sgqsOpenModule').onclick=()=>openView(selected.view);
  $('sgqsClearUF').onclick=()=>{selectedUF='ALL';render();};

  $('sgqsTableSub').textContent = selectedUF === 'ALL' ? 'Consolidado do SGQ Manager Online.' : `Filtro territorial: ${selectedUF}. Apenas registros com UF cadastrada entram neste recorte.`;
  $('sgqsTable').innerHTML = `<table class="sgqs-table"><thead><tr><th>Módulo</th><th>Registros</th><th>Pendências</th><th>Saúde</th><th>Situação</th><th>Ação</th></tr></thead><tbody>${modules.map(m=>{const count=selectedUF==='ALL'?m.count:m.items.filter(x=>ufFromRecord(x)===selectedUF).length;const bad=selectedUF==='ALL'?m.bad:m.badItems.filter(x=>ufFromRecord(x)===selectedUF).length;return `<tr><td>${esc(m.name)}</td><td>${count}</td><td>${bad}</td><td>${m.score}%</td><td><span class="sgqs-pill ${scoreClass(m.score)}">${scoreLabel(m.score)}</span></td><td><button class="btn alt sgqs-open" data-view="${m.view}" type="button">Abrir</button></td></tr>`}).join('')}</tbody></table>`;
  $('sgqsTable').querySelectorAll('.sgqs-open').forEach(b=>b.onclick=()=>openView(b.dataset.view));
  $('sgqsExport').onclick=()=>exportCsv(modules,selectedUF);
}

function exportCsv(modules,uf){
  const rows = modules.map(m=>{const count=uf==='ALL'?m.count:m.items.filter(x=>ufFromRecord(x)===uf).length;const bad=uf==='ALL'?m.bad:m.badItems.filter(x=>ufFromRecord(x)===uf).length;return [m.name,uf,count,bad,m.score,scoreLabel(m.score)]});
  const q=v=>`"${String(v??'').replaceAll('"','""')}"`;
  const csv=[['Modulo','UF','Registros','Pendencias','Saude','Situacao'],...rows].map(r=>r.map(q).join(';')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));a.download=`SGQ_Manager_Regiao_Sul_${uf}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

window.renderBrazilMap = render;
window.SGQBrazilMap = {render,setUF:(uf)=>{selectedUF=SOUTH.includes(uf)?uf:'ALL';render();},getUF:()=>selectedUF};
setTimeout(()=>{try{render();}catch(e){console.error('SGQ Região Sul',e);}},1200);
})();