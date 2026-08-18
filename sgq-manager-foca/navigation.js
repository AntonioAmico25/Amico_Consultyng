(()=>{
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const moduleNames={
    m01:'Visão executiva',m02:'Governança do Escopo',m03:'Estratégia e contexto',m04:'Processos e riscos',m05:'Documentos e registros',m06:'Indicadores',m07:'Auditorias',m08:'RQ 045 e planos',m09:'Encarroçadoras e laboratórios',m10:'Certificações',m11:'APQP · PPAP · FMEA',m12:'Metrologia e 5S',m13:'Ações e melhorias',m14:'Garantias e pós-vendas',m15:'Usuários, LGPD e trilha',m16:'Aplicativo e dispositivos'
  };
  const quick=[
    ['Operação e Controle','Controles integrados','controles'],
    ['Operação e Controle','Planilhas','planilhas'],
    ['Operação e Controle','Alertas','alertas'],
    ['Operação e Controle','Agenda SGQ','agenda'],
    ['Operação e Controle','Histórico / Audit Log','historico'],
    ['Operação e Controle','Importar RQs','importar'],
    ['Integrações','Portais','portais'],
    ['Integrações','Central de Agentes IA','agentes'],
    ['Administração','Usuários e Acessos','usuarios'],
    ['Administração','Configurações','configuracoes']
  ];
  const pageText={
    controles:['Controles integrados','Visão transversal de documentos, indicadores, auditorias, ações, riscos, alertas e agenda.'],
    planilhas:['Planilhas','Central de planilhas do SGQ, importação, exportação e produtos automatizados por módulo.'],
    alertas:['Alertas','Alertas abertos, criticidade, origem, prazo, responsável e escalonamento.'],
    agenda:['Agenda SGQ','Agenda diária, semanal, mensal, periódica, auditorias, certificações, calibrações e revisões.'],
    historico:['Histórico / Audit Log','Rastreabilidade de acessos, alterações, aprovações, revisões, automações e decisões.'],
    importar:['Importar RQs','Entrada controlada de RQs, validação, mapeamento de campos e registro da origem.'],
    portais:['Portais','Catálogo de portais oficiais e sistemas externos: INMETRO, Cgcre, IMDS, NEWPROD, MES e demais integrações.'],
    agentes:['Central de Agentes IA','Agentes supervisionados por módulo, com fontes governadas, RBAC/RLS e human-in-the-loop.'],
    usuarios:['Usuários e Acessos','Gestão de usuários, papéis, permissões por módulo, bloqueios, LGPD e trilha de auditoria.'],
    configuracoes:['Configurações','Parâmetros do tenant, módulos, automações, frequências, integrações, regras e preferências operacionais.']
  };
  function injectStyle(){
    const st=document.createElement('style');
    st.textContent=`
      #approvedModules{display:block!important}
      #approvedModules .approved{display:none;min-height:330px}
      #approvedModules .approved.page-active{display:block}
      .side-group{margin-top:16px;padding-top:12px;border-top:1px solid var(--line)}
      .side-group-title{margin:0 8px 7px;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
      .quickitem{font-size:12px;padding:8px 11px}
      #transversalPage{display:none}
      #transversalPage.page-active{display:block}
      .page-head{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:14px}
      .page-head h2{margin:0}
      .page-placeholder{min-height:310px}
      @media(max-width:1050px){.sidebar{max-height:420px;overflow:auto}}
    `;
    document.head.appendChild(st);
  }
  function injectQuickMenu(){
    const side=q('#approvedMenu'); if(!side)return;
    let group=''; let box=null;
    quick.forEach(([g,label,key])=>{
      if(g!==group){group=g;box=document.createElement('div');box.className='side-group';box.innerHTML=`<div class="side-group-title">${g}</div>`;side.appendChild(box)}
      const b=document.createElement('button'); b.className='navitem quickitem'; b.dataset.quick=key; b.textContent=label; box.appendChild(b);
    });
  }
  function makeTransversalPage(){
    const app=q('#appPanel'); if(!app)return;
    const sec=document.createElement('section');sec.id='transversalPage';sec.className='section';
    sec.innerHTML='<div class="box page-placeholder"><div class="page-head"><h2 id="transversalTitle">Página</h2><span class="tag">MENU TRANSVERSAL</span></div><p id="transversalText" class="muted"></p><div id="transversalBody" class="section"></div></div>';
    app.prepend(sec);
  }
  function hideOperationalSections(){
    const app=q('#appPanel'); if(!app)return;
    qa(':scope > .section',app).forEach(s=>{if(s.id!=='transversalPage' && !s.querySelector('#approvedModules'))s.style.display='none'});
    const approved=q('#approvedModules'); if(approved)approved.closest('.section').style.display='block';
  }
  function showModule(id){
    qa('.navitem').forEach(b=>b.classList.remove('active'));
    const btn=q(`.navitem[data-target="${id}"]`);if(btn)btn.classList.add('active');
    hideOperationalSections();
    q('#transversalPage')?.classList.remove('page-active');
    qa('#approvedModules .approved').forEach(x=>x.classList.toggle('page-active',x.id===id));
    const section=q('#approvedModules')?.closest('.section');
    if(section){const h=section.querySelector('h2');if(h)h.textContent=moduleNames[id]||'Módulo'}
    history.replaceState(null,'',`#${id}`);
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function showQuick(key){
    qa('.navitem').forEach(b=>b.classList.remove('active'));
    q(`.navitem[data-quick="${key}"]`)?.classList.add('active');
    const app=q('#appPanel'); if(!app)return;
    qa(':scope > .section',app).forEach(s=>s.style.display='none');
    const page=q('#transversalPage');page.style.display='block';page.classList.add('page-active');
    const [title,text]=pageText[key]||['Página',''];q('#transversalTitle').textContent=title;q('#transversalText').textContent=text;
    const body=q('#transversalBody');body.innerHTML='<div class="flow"><span>Dados filtrados por perfil</span><span>Rastreabilidade</span><span>Integração transversal</span></div>';
    if(key==='alertas'){const src=q('#alertsList'); if(src)body.innerHTML=`<div class="list"><h3>Alertas abertos</h3>${src.innerHTML}</div>`}
    if(key==='agenda'){const src=q('#agendaList'); if(src)body.innerHTML=`<div class="list"><h3>Agenda próxima</h3>${src.innerHTML}</div>`}
    if(key==='portais'){const src=q('#portalsList'); if(src)body.innerHTML=`<div class="list"><h3>Catálogo de Portais</h3>${src.innerHTML}</div>`}
    if(key==='usuarios'){const admin=q('#adminPanel');body.innerHTML=admin?'<div class="note">Use o painel Administração SGQ abaixo conforme sua permissão MASTER/SGQ.</div>':'<div class="empty">Acesso condicionado ao perfil.</div>'; if(admin){admin.style.display='block'}}
    history.replaceState(null,'',`#${key}`);window.scrollTo({top:0,behavior:'smooth'});
  }
  function bind(){
    qa('.navitem[data-target]').forEach(b=>b.addEventListener('click',()=>showModule(b.dataset.target)));
    qa('.navitem[data-quick]').forEach(b=>b.addEventListener('click',()=>showQuick(b.dataset.quick)));
  }
  function init(){injectStyle();injectQuickMenu();makeTransversalPage();bind();const h=location.hash.slice(1);if(moduleNames[h])showModule(h);else if(pageText[h])showQuick(h);else showModule('m01')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
