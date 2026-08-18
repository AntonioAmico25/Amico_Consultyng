(()=>{
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const core={
    m01:'Visão executiva',m02:'Governança do Escopo',m03:'Estratégia e contexto',m04:'Processos e riscos',m05:'Documentos e registros',m06:'Indicadores',m07:'Auditorias',m08:'RQ 045 e planos',m09:'Encarroçadoras e laboratórios',m10:'Certificações',m11:'APQP · PPAP · FMEA',m12:'Metrologia e 5S',m13:'Ações e melhorias',m14:'Garantias e pós-vendas',m15:'Usuários, LGPD e trilha',m16:'Aplicativo e dispositivos'
  };
  const extra=[
    ['m17','Controles integrados','Visão transversal de documentos, indicadores, auditorias, ações, riscos, alertas e agenda.'],
    ['m18','Planilhas','Central de planilhas do SGQ, importação, exportação e produtos automatizados por módulo.'],
    ['m19','Alertas','Alertas abertos, criticidade, origem, prazo, responsável e escalonamento.'],
    ['m20','Agenda SGQ','Agenda diária, semanal, mensal, periódica, auditorias, certificações, calibrações e revisões.'],
    ['m21','Histórico / Audit Log','Rastreabilidade de acessos, alterações, aprovações, revisões, automações e decisões.'],
    ['m22','Importar RQs','Entrada controlada de RQs, validação, mapeamento de campos e registro da origem.'],
    ['m23','Portais','INMETRO, Cgcre, IMDS, NEWPROD, MES e demais sistemas externos.'],
    ['m24','Central de Agentes IA','Agentes supervisionados por módulo, fontes governadas, RBAC/RLS e human-in-the-loop.'],
    ['m25','Administração','Usuários, acessos exclusivos, cadastros, permissões e governança administrativa.'],
    ['m26','Configurações','Parâmetros do tenant, módulos, automações, frequências, integrações e regras.']
  ];
  const moduleNames={...core,...Object.fromEntries(extra.map(x=>[x[0],x[1]]))};

  function styles(){
    const st=document.createElement('style');
    st.textContent=`
      .sidebar{width:100%;max-height:calc(100vh - 110px);overflow:auto}
      .side-group{margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
      .side-group-title{margin:0 8px 8px;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
      .navitem{white-space:normal;line-height:1.25}
      #approvedModules{display:block!important}
      #approvedModules .approved{display:none!important;min-height:calc(100vh - 235px)}
      #approvedModules .approved.page-active{display:block!important}
      #modulePage{display:none}.page-active{display:block!important}
      .module-shell{min-height:calc(100vh - 235px)}
      .module-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px}
      .module-head h2{margin:0}
      .doc-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
      .doc-viewer{height:calc(100vh - 310px);min-height:430px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
      .doc-viewer iframe{width:100%;height:100%;border:0;background:#fff}
      .doc-empty{display:grid;place-items:center;height:100%;min-height:430px;color:var(--muted);background:var(--card)}
      .module-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
      @media(max-width:1050px){.sidebar{max-height:380px}.doc-viewer{height:65vh}.module-shell{min-height:auto}}
    `;document.head.appendChild(st);
  }

  function buildExtraMenu(){
    const side=q('#approvedMenu');if(!side)return;
    const old=side.querySelector('.extra-modules');if(old)old.remove();
    const wrap=document.createElement('div');wrap.className='side-group extra-modules';wrap.innerHTML='<div class="side-group-title">Módulos complementares · 17 a 26</div>';
    extra.forEach(([id,name])=>{const b=document.createElement('button');b.className='navitem';b.dataset.target=id;b.textContent=`${id.slice(1)} · ${name}`;wrap.appendChild(b)});
    side.appendChild(wrap);
    const h=side.querySelector('h3');if(h)h.textContent='SGQ Manager · 26 módulos';
  }

  function buildPages(){
    const app=q('#appPanel');if(!app)return;
    let page=q('#modulePage');if(page)page.remove();
    page=document.createElement('section');page.id='modulePage';page.className='section';
    page.innerHTML=`<div class="box module-shell"><div class="module-head"><div><span id="moduleNumber" class="tag">MÓDULO</span><h2 id="moduleTitle">Módulo</h2><p id="moduleText" class="muted"></p></div><span class="tag ok">PÁGINA INDIVIDUAL</span></div><div id="moduleBody"></div></div>`;
    app.prepend(page);
  }

  function hideAll(){
    const app=q('#appPanel');if(!app)return;
    qa(':scope > .section',app).forEach(s=>s.style.display='none');
    qa('#approvedModules .approved').forEach(x=>x.classList.remove('page-active'));
  }

  function sourceBody(id){
    if(id==='m19'){const x=q('#alertsList');return `<div class="list"><h3>Alertas abertos</h3>${x?.innerHTML||'<div class="empty">Sem alertas.</div>'}</div>`}
    if(id==='m20'){const x=q('#agendaList');return `<div class="list"><h3>Agenda próxima</h3>${x?.innerHTML||'<div class="empty">Sem itens.</div>'}</div>`}
    if(id==='m23'){const x=q('#portalsList');return `<div class="list"><h3>Catálogo de Portais</h3>${x?.innerHTML||'<div class="empty">Sem portais.</div>'}</div>`}
    if(id==='m25')return '<div class="note">Administração disponível conforme perfil MASTER/SGQ. Os formulários administrativos permanecem protegidos pelas permissões atuais.</div>';
    return '<div class="flow"><span>Dados filtrados por perfil</span><span>Rastreabilidade</span><span>Automação transversal</span></div>';
  }

  function show(id){
    if(!moduleNames[id])id='m01';
    qa('.navitem').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
    hideAll();
    if(core[id]){
      const card=q(`#${id}`);if(card){card.classList.add('page-active');const sec=q('#approvedModules')?.closest('.section');if(sec){sec.style.display='block';const h=sec.querySelector('h2');if(h)h.textContent=core[id]}}
    }else{
      const p=q('#modulePage');p.style.display='block';p.classList.add('page-active');
      const row=extra.find(x=>x[0]===id);q('#moduleNumber').textContent=`MÓDULO ${id.slice(1)}`;q('#moduleTitle').textContent=row[1];q('#moduleText').textContent=row[2];q('#moduleBody').innerHTML=sourceBody(id);
      if(id==='m25'){const admin=q('#adminPanel');if(admin)admin.style.display='block'}
    }
    history.replaceState(null,'',`#${id}`);window.scrollTo({top:0,behavior:'auto'});
  }

  function viewer(){
    const app=q('#appPanel');if(!app)return;
    let v=q('#documentViewerPage');if(v)return;
    v=document.createElement('section');v.id='documentViewerPage';v.className='section';
    v.innerHTML=`<div class="box module-shell"><div class="module-head"><div><span class="tag">DOCUMENTO</span><h2 id="docTitle">Visualizador</h2><p class="muted">Somente um documento é exibido por vez nesta janela.</p></div><button class="btn alt" id="docClose" type="button">Fechar</button></div><div class="doc-toolbar"><a id="docNewTab" class="btn" target="_blank" rel="noopener">Abrir em nova aba</a></div><div class="doc-viewer" id="docFrameBox"><div class="doc-empty">Selecione um documento para visualizar.</div></div></div>`;
    app.prepend(v);q('#docClose').onclick=()=>show(location.hash.slice(1).startsWith('m')?location.hash.slice(1):'m05');
  }

  window.sgqOpenDocument=(url,title='Documento',mode='panel')=>{
    if(!url)return;
    if(mode==='tab'){window.open(url,'_blank','noopener');return}
    hideAll();const v=q('#documentViewerPage');v.style.display='block';v.classList.add('page-active');q('#docTitle').textContent=title;q('#docNewTab').href=url;q('#docFrameBox').innerHTML=`<iframe src="${String(url).replace(/"/g,'&quot;')}" title="${String(title).replace(/"/g,'&quot;')}"></iframe>`;
  };

  function bind(){qa('.navitem[data-target]').forEach(b=>b.onclick=()=>show(b.dataset.target))}
  function init(){styles();buildExtraMenu();buildPages();viewer();bind();show(moduleNames[location.hash.slice(1)]?location.hash.slice(1):'m01')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
