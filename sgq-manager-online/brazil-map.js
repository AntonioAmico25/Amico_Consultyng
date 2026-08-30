(() => {
'use strict';

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cls = v => v >= 80 ? 'ok' : v >= 60 ? 'warn' : v >= 40 ? 'risk' : 'crit';
const color = v => v >= 80 ? '#33c46b' : v >= 60 ? '#f2c94c' : v >= 40 ? '#f2994a' : '#eb5757';
const label = v => v >= 80 ? 'Bom / Conforme' : v >= 60 ? 'Atenção' : v >= 40 ? 'Risco' : 'Crítico';
let selected = 'ACTIONS';

function installStyle(){
  if ($('brMapStyle')) return;
  const s = document.createElement('style');
  s.id = 'brMapStyle';
  s.textContent = `
  .south-shell{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.85fr);gap:14px}
  .south-card{background:linear-gradient(180deg,var(--panel),color-mix(in srgb,var(--panel) 92%,#000));border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 12px 34px rgba(0,0,0,.12)}
  .south-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:12px}.south-head h2,.south-head h3{margin:0}.south-head h2{font-size:23px}.south-head p{margin:5px 0 0;color:var(--muted)}
  .south-badge{padding:6px 10px;border-radius:999px;border:1px solid rgba(51,196,107,.42);background:rgba(51,196,107,.08);color:#7fe3a5;font-size:11px;font-weight:800;letter-spacing:.04em}
  .south-map-wrap{position:relative;height:590px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:radial-gradient(circle at 55% 40%,rgba(22,134,255,.13),transparent 52%),linear-gradient(180deg,var(--panel2),color-mix(in srgb,var(--panel2) 88%,#000))}
  .south-map-svg{width:100%;height:100%;display:block}.south-state{cursor:pointer;transition:filter .18s ease,opacity .18s ease}.south-state path{fill:#173451;stroke:#6082a6;stroke-width:2.2;vector-effect:non-scaling-stroke}.south-state:hover path{filter:brightness(1.18)}.south-state text{fill:#d9e9f8;text-anchor:middle;font-weight:900;pointer-events:none}.south-state .uf{font-size:22px}.south-state .state-name{font-size:11px;fill:#9fb7cf}.south-watermark{fill:#7890aa;font-size:12px;letter-spacing:.16em;font-weight:800}
  .south-marker{cursor:pointer}.south-marker circle{fill:#081523;stroke-width:4;filter:drop-shadow(0 5px 9px rgba(0,0,0,.38));transition:transform .14s ease}.south-marker:hover circle,.south-marker.active circle{transform:scale(1.08);transform-box:fill-box;transform-origin:center}.south-marker text{fill:#fff;text-anchor:middle;pointer-events:none}.south-marker .m-num{font-size:18px;font-weight:900}.south-marker .m-short{font-size:9px;font-weight:800;fill:#d6e4f1}.south-marker.active circle{stroke-width:6}
  .south-legend{position:absolute;left:14px;bottom:14px;display:flex;gap:12px;flex-wrap:wrap;background:rgba(5,15,27,.88);border:1px solid var(--line);border-radius:12px;padding:8px 10px;font-size:10px;color:#cbd7e4}.south-legend span{display:flex;align-items:center;gap:5px}.south-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
  .south-side{display:grid;gap:10px;align-content:start}.south-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.south-kpi{background:var(--panel2);border:1px solid var(--line);border-radius:13px;padding:11px;text-align:center}.south-kpi small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase}.south-kpi b{display:block;font-size:23px;margin-top:2px}
  .south-module-list{display:grid;gap:7px}.south-module{display:grid;grid-template-columns:11px 1fr auto;gap:9px;align-items:center;padding:9px 10px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);cursor:pointer;transition:border-color .15s ease,transform .15s ease}.south-module:hover{transform:translateY(-1px)}.south-module.active{border-color:var(--module-color);box-shadow:0 0 0 1px color-mix(in srgb,var(--module-color) 42%,transparent)}.south-module i{width:9px;height:9px;border-radius:50%;background:var(--module-color)}.south-module strong{font-size:12px}.south-module small{display:block;color:var(--muted);font-size:10px;margin-top:2px}.south-module b{font-size:17px}
  .south-detail{background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:13px}.south-detail h3{margin:0 0 9px}.south-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.south-detail-grid div{border:1px solid var(--line);border-radius:9px;padding:8px}.south-detail-grid small{color:var(--muted)}
  .south-table-card{margin-top:14px}.south-table-wrap{overflow:auto;max-height:320px}.south-table{width:100%;min-width:760px;border-collapse:collapse}.south-table th,.south-table td{padding:9px;border-bottom:1px solid var(--line);font-size:12px;text-align:left}.south-table th{position:sticky;top:0;background:var(--panel);z-index:1}.south-pill{display:inline-block;padding:3px 7px;border-radius:999px;font-weight:800}.south-pill.ok{color:#7fe3a5;background:rgba(51,196,107,.10)}.south-pill.warn{color:#ffe080;background:rgba(242,201,76,.10)}.south-pill.risk{color:#ffb276;background:rgba(242,153,74,.10)}.south-pill.crit{color:#ff8c8c;background:rgba(235,87,87,.10)}
  .south-foot{margin-top:9px;color:var(--muted);font-size:10px}.south-btn{white-space:nowrap}
  @media(max-width:1100px){.south-shell{grid-template-columns:1fr}.south-side{grid-template-columns:1fr 1fr}.south-kpi-grid,.south-detail{grid-column:1/-1}}
  @media(max-width:720px){.south-map-wrap{height:500px}.south-side{grid-template-columns:1fr}.south-kpi-grid,.south-detail{grid-column:auto}.south-kpi-grid{grid-template-columns:1fr 1fr 1fr}}
  `;
  document.head.appendChild(s);
}

function getData(){
  const d = typeof db !== 'undefined' && db ? db : {actions:[],audits:[],kpis:[],risks:[],alerts:[],events:[]};
  const docs = Array.isArray(window.docItems) ? window.docItems : [];
  const norms = Array.isArray(window.normItems) ? window.normItems : [];
  const normAlerts = Array.isArray(window.normAlerts) ? window.normAlerts : [];
  const now = new Date();
  const actions = d.actions || [];
  const openActions = actions.filter(x => !['concluída','concluida','completed','closed','verified'].includes(String(x.status||'').toLowerCase()));
  const lateActions = openActions.filter(x => x.due && new Date(x.due + 'T23:59:59') < now);
  const audits = d.audits || [];
  const kpis = d.kpis || [];
  const risks = d.risks || [];
  const badKpis = kpis.filter(x => Number.isFinite(+x.value) && Number.isFinite(+x.target) && +x.value < +x.target).length;
  const criticalRisks = risks.filter(x => (+(x.p||x.probability||0) * +(x.i||x.impact||0)) >= 15).length;
  const overdueDocs = docs.filter(x => x.next_review_date && new Date(x.next_review_date + 'T23:59:59') < now).length;
  const alerts = (d.alerts || []).length + normAlerts.length;
  const score = (base,bad,total) => Math.max(0,Math.min(100,Math.round(base-(total ? (bad/total)*45 : 0))));
  return [
    {key:'DOCS',name:'Documentos',short:'DOC',view:'docs',count:docs.length,bad:overdueDocs,score:score(96,overdueDocs,Math.max(1,docs.length)),sub:`${overdueDocs} revisão(ões) vencida(s)`,x:350,y:100},
    {key:'ACTIONS',name:'RQ 045 / Ações',short:'RQ45',view:'actions',count:openActions.length,bad:lateActions.length,score:score(95,lateActions.length,Math.max(1,openActions.length)),sub:`${lateActions.length} ação(ões) atrasada(s)`,x:500,y:130},
    {key:'AUDITS',name:'Auditorias',short:'AUD',view:'audits',count:audits.length,bad:0,score:audits.length?88:70,sub:'programadas / realizadas',x:425,y:205},
    {key:'KPIS',name:'Indicadores',short:'KPI',view:'kpis',count:kpis.length,bad:badKpis,score:score(94,badKpis,Math.max(1,kpis.length)),sub:`${badKpis} fora da meta`,x:535,y:265},
    {key:'RISKS',name:'Riscos',short:'RIS',view:'risks',count:risks.length,bad:criticalRisks,score:score(93,criticalRisks,Math.max(1,risks.length)),sub:`${criticalRisks} crítico(s)`,x:350,y:300},
    {key:'NORMS',name:'Normas / Portarias',short:'NOR',view:'norms',count:norms.length,bad:normAlerts.length,score:score(97,normAlerts.length,Math.max(1,norms.length)),sub:`${normAlerts.length} alerta(s)`,x:465,y:365},
    {key:'ALERTS',name:'Agenda / Alertas',short:'ALT',view:'agenda',count:alerts,bad:alerts,score:Math.max(45,95-alerts*3),sub:'pendências e alertas',x:315,y:420},
    {key:'HISTORY',name:'Histórico',short:'HIS',view:'history',count:(d.events||[]).length,bad:0,score:90,sub:'eventos registrados',x:430,y:485}
  ];
}

function ensureShell(){
  const exec = $('execDashboard');
  if (!exec || $('brazilMapBlock')) return false;
  const wrap = document.createElement('div');
  wrap.id = 'brazilMapBlock';
  wrap.innerHTML = `
    <div class="south-shell">
      <section class="south-card">
        <div class="south-head">
          <div><h2>Região Sul — Visão SGQ</h2><p>Mapa executivo do SGQ Manager Online com foco em Paraná, Santa Catarina e Rio Grande do Sul.</p></div>
          <span class="south-badge">LAYOUT SUL · DADOS ONLINE</span>
        </div>
        <div class="south-map-wrap" id="southMapVisual"></div>
        <div class="south-foot">Os marcadores representam módulos do SGQ Manager. A posição no mapa é visual e não atribui os registros a um estado sem informação de UF cadastrada.</div>
      </section>
      <aside class="south-side">
        <div class="south-kpi-grid" id="southKpis"></div>
        <div class="south-card"><div class="south-head"><div><h3>Módulos do SGQ</h3><p>Selecione para detalhar.</p></div></div><div class="south-module-list" id="southModuleList"></div></div>
        <div class="south-detail" id="southDetail"></div>
      </aside>
    </div>
    <section class="south-card south-table-card">
      <div class="south-head"><div><h3>Resumo operacional do SGQ Manager</h3><p>Registros, pendências, saúde e situação por módulo.</p></div><button class="btn alt south-btn" id="southExportCsv" type="button">Exportar CSV</button></div>
      <div class="south-table-wrap" id="southTable"></div>
    </section>`;
  const ribbon = $('vectorRibbon');
  (ribbon?.parentNode || exec).insertBefore(wrap, ribbon ? ribbon.nextSibling : exec.firstChild);
  return true;
}

function openView(view){
  const btn = document.querySelector(`.nav[data-view="${view}"]`);
  if (btn) btn.click();
}

function renderMap(rows){
  const markers = rows.map(r => `
    <g class="south-marker ${r.key===selected?'active':''}" data-key="${r.key}" data-view="${r.view}" transform="translate(${r.x},${r.y})">
      <circle r="34" stroke="${color(r.score)}"/>
      <text class="m-num" y="1">${r.count}</text>
      <text class="m-short" y="17">${esc(r.short)}</text>
    </g>`).join('');
  $('southMapVisual').innerHTML = `
    <svg class="south-map-svg" viewBox="0 0 760 590" role="img" aria-label="Mapa da Região Sul com módulos do SGQ Manager">
      <text class="south-watermark" x="36" y="42">REGIÃO SUL · BRASIL</text>
      <g class="south-state" data-uf="PR">
        <path d="M268 58 L352 47 L429 63 L492 54 L548 80 L575 119 L558 158 L505 181 L452 177 L404 191 L351 175 L307 153 L276 117 Z"/>
        <text class="uf" x="424" y="115">PR</text><text class="state-name" x="424" y="134">PARANÁ</text>
      </g>
      <g class="south-state" data-uf="SC">
        <path d="M314 192 L373 180 L430 191 L485 184 L543 201 L576 224 L557 249 L505 254 L459 269 L414 258 L367 264 L326 245 L301 218 Z"/>
        <text class="uf" x="445" y="224">SC</text><text class="state-name" x="445" y="242">SANTA CATARINA</text>
      </g>
      <g class="south-state" data-uf="RS">
        <path d="M282 275 L346 259 L406 272 L457 268 L511 287 L545 322 L537 366 L507 404 L487 454 L451 506 L411 545 L366 525 L336 487 L307 452 L284 404 L251 370 L242 327 Z"/>
        <text class="uf" x="398" y="382">RS</text><text class="state-name" x="398" y="402">RIO GRANDE DO SUL</text>
      </g>
      ${markers}
    </svg>
    <div class="south-legend"><span><i class="south-dot" style="background:#33c46b"></i>Bom ≥80</span><span><i class="south-dot" style="background:#f2c94c"></i>Atenção 60–79</span><span><i class="south-dot" style="background:#f2994a"></i>Risco 40–59</span><span><i class="south-dot" style="background:#eb5757"></i>Crítico &lt;40</span></div>`;
  $('southMapVisual').querySelectorAll('.south-marker').forEach(node => {
    node.onclick = () => { selected = node.dataset.key; render(); };
    node.ondblclick = () => openView(node.dataset.view);
  });
}

function renderSide(rows){
  const avg = rows.length ? Math.round(rows.reduce((a,b)=>a+b.score,0)/rows.length) : 0;
  const pending = rows.reduce((a,b)=>a+(b.bad||0),0);
  const atRisk = rows.filter(r=>r.score<60).length;
  $('southKpis').innerHTML = `
    <div class="south-kpi"><small>Saúde média</small><b style="color:${color(avg)}">${avg}%</b></div>
    <div class="south-kpi"><small>Pendências</small><b>${pending}</b></div>
    <div class="south-kpi"><small>Em risco</small><b>${atRisk}</b></div>`;
  $('southModuleList').innerHTML = rows.map(r => `
    <div class="south-module ${r.key===selected?'active':''}" data-key="${r.key}" style="--module-color:${color(r.score)}">
      <i></i><div><strong>${esc(r.name)}</strong><small>${esc(r.sub)}</small></div><b>${r.count}</b>
    </div>`).join('');
  $('southModuleList').querySelectorAll('.south-module').forEach(el => el.onclick = () => {selected=el.dataset.key;render();});
  const r = rows.find(x=>x.key===selected) || rows[0];
  $('southDetail').innerHTML = `
    <h3>${esc(r.name)}</h3>
    <div class="south-detail-grid">
      <div><small>Registros</small><br><b>${r.count}</b></div>
      <div><small>Pendências</small><br><b>${r.bad}</b></div>
      <div><small>Saúde</small><br><b style="color:${color(r.score)}">${r.score}%</b></div>
      <div><small>Situação</small><br><b>${label(r.score)}</b></div>
    </div>
    <p class="muted" style="margin:9px 0 0">${esc(r.sub)}</p>
    <button class="btn" id="southOpenModule" type="button" style="margin-top:10px">Abrir módulo</button>`;
  $('southOpenModule').onclick = () => openView(r.view);
}

function renderTable(rows){
  $('southTable').innerHTML = `<table class="south-table"><thead><tr><th>Módulo</th><th>Registros</th><th>Pendências</th><th>Saúde</th><th>Situação</th><th>Acesso</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${r.count}</td><td>${r.bad}</td><td>${r.score}%</td><td><span class="south-pill ${cls(r.score)}">${label(r.score)}</span></td><td><button class="btn alt" data-view="${r.view}" type="button">Abrir</button></td></tr>`).join('')}</tbody></table>`;
  $('southTable').querySelectorAll('button[data-view]').forEach(b => b.onclick = () => openView(b.dataset.view));
  $('southExportCsv').onclick = () => exportCsv(rows);
}

function exportCsv(rows){
  const all = [['Módulo','Registros','Pendências','Saúde','Situação'],...rows.map(r=>[r.name,r.count,r.bad,r.score,label(r.score)])];
  const q = v => `"${String(v??'').replaceAll('"','""')}"`;
  const csv = all.map(r=>r.map(q).join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
  a.download = 'SGQ_Manager_Regiao_Sul.csv';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

function render(){
  try{
    installStyle();
    if (!ensureShell() && !$('brazilMapBlock')) return;
    const rows = getData();
    if (!rows.some(r=>r.key===selected)) selected = rows[0]?.key || 'ACTIONS';
    renderMap(rows);
    renderSide(rows);
    renderTable(rows);
  }catch(e){
    console.error('SGQ Região Sul',e);
    const el = $('southMapVisual');
    if (el) el.innerHTML = `<div style="padding:25px" class="dangerText">Falha ao carregar visão Região Sul: ${esc(e.message||e)}</div>`;
  }
}

window.renderBrazilMap = render;
window.SGQBrazilMap = {render,setMode:()=>render(),getMode:()=> 'SOUTH'};
setTimeout(render,1200);
})();