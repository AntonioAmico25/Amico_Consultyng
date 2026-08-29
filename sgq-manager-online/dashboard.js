(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const escHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const toDate = value => value ? new Date(String(value).length === 10 ? `${value}T12:00:00` : value) : null;
  const fmtDate = value => { const d = toDate(value); return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR') : '—'; };
  const now = () => new Date();

  const style = document.createElement('style');
  style.textContent = `
    .exec-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap}
    .exec-title{margin:0;font-size:24px}.exec-sub{margin:4px 0 0;color:var(--muted)}
    .exec-filter{display:grid;grid-template-columns:2fr repeat(4,minmax(130px,1fr));gap:9px;margin-top:14px}
    .exec-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .exec-kpis{display:grid;grid-template-columns:repeat(8,minmax(110px,1fr));gap:10px;margin-top:14px}
    .exec-kpi{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:13px;min-width:0}
    .exec-kpi strong{display:block;font-size:24px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .exec-kpi span{display:block;color:var(--muted);font-size:12px;margin-top:5px}
    .exec-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px;margin-top:12px}
    .exec-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;min-width:0}
    .exec-card h3{margin:0 0 9px;font-size:15px}.exec-span-3{grid-column:span 3}.exec-span-4{grid-column:span 4}.exec-span-5{grid-column:span 5}.exec-span-6{grid-column:span 6}.exec-span-7{grid-column:span 7}.exec-span-8{grid-column:span 8}.exec-span-12{grid-column:span 12}
    .exec-svg{width:100%;height:auto;display:block}.exec-muted{fill:var(--muted);color:var(--muted)}
    .exec-map{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.exec-map button{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:10px;padding:10px 7px;min-height:62px;cursor:pointer;text-align:left}.exec-map button:hover,.exec-map button.active{outline:2px solid var(--accent)}.exec-map b{display:block;font-size:17px}.exec-map small{color:var(--muted)}
    .exec-severity{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)}.exec-severity:last-child{border:0}.exec-dot{width:10px;height:10px;border-radius:50%;background:currentColor;flex:none}
    .exec-table-wrap{overflow:auto;max-height:390px}.exec-table{width:100%;min-width:820px;border-collapse:collapse}.exec-table th{position:sticky;top:0;background:var(--panel);z-index:1}.exec-table th,.exec-table td{padding:8px;border-bottom:1px solid var(--line);font-size:12px;text-align:left}.exec-table tr:hover td{background:var(--panel2)}
    .exec-empty{color:var(--muted);padding:18px 4px}.exec-badge{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:3px 7px;font-size:11px}
    .exec-gauge-value{font-size:30px;font-weight:800;fill:var(--text)}.exec-gauge-label{font-size:11px;fill:var(--muted)}
    .exec-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-top:6px}.exec-legend i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px}
    @media(max-width:1250px){.exec-kpis{grid-template-columns:repeat(4,1fr)}.exec-span-3,.exec-span-4{grid-column:span 6}.exec-span-5,.exec-span-7{grid-column:span 12}.exec-map{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:760px){.exec-filter{grid-template-columns:1fr 1fr}.exec-kpis{grid-template-columns:repeat(2,1fr)}.exec-grid>*{grid-column:span 12!important}.exec-map{grid-template-columns:repeat(2,1fr)}}
    @media print{.top,.side,.exec-filter,.exec-actions{display:none!important}.layout{display:block!important;padding:0!important}.exec-card,.exec-kpi{break-inside:avoid}.exec-table-wrap{max-height:none;overflow:visible}}
  `;
  document.head.appendChild(style);

  const modules = [
    ['ALL','Todos'],['DOCS','Documentos'],['ACTIONS','RQ 045 / Ações'],['AUDITS','Auditorias'],['KPIS','Indicadores'],['RISKS','Riscos'],['NORMS','Normas / Portarias'],['ALERTS','Alertas'],['HISTORY','Histórico de Revisões']
  ];

  let state = {q:'', module:'ALL', status:'ALL', period:'ALL', sector:'ALL'};

  function ensureDashboard(){
    const dash = byId('dash');
    if (!dash || byId('execDashboard')) return;
    dash.innerHTML = `
      <div id="execDashboard">
        <div class="exec-card">
          <div class="exec-head">
            <div><h1 class="exec-title">Dashboard Executivo do SGQ</h1><p class="exec-sub">Visão integrada, pesquisa, análise, alertas e relatórios gerais ou parciais de todos os módulos.</p></div>
            <span id="execUpdated" class="pill">Atualizando…</span>
          </div>
          <div class="exec-filter">
            <div class="field"><label>Pesquisa geral</label><input id="execQ" placeholder="Código, título, setor, responsável, alerta, norma…"></div>
            <div class="field"><label>Módulo</label><select id="execModule">${modules.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>
            <div class="field"><label>Status</label><select id="execStatus"><option value="ALL">Todos</option><option>ABERTO</option><option>VIGENTE</option><option>VENCIDO</option><option>CRITICO</option><option>CONCLUÍDO</option><option>OBSOLETO</option></select></div>
            <div class="field"><label>Período</label><select id="execPeriod"><option value="ALL">Todo período</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="365">Últimos 12 meses</option></select></div>
            <div class="field"><label>Setor</label><select id="execSector"><option value="ALL">Todos os setores</option></select></div>
          </div>
          <div class="exec-actions"><button class="btn" id="execApply">Aplicar filtros</button><button class="btn alt" id="execReset">Limpar</button><button class="btn alt" id="execCsv">Relatório CSV</button><button class="btn alt" id="execPrint">Imprimir / PDF</button><button class="btn alt" id="execRefresh">Atualizar dados</button></div>
        </div>
        <div id="execKpis" class="exec-kpis"></div>
        <div class="exec-grid">
          <div class="exec-card exec-span-4"><h3>Velocímetro · Índice de Conformidade</h3><div id="execGauge"></div></div>
          <div class="exec-card exec-span-4"><h3>Histograma · Distribuição por módulo</h3><div id="execHistogram"></div></div>
          <div class="exec-card exec-span-4"><h3>Mapa vetorial · Saúde dos módulos</h3><div id="execMap" class="exec-map"></div></div>
          <div class="exec-card exec-span-5"><h3>Alertas priorizados</h3><div id="execAlerts"></div></div>
          <div class="exec-card exec-span-7"><h3>Análise geral e parcial</h3><div id="execAnalysis"></div></div>
          <div class="exec-card exec-span-12"><div class="exec-head"><h3>Relatório consolidado</h3><span id="execReportCount" class="pill"></span></div><div class="exec-table-wrap"><table class="exec-table"><thead><tr><th>Módulo</th><th>Registro</th><th>Status</th><th>Setor / responsável</th><th>Data / prazo</th><th>Alerta / análise</th></tr></thead><tbody id="execReport"></tbody></table></div></div>
        </div>
      </div>`;

    byId('execApply').addEventListener('click', readFilters);
    byId('execReset').addEventListener('click', () => { byId('execQ').value=''; byId('execModule').value='ALL'; byId('execStatus').value='ALL'; byId('execPeriod').value='ALL'; byId('execSector').value='ALL'; readFilters(); });
    byId('execCsv').addEventListener('click', exportCsv);
    byId('execPrint').addEventListener('click', () => window.print());
    byId('execRefresh').addEventListener('click', async () => { try { if (typeof loadDocs === 'function') await loadDocs(); if (typeof loadNorms === 'function') await loadNorms(); if (typeof localAutomation === 'function') localAutomation(); } finally { render(); } });
    ['execQ','execModule','execStatus','execPeriod','execSector'].forEach(id => byId(id).addEventListener(id==='execQ'?'input':'change', () => { if(id==='execQ') debounceRender(); else readFilters(); }));
  }

  let debounceTimer;
  function debounceRender(){ clearTimeout(debounceTimer); debounceTimer=setTimeout(readFilters,220); }
  function readFilters(){ state={q:byId('execQ')?.value.trim().toLowerCase()||'',module:byId('execModule')?.value||'ALL',status:byId('execStatus')?.value||'ALL',period:byId('execPeriod')?.value||'ALL',sector:byId('execSector')?.value||'ALL'}; render(); }

  function daysUntil(value){ const d=toDate(value); if(!d) return null; const a=now(); a.setHours(0,0,0,0); d.setHours(0,0,0,0); return Math.round((d-a)/86400000); }
  function normalizedStatus(s){ return String(s||'').toUpperCase().replaceAll('_',' '); }

  function collect(){
    const rows=[];
    const docs = typeof docItems !== 'undefined' && Array.isArray(docItems) ? docItems : [];
    const local = typeof db !== 'undefined' && db ? db : {actions:[],audits:[],kpis:[],risks:[],alerts:[],events:[]};
    const norms = typeof normItems !== 'undefined' && Array.isArray(normItems) ? normItems : [];
    const nAlerts = typeof normAlerts !== 'undefined' && Array.isArray(normAlerts) ? normAlerts : [];

    docs.forEach(x=>{const due=daysUntil(x.next_review_date); rows.push({module:'DOCS',label:`${x.code||''} — ${x.title||''}`,status:due!==null&&due<0?'VENCIDO':normalizedStatus(x.status||'SEM STATUS'),sector:x.department_name||x.department_acronym||'—',owner:(x.responsible_names||[]).join(', ')||x.approved_by||'—',date:x.next_review_date||x.updated_at||x.created_at,alert:due!==null&&due<0?'Revisão vencida':due!==null&&due<=30?`Revisão em ${due} dia(s)`:x.controlled_copy?'Cópia controlada':'',raw:x});});
    (local.actions||[]).forEach(x=>{const due=daysUntil(x.due); rows.push({module:'ACTIONS',label:x.title||'Ação',status:due!==null&&due<0&&x.status!=='Concluída'?'VENCIDO':normalizedStatus(x.status||'ABERTO'),sector:'—',owner:x.owner||'—',date:x.due,alert:due!==null&&due<0?'Prazo vencido':due!==null&&due<=7?`Prazo em ${due} dia(s)`:''});});
    (local.audits||[]).forEach(x=>rows.push({module:'AUDITS',label:x.title||'Auditoria',status:'PLANEJADA',sector:'—',owner:x.scope||'—',date:x.date,alert:''}));
    (local.kpis||[]).forEach(x=>{const val=Number(x.value),target=Number(x.target);const bad=Number.isFinite(val)&&Number.isFinite(target)&&target!==0?val<target:false;rows.push({module:'KPIS',label:x.name||'Indicador',status:bad?'ATENCAO':'CONFORME',sector:'—',owner:`${x.value||'—'}${x.unit||''}`,date:'',alert:bad?`Abaixo da meta ${x.target}${x.unit||''}`:''});});
    (local.risks||[]).forEach(x=>{const score=Number(x.p||0)*Number(x.i||0);rows.push({module:'RISKS',label:x.title||'Risco',status:score>=15?'CRITICO':score>=8?'ALTO':'CONTROLADO',sector:'—',owner:`P${x.p} × I${x.i}`,date:'',alert:`NPR ${score}`});});
    norms.forEach(x=>rows.push({module:'NORMS',label:`${x.reference||''} — ${x.title||''}`,status:normalizedStatus(x.status||'VIGENTE'),sector:x.issuer||'—',owner:x.monitor_enabled?'Monitoramento ativo':'Monitoramento inativo',date:x.next_review_date||x.last_checked_at,alert:x.monitor_enabled?'Fonte monitorada':''}));
    (local.alerts||[]).forEach(x=>rows.push({module:'ALERTS',label:x.title||'Alerta',status:'ABERTO',sector:'—',owner:'SGQ',date:new Date().toISOString(),alert:x.detail||''}));
    nAlerts.forEach(x=>rows.push({module:'ALERTS',label:x.title||'Alerta normativo',status:normalizedStatus(x.status||x.severity||'ABERTO'),sector:'Normativo',owner:x.alert_source||'Automático',date:x.created_at,alert:x.message||x.severity||''}));
    (local.events||[]).forEach(x=>rows.push({module:'HISTORY',label:x.type||'Revisão',status:'REGISTRADO',sector:'—',owner:'—',date:x.at,alert:x.text||''}));
    return rows;
  }

  function filteredRows(){
    const threshold = state.period==='ALL'?null:Number(state.period);
    const since = threshold ? new Date(Date.now()-threshold*86400000) : null;
    return collect().filter(r=>{
      if(state.module!=='ALL'&&r.module!==state.module)return false;
      if(state.status!=='ALL'&&!normalizedStatus(r.status).includes(normalizedStatus(state.status)))return false;
      if(state.sector!=='ALL'&&r.sector!==state.sector)return false;
      if(since&&r.date){const d=toDate(r.date);if(d&&d<since)return false;}
      if(state.q){const hay=[r.module,r.label,r.status,r.sector,r.owner,r.alert].join(' ').toLowerCase();if(!hay.includes(state.q))return false;}
      return true;
    });
  }

  function moduleLabel(code){return Object.fromEntries(modules)[code]||code;}
  function severity(row){const s=normalizedStatus(row.status+' '+row.alert);if(/CRITICO|VENCIDO|REVOGAD|CANCELAD/.test(s))return 'critical';if(/ALTO|ATENCAO|ABERTO|ATRAS/.test(s))return 'warning';if(/VIGENTE|CONFORME|CONCLUID|CONTROLADO/.test(s))return 'ok';return 'info';}

  function populateSectors(rows){const sel=byId('execSector');if(!sel)return;const current=sel.value;const vals=[...new Set(rows.map(r=>r.sector).filter(x=>x&&x!=='—'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));sel.innerHTML='<option value="ALL">Todos os setores</option>'+vals.map(v=>`<option value="${escHtml(v)}">${escHtml(v)}</option>`).join('');if(vals.includes(current))sel.value=current;}

  function renderKpis(rows, all){
    const overdue=rows.filter(r=>severity(r)==='critical').length;
    const alerts=rows.filter(r=>r.module==='ALERTS'||r.alert).length;
    const openActions=rows.filter(r=>r.module==='ACTIONS'&&!/CONCLU/.test(r.status)).length;
    const docs=rows.filter(r=>r.module==='DOCS').length;
    const norms=rows.filter(r=>r.module==='NORMS').length;
    const history=rows.filter(r=>r.module==='HISTORY').length;
    const sectors=new Set(rows.map(r=>r.sector).filter(x=>x&&x!=='—')).size;
    const totalAll=all.length;
    const data=[['Total filtrado',rows.length],['Total geral',totalAll],['Documentos',docs],['Ações abertas',openActions],['Normas/Portarias',norms],['Alertas',alerts],['Críticos/Vencidos',overdue],['Histórico de Revisões',history||0]];
    byId('execKpis').innerHTML=data.map(([l,v])=>`<div class="exec-kpi"><strong>${v}</strong><span>${l}</span></div>`).join('');
  }

  function renderGauge(rows){
    const relevant=rows.filter(r=>r.module!=='HISTORY');const bad=relevant.filter(r=>['critical','warning'].includes(severity(r))).length;const score=relevant.length?Math.max(0,Math.round(100-(bad/relevant.length)*100)):100;const angle=-135+(score/100)*270;const rad=angle*Math.PI/180,cx=100,cy=100,len=58,x=cx+Math.cos(rad)*len,y=cy+Math.sin(rad)*len;
    byId('execGauge').innerHTML=`<svg class="exec-svg" viewBox="0 0 200 145" role="img" aria-label="Índice de conformidade ${score}%"><path d="M29 117 A80 80 0 1 1 171 117" fill="none" stroke="var(--line)" stroke-width="18" stroke-linecap="round"/><path d="M29 117 A80 80 0 0 1 52 47" fill="none" stroke="var(--danger)" stroke-width="18" stroke-linecap="round"/><path d="M52 47 A80 80 0 0 1 148 47" fill="none" stroke="var(--warn)" stroke-width="18"/><path d="M148 47 A80 80 0 0 1 171 117" fill="none" stroke="var(--ok)" stroke-width="18" stroke-linecap="round"/><line x1="100" y1="100" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--text)" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="var(--text)"/><text x="100" y="132" text-anchor="middle" class="exec-gauge-value">${score}%</text><text x="100" y="144" text-anchor="middle" class="exec-gauge-label">conformidade estimada</text></svg>`;
  }

  function renderHistogram(rows){
    const codes=modules.filter(([c])=>!['ALL'].includes(c)).map(([c])=>c);const counts=codes.map(c=>rows.filter(r=>r.module===c).length);const max=Math.max(1,...counts);const w=360,h=180,pad=28,barW=(w-pad*2)/codes.length-5;
    const bars=codes.map((c,i)=>{const val=counts[i],bh=(val/max)*115,x=pad+i*((w-pad*2)/codes.length)+2,y=135-bh;return `<g><rect x="${x}" y="${y}" width="${Math.max(9,barW)}" height="${bh}" rx="3" fill="var(--accent)" opacity=".8"/><text x="${x+Math.max(9,barW)/2}" y="${Math.max(12,y-5)}" text-anchor="middle" font-size="10" fill="var(--text)">${val}</text><text x="${x+Math.max(9,barW)/2}" y="153" text-anchor="middle" font-size="8" fill="var(--muted)" transform="rotate(-38 ${x+Math.max(9,barW)/2} 153)">${c.slice(0,5)}</text></g>`}).join('');
    byId('execHistogram').innerHTML=`<svg class="exec-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Histograma de registros por módulo"><line x1="${pad}" y1="135" x2="${w-pad}" y2="135" stroke="var(--line)"/>${bars}</svg>`;
  }

  function renderMap(rows){
    const items=modules.filter(([c])=>!['ALL'].includes(c)).map(([c,l])=>{const rs=rows.filter(r=>r.module===c);const crit=rs.filter(r=>severity(r)==='critical').length;const warn=rs.filter(r=>severity(r)==='warning').length;const tone=crit?'var(--danger)':warn?'var(--warn)':'var(--ok)';return `<button type="button" data-map-module="${c}" title="Filtrar ${escHtml(l)}"><small>${escHtml(l)}</small><b>${rs.length}</b><span style="color:${tone};font-size:11px">● ${crit?`${crit} crítico(s)`:warn?`${warn} atenção`:'sem crítico'}</span></button>`}).join('');
    byId('execMap').innerHTML=items;byId('execMap').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{byId('execModule').value=b.dataset.mapModule;readFilters();}));
  }

  function renderAlerts(rows){
    const alerts=rows.filter(r=>severity(r)!=='ok'&&(r.alert||r.module==='ALERTS')).sort((a,b)=>({critical:0,warning:1,info:2,ok:3}[severity(a)]-({critical:0,warning:1,info:2,ok:3}[severity(b)])).slice(0,12);
    byId('execAlerts').innerHTML=alerts.length?alerts.map(r=>{const sev=severity(r);const col=sev==='critical'?'var(--danger)':sev==='warning'?'var(--warn)':'var(--accent)';return `<div class="exec-severity" style="color:${col}"><span class="exec-dot"></span><div style="min-width:0"><b style="color:var(--text)">${escHtml(r.label)}</b><br><small style="color:var(--muted)">${escHtml(moduleLabel(r.module))} · ${escHtml(r.alert||r.status)}</small></div></div>`}).join(''):'<div class="exec-empty">Nenhum alerta para os filtros selecionados.</div>';
  }

  function renderAnalysis(rows,all){
    const crit=rows.filter(r=>severity(r)==='critical').length,warn=rows.filter(r=>severity(r)==='warning').length,ok=rows.filter(r=>severity(r)==='ok').length;const largest=modules.filter(([c])=>c!=='ALL').map(([c,l])=>[l,rows.filter(r=>r.module===c).length]).sort((a,b)=>b[1]-a[1])[0]||['—',0];const sectorCounts={};rows.forEach(r=>{if(r.sector&&r.sector!=='—')sectorCounts[r.sector]=(sectorCounts[r.sector]||0)+1});const topSector=Object.entries(sectorCounts).sort((a,b)=>b[1]-a[1])[0]||['—',0];const partial=rows.length!==all.length;
    byId('execAnalysis').innerHTML=`<div class="grid3"><div><span class="muted">Escopo</span><h2 style="margin:4px 0">${partial?'PARCIAL / FILTRADO':'GERAL'}</h2></div><div><span class="muted">Módulo predominante</span><h2 style="margin:4px 0">${escHtml(largest[0])}</h2><small class="muted">${largest[1]} registro(s)</small></div><div><span class="muted">Setor predominante</span><h2 style="margin:4px 0">${escHtml(topSector[0])}</h2><small class="muted">${topSector[1]} registro(s)</small></div></div><div class="exec-legend"><span><i style="background:var(--danger)"></i>${crit} críticos/vencidos</span><span><i style="background:var(--warn)"></i>${warn} em atenção</span><span><i style="background:var(--ok)"></i>${ok} conformes/controlados</span><span>Exibindo ${rows.length} de ${all.length} registros</span></div>`;
  }

  function renderReport(rows){
    byId('execReportCount').textContent=`${rows.length} registro(s)`;
    byId('execReport').innerHTML=rows.length?rows.slice(0,500).map(r=>`<tr><td>${escHtml(moduleLabel(r.module))}</td><td>${escHtml(r.label)}</td><td><span class="exec-badge">${escHtml(r.status)}</span></td><td>${escHtml(r.sector)}<br><small class="muted">${escHtml(r.owner)}</small></td><td>${fmtDate(r.date)}</td><td>${escHtml(r.alert||'—')}</td></tr>`).join(''):`<tr><td colspan="6" class="exec-empty">Nenhum registro encontrado.</td></tr>`;
  }

  function render(){
    ensureDashboard(); if(!byId('execDashboard')) return;
    const all=collect();populateSectors(all);const rows=filteredRows();renderKpis(rows,all);renderGauge(rows);renderHistogram(rows);renderMap(rows);renderAlerts(rows);renderAnalysis(rows,all);renderReport(rows);byId('execUpdated').textContent=`Atualizado ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
  }

  function exportCsv(){
    const rows=filteredRows();const lines=[['Módulo','Registro','Status','Setor','Responsável','Data/Prazo','Alerta/Análise'],...rows.map(r=>[moduleLabel(r.module),r.label,r.status,r.sector,r.owner,fmtDate(r.date),r.alert])];const csv='\ufeff'+lines.map(row=>row.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`SGQ_Relatorio_${state.module}_${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  const wrap = name => {
    try {
      const original = window[name];
      if(typeof original!=='function') return;
      window[name] = async function(...args){ const out=await original.apply(this,args); setTimeout(render,30); return out; };
    } catch {}
  };

  ensureDashboard();
  ['loadDocs','loadNorms'].forEach(wrap);
  setTimeout(render,100);
  setInterval(()=>{ if(byId('execDashboard') && !byId('dash')?.classList.contains('hidden')) render(); },30000);
  window.renderExecutiveDashboard=render;
})();
