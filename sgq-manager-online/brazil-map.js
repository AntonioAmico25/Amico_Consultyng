(() => {
'use strict';

const GEOJSON_URL='https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson';
const LEAFLET_JS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const STATES={
'Acre':'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA','Ceará':'CE','Distrito Federal':'DF','Espírito Santo':'ES','Goiás':'GO','Maranhão':'MA','Mato Grosso':'MT','Mato Grosso do Sul':'MS','Minas Gerais':'MG','Pará':'PA','Paraíba':'PB','Paraná':'PR','Pernambuco':'PE','Piauí':'PI','Rio de Janeiro':'RJ','Rio Grande do Norte':'RN','Rio Grande do Sul':'RS','Rondônia':'RO','Roraima':'RR','Santa Catarina':'SC','São Paulo':'SP','Sergipe':'SE','Tocantins':'TO'
};
const NAMES=Object.fromEntries(Object.entries(STATES).map(([n,u])=>[u,n]));
const DEMO={
AC:85,AL:57,AP:76,AM:78,BA:59,CE:74,DF:88,ES:77,GO:75,MA:68,MT:79,MS:83,MG:72,PA:71,PB:78,PR:81,PE:70,PI:63,RJ:74,RN:81,RS:78,RO:80,RR:82,SC:84,SP:82,SE:67,TO:77
};
const DETAIL={
SP:{nc:12,late:5,audits:14,risks:1,trend:2.1},MG:{nc:18,late:9,audits:12,risks:3,trend:-1.3},PR:{nc:11,late:3,audits:10,risks:1,trend:3.4},BA:{nc:25,late:13,audits:9,risks:4,trend:-2.0},RS:{nc:14,late:6,audits:11,risks:2,trend:.8}
};
let map=null,geoLayer=null,labelLayer=null,currentData=null;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cls=v=>v==null?'info':v>=80?'ok':v>=60?'warn':v>=40?'risk':'crit';
const label=v=>v==null?'Informativo':v>=80?'Bom / Conforme':v>=60?'Atenção':v>=40?'Risco':'Crítico';
const color=v=>v==null?'#64748b':v>=80?'#2e9b4b':v>=60?'#eab308':v>=40?'#f97316':'#ef4444';

function addDeps(){
 if(!document.querySelector('link[data-brazil-leaflet]')){const l=document.createElement('link');l.rel='stylesheet';l.href=LEAFLET_CSS;l.dataset.brazilLeaflet='1';document.head.appendChild(l);}
 if(window.L)return Promise.resolve();
 return new Promise((res,rej)=>{const s=document.createElement('script');s.src=LEAFLET_JS;s.dataset.brazilLeaflet='1';s.onload=res;s.onerror=()=>rej(new Error('Falha ao carregar biblioteca do mapa'));document.head.appendChild(s);});
}

function installStyle(){if($('brMapStyle'))return;const s=document.createElement('style');s.id='brMapStyle';s.textContent=`
.br-map-block{display:grid;grid-template-columns:minmax(0,8fr) minmax(240px,4fr);gap:12px}.br-map-card,.br-side-card{background:linear-gradient(180deg,var(--panel),color-mix(in srgb,var(--panel) 90%,#000));border:1px solid var(--line);border-radius:16px;padding:15px}.br-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.br-head h2{margin:0;font-size:22px}.br-head p{margin:4px 0 0;color:var(--muted)}.br-badge{border:1px solid #2f7d4c;border-radius:999px;padding:5px 9px;color:#7ee2a8;font-size:11px}.br-map-wrap{position:relative;margin-top:12px;min-height:540px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:radial-gradient(circle at 50% 45%,rgba(22,134,255,.10),transparent 56%),var(--panel2)}#brazilLeafletMap{height:540px;background:transparent}.leaflet-container{font:12px Inter,Segoe UI,Arial,sans-serif;background:transparent}.leaflet-control-attribution{font-size:9px;background:rgba(0,0,0,.55)!important;color:#cbd5e1}.leaflet-control-attribution a{color:#8ec5ff}.br-state-label{background:transparent!important;border:0!important}.br-state-label div{min-width:34px;text-align:center;color:#fff;font-weight:900;text-shadow:0 1px 3px #000;padding:2px 3px;border-radius:7px;background:rgba(7,17,31,.58);border:1px solid rgba(255,255,255,.18);line-height:1.05}.br-state-label b{font-size:11px}.br-state-label span{font-size:10px}.br-legend{position:absolute;left:12px;bottom:12px;z-index:500;background:rgba(7,17,31,.90);border:1px solid var(--line);border-radius:12px;padding:10px;min-width:190px}.br-legend strong{display:block;margin-bottom:7px}.br-leg{display:flex;justify-content:space-between;gap:12px;margin:4px 0;font-size:11px}.br-dot{display:inline-block;width:9px;height:9px;border-radius:99px;margin-right:6px}.br-side{display:grid;gap:9px;align-content:start}.br-kpi{text-align:center;background:var(--panel2);border:1px solid var(--line);border-radius:13px;padding:12px}.br-kpi small{display:block;color:var(--muted);text-transform:uppercase}.br-kpi b{display:block;font-size:27px;margin-top:3px}.br-kpi .ok{color:#78e0a1}.br-kpi .warn{color:#ffd15c}.br-kpi .risk{color:#ff9a3d}.br-kpi .crit{color:#ff7373}.br-kpi .info{color:#67b7ff}.br-detail{margin-top:2px;background:var(--panel2);border:1px solid var(--line);border-radius:13px;padding:12px;min-height:154px}.br-detail h3{margin:0 0 7px}.br-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;font-size:12px}.br-detail-grid div{border:1px solid var(--line);border-radius:9px;padding:7px}.br-table-card{margin-top:12px}.br-table-wrap{overflow:auto;max-height:310px}.br-table{width:100%;min-width:820px;border-collapse:collapse}.br-table th,.br-table td{padding:8px;border-bottom:1px solid var(--line);font-size:12px;text-align:left}.br-table th{position:sticky;top:0;background:var(--panel);z-index:1}.br-pill{display:inline-block;border-radius:999px;padding:3px 7px;font-weight:800}.br-pill.ok{background:rgba(46,155,75,.22);color:#78e0a1}.br-pill.warn{background:rgba(234,179,8,.18);color:#ffd15c}.br-pill.risk{background:rgba(249,115,22,.18);color:#ff9a3d}.br-pill.crit{background:rgba(239,68,68,.18);color:#ff7373}.br-source{margin-top:7px;color:var(--muted);font-size:10px}@media(max-width:1050px){.br-map-block{grid-template-columns:1fr}.br-side{grid-template-columns:repeat(3,1fr)}.br-detail{grid-column:1/-1}}@media(max-width:700px){.br-side{grid-template-columns:1fr 1fr}.br-detail{grid-column:1/-1}#brazilLeafletMap{height:470px}.br-map-wrap{min-height:470px}}
`;document.head.appendChild(s);}

function dataset(){
 const ext=Array.isArray(window.SGQ_STATE_PERFORMANCE)?window.SGQ_STATE_PERFORMANCE:null;
 const rows=ext?.length?ext.map(x=>({uf:String(x.uf||x.state_code||'').toUpperCase(),value:Number(x.value??x.performance_index),nc:+(x.nc??x.nc_open??0),late:+(x.late??x.overdue_actions??0),audits:+(x.audits??x.audits_count??0),risks:+(x.risks??x.critical_risks??0),trend:+(x.trend??0)}))
 :Object.entries(DEMO).map(([uf,value])=>({uf,value,...(DETAIL[uf]||{nc:0,late:0,audits:0,risks:0,trend:0})}));
 return {rows,demo:!ext?.length};
}

function ensureShell(){
 const exec=$('execDashboard');if(!exec||$('brazilMapBlock'))return false;
 const ribbon=$('vectorRibbon');
 const wrap=document.createElement('div');wrap.id='brazilMapBlock';wrap.innerHTML=`<div class="br-map-block"><section class="br-map-card"><div class="br-head"><div><h2>Mapa do Brasil — Indicadores por Estado</h2><p>Distribuição nacional dos indicadores do SGQ por UF.</p></div><span id="brMapBadge" class="br-badge">MAPA ATUALIZADO</span></div><div class="br-map-wrap"><div id="brazilLeafletMap"></div><div class="br-legend"><strong>Legenda · Índice de Desempenho</strong><div class="br-leg"><span><i class="br-dot" style="background:#2e9b4b"></i>Bom / Conforme</span><b>≥ 80</b></div><div class="br-leg"><span><i class="br-dot" style="background:#eab308"></i>Atenção</span><b>60–79</b></div><div class="br-leg"><span><i class="br-dot" style="background:#f97316"></i>Risco</span><b>40–59</b></div><div class="br-leg"><span><i class="br-dot" style="background:#ef4444"></i>Crítico</span><b>&lt; 40</b></div><div class="br-leg"><span><i class="br-dot" style="background:#64748b"></i>Informativo</span><b>N/A</b></div></div></div><div class="br-source">Base geográfica: Click That ’Hood · licença MIT. Cores e dados: SGQ Manager.</div></section><aside class="br-side" id="brMapSide"></aside></div><section class="br-map-card br-table-card"><div class="br-head"><div><h3 style="margin:0">Desempenho por Estado</h3><p>Classificação, não conformidades, ações, auditorias e tendência.</p></div><button class="btn alt" id="brExportCsv" type="button">Exportar CSV</button></div><div id="brMapTable" class="br-table-wrap"></div></section>`;
 (ribbon?.parentNode||exec).insertBefore(wrap,ribbon?ribbon.nextSibling:exec.firstChild);
 return true;
}

function kpis(rows,demo){
 const vals=rows.map(x=>x.value).filter(Number.isFinite),avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
 const n={ok:0,warn:0,risk:0,crit:0};rows.forEach(x=>{const c=cls(x.value);if(n[c]!=null)n[c]++;});
 $('brMapBadge').textContent=demo?'MAPA ATUALIZADO · DADOS DEMONSTRATIVOS':'MAPA ATUALIZADO · DADOS CENTRAIS';
 $('brMapSide').innerHTML=`<div class="br-kpi"><small>Índice nacional (média)</small><b class="${cls(avg)}">${avg.toFixed(1).replace('.',',')}</b><span>${label(avg)}</span></div><div class="br-kpi"><small>Estados em bom desempenho</small><b class="ok">${n.ok}</b><span>${(n.ok/27*100).toFixed(1).replace('.',',')}% do total</span></div><div class="br-kpi"><small>Estados em atenção</small><b class="warn">${n.warn}</b><span>${(n.warn/27*100).toFixed(1).replace('.',',')}% do total</span></div><div class="br-kpi"><small>Estados em risco</small><b class="risk">${n.risk}</b><span>${(n.risk/27*100).toFixed(1).replace('.',',')}% do total</span></div><div class="br-kpi"><small>Estados críticos</small><b class="crit">${n.crit}</b><span>${(n.crit/27*100).toFixed(1).replace('.',',')}% do total</span></div><div class="br-kpi"><small>Total de UFs</small><b class="info">27</b><span>26 estados + DF</span></div><div class="br-detail" id="brMapDetail"><h3>Informações do mapa</h3><p class="muted">Clique em um estado para ver o detalhamento dos indicadores.</p><p class="muted">Quanto maior o índice, melhor o desempenho.</p></div>`;
}

function detail(row){if(!row)return;const d=$('brMapDetail');if(!d)return;d.innerHTML=`<h3>${esc(NAMES[row.uf]||row.uf)} — ${esc(row.uf)}</h3><div class="br-detail-grid"><div><small>Índice</small><br><b>${row.value}</b></div><div><small>Classificação</small><br><b>${label(row.value)}</b></div><div><small>NC abertas</small><br><b>${row.nc||0}</b></div><div><small>Ações atrasadas</small><br><b>${row.late||0}</b></div><div><small>Auditorias</small><br><b>${row.audits||0}</b></div><div><small>Riscos críticos</small><br><b>${row.risks||0}</b></div><div><small>Tendência</small><br><b>${row.trend>0?'↑ ':row.trend<0?'↓ ':''}${Math.abs(row.trend||0).toFixed(1).replace('.',',')} pts</b></div><div><small>UF</small><br><b>${row.uf}</b></div></div>`;}

function table(rows){const sorted=[...rows].sort((a,b)=>b.value-a.value);$('brMapTable').innerHTML=`<table class="br-table"><thead><tr><th>Estado</th><th>Índice</th><th>Classificação</th><th>NC abertas</th><th>Ações atrasadas</th><th>Auditorias</th><th>Riscos</th><th>Tendência</th></tr></thead><tbody>${sorted.map(r=>`<tr data-uf="${r.uf}" style="cursor:pointer"><td>${esc(NAMES[r.uf]||r.uf)} (${r.uf})</td><td><b style="color:${color(r.value)}">${r.value}</b></td><td><span class="br-pill ${cls(r.value)}">${label(r.value)}</span></td><td>${r.nc||0}</td><td>${r.late||0}</td><td>${r.audits||0}</td><td>${r.risks||0}</td><td>${r.trend>0?'↑':r.trend<0?'↓':'→'} ${Math.abs(r.trend||0).toFixed(1).replace('.',',')} pts</td></tr>`).join('')}</tbody></table>`;
 $('brMapTable').querySelectorAll('tr[data-uf]').forEach(tr=>tr.onclick=()=>detail(rows.find(r=>r.uf===tr.dataset.uf)));
}

function exportCsv(rows){const h=['Estado','UF','Indice','Classificacao','NC abertas','Acoes atrasadas','Auditorias','Riscos','Tendencia'];const lines=[h.join(';'),...rows.map(r=>[NAMES[r.uf],r.uf,r.value,label(r.value),r.nc||0,r.late||0,r.audits||0,r.risks||0,r.trend||0].map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';'))];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}));a.download='SGQ_Desempenho_por_Estado.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}

async function renderMap(rows){await addDeps();const geo=await fetch(GEOJSON_URL,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('Base geográfica indisponível');return r.json();});
 if(map){map.remove();map=null;}
 map=L.map('brazilLeafletMap',{zoomControl:false,attributionControl:true,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:true,dragging:true});
 const byUf=Object.fromEntries(rows.map(r=>[r.uf,r]));
 function ufOf(feature){const p=feature?.properties||{};const name=p.name||p.NAME_1||p.nome||'';return STATES[name]||String(p.sigla||p.uf||p.UF||'').toUpperCase();}
 geoLayer=L.geoJSON(geo,{style:f=>{const u=ufOf(f),r=byUf[u];return{color:'#d9e4f0',weight:1.1,fillColor:color(r?.value),fillOpacity:.88};},onEachFeature:(f,l)=>{const u=ufOf(f),r=byUf[u];l.bindTooltip(`<b>${esc(NAMES[u]||u)} (${u})</b><br>Índice: <b>${r?.value??'N/A'}</b><br>${label(r?.value)}<br>NC abertas: ${r?.nc||0}<br>Ações atrasadas: ${r?.late||0}`,{sticky:true});l.on('mouseover',e=>e.target.setStyle({weight:2.2,fillOpacity:1}));l.on('mouseout',e=>geoLayer.resetStyle(e.target));l.on('click',()=>detail(r));}}).addTo(map);
 map.fitBounds(geoLayer.getBounds(),{padding:[14,14]});
 labelLayer=L.layerGroup().addTo(map);
 geoLayer.eachLayer(l=>{const u=ufOf(l.feature),r=byUf[u];if(!u||!r)return;const c=l.getBounds().getCenter();L.marker(c,{interactive:false,icon:L.divIcon({className:'br-state-label',html:`<div><b>${u}</b><br><span>${r.value}</span></div>`,iconSize:[38,32],iconAnchor:[19,16]})}).addTo(labelLayer);});
}

async function render(){installStyle();if(!ensureShell()&&!$('brazilMapBlock'))return;currentData=dataset();kpis(currentData.rows,currentData.demo);table(currentData.rows);$('brExportCsv').onclick=()=>exportCsv(currentData.rows);try{await renderMap(currentData.rows);}catch(e){console.error('brazil-map',e);$('brazilLeafletMap').innerHTML=`<div style="padding:24px;color:var(--warn)"><b>Mapa geográfico temporariamente indisponível.</b><br><span class="muted">Os KPIs e a tabela estadual continuam disponíveis.</span></div>`;}}

function install(){const ready=$('execDashboard');if(!ready){setTimeout(install,350);return;}render();}
window.SGQBrazilMap={render,getData:()=>currentData,setData:rows=>{window.SGQ_STATE_PERFORMANCE=rows;render();}};
setTimeout(install,500);
})();