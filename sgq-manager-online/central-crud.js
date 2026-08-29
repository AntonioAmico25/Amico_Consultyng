(() => {
  'use strict';

  const CRUD_API='sgq-core-record-crud';
  const $=id=>document.getElementById(id);
  const esc2=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const editable={module:null,id:null};
  const ALLOWED_ROLES=new Set(['MASTER','SGQ','GESTOR','CONSULTA']);

  function lockUi(message='Validando acesso e vínculo ativo...'){
    const app=$('appView'),login=$('loginView'),msg=$('loginMsg');
    if(app)app.classList.add('hidden');
    if(login)login.classList.remove('hidden');
    if(msg)msg.textContent=message;
  }

  async function denyAccess(reason){
    lockUi(reason);
    const badge=$('sessionBadge');if(badge)badge.textContent='ACESSO BLOQUEADO';
    try{await sb.auth.signOut();}catch(e){console.error('access-guard signout',e)}
    try{currentUser=null;currentRole='';}catch(_){}
    return false;
  }

  async function validateActiveMembership(){
    const {data:{session},error:se}=await sb.auth.getSession();
    if(se)throw se;
    if(!session?.user)return false;
    const {data,error}=await sb.from('user_memberships').select('tenant_id,company_id,status,is_default,roles:role_id(code)').eq('user_id',session.user.id).eq('status','active').order('is_default',{ascending:false}).limit(1).maybeSingle();
    if(error)throw error;
    const role=data?.roles?.code||'';
    if(!data?.tenant_id||!ALLOWED_ROLES.has(role))return denyAccess('Acesso bloqueado: usuário autenticado sem vínculo ativo e perfil autorizado no tenant. Contate o administrador MASTER.');
    try{currentRole=role;}catch(_){}
    const badge=$('sessionBadge');if(badge)badge.textContent=`${session.user.email} · ${role}`;
    return true;
  }

  async function enforceAccessGuard(){
    lockUi('Validando acesso e vínculo ativo...');
    try{
      const ok=await validateActiveMembership();
      if(!ok){const {data:{session}}=await sb.auth.getSession();if(!session)lockUi('');return false;}
      const app=$('appView'),login=$('loginView'),msg=$('loginMsg');
      if(login)login.classList.add('hidden');
      if(app)app.classList.remove('hidden');
      if(msg)msg.textContent='';
      return true;
    }catch(e){
      console.error('access-guard',e);
      await denyAccess('Acesso bloqueado por segurança: não foi possível validar o vínculo ativo. Tente novamente ou contate o administrador MASTER.');
      return false;
    }
  }

  async function refresh(){
    if(window.SGQCentralSync?.pullCentral) await window.SGQCentralSync.pullCentral();
    renderCrudLists();
  }

  async function createCentral(module,item,form,type){
    if(!await validateActiveMembership())throw new Error('Acesso bloqueado: vínculo ativo obrigatório.');
    if(!window.SGQCentralSync?.centralUpsert) throw new Error('Sincronização central indisponível');
    await window.SGQCentralSync.centralUpsert(module,item);
    form.reset();
    if(type==='RISCO'){ $('riskP').value='1'; $('riskI').value='1'; }
    if(typeof event==='function')event(type,'Registro salvo diretamente no banco central');
    await refresh();
  }

  async function updateCentral(module,id,item,form,type){
    if(!await validateActiveMembership())throw new Error('Acesso bloqueado: vínculo ativo obrigatório.');
    await invoke(CRUD_API,{action:'update',module,id,item});
    editable.module=null;editable.id=null;
    form.reset();
    if(type==='RISCO'){ $('riskP').value='1'; $('riskI').value='1'; }
    if(typeof event==='function')event(type,'Registro central atualizado');
    await refresh();
  }

  async function removeCentral(module,id,label){
    if(!await validateActiveMembership())return;
    if(currentRole!=='MASTER') return alert('Somente MASTER pode excluir definitivamente registros centrais.');
    if(!confirm(`Excluir definitivamente ${label}?`))return;
    await invoke(CRUD_API,{action:'delete',module,id});
    if(typeof event==='function')event('EXCLUSÃO CENTRAL',label);
    await refresh();
  }

  function submitHandler(module,form,item,type){
    return async e=>{
      e.preventDefault();
      const btn=form.querySelector('button[type="submit"],button:not([type])');
      try{
        if(btn){btn.disabled=true;btn.textContent='Salvando...';}
        if(editable.module===module&&editable.id) await updateCentral(module,editable.id,item(),form,type);
        else await createCentral(module,item(),form,type);
      }catch(err){alert(`Falha ao salvar: ${err.message||err}`)}finally{if(btn){btn.disabled=false;btn.textContent=editable.module===module?'Salvar alterações':({ACTIONS:'Salvar ação',AUDITS:'Salvar auditoria',KPIS:'Salvar indicador',RISKS:'Salvar risco'})[module];}}
    };
  }

  function beginEdit(module,row){
    editable.module=module;editable.id=row.id;
    if(module==='ACTIONS'){$('actTitle').value=row.title||'';$('actOwner').value=row.owner||'';$('actDue').value=row.due||'';$('actStatus').value=row.status||'Aberta';$('actionForm').scrollIntoView({behavior:'smooth'});}
    if(module==='AUDITS'){$('audTitle').value=row.title||'';$('audDate').value=row.date||'';$('audScope').value=row.scope||'';$('auditForm').scrollIntoView({behavior:'smooth'});}
    if(module==='KPIS'){$('kpiName').value=row.name||'';$('kpiValue').value=row.value??'';$('kpiTarget').value=row.target??'';$('kpiUnit').value=row.unit||'';$('kpiForm').scrollIntoView({behavior:'smooth'});}
    if(module==='RISKS'){$('riskTitle').value=row.title||'';$('riskP').value=row.p||1;$('riskI').value=row.i||1;$('riskForm').scrollIntoView({behavior:'smooth'});}
    const form=({ACTIONS:$('actionForm'),AUDITS:$('auditForm'),KPIS:$('kpiForm'),RISKS:$('riskForm')})[module];
    const btn=form?.querySelector('button[type="submit"],button:not([type])');if(btn)btn.textContent='Salvar alterações';
  }

  async function completeAction(row){
    if(!await validateActiveMembership())return;
    await invoke(CRUD_API,{action:'update',module:'ACTIONS',id:row.id,item:{...row,status:'Concluída'}});
    if(typeof event==='function')event('AÇÃO','Ação concluída no banco central');
    await refresh();
  }

  function controls(module,row){
    const del=currentRole==='MASTER'?`<button class="btn danger" data-crud="delete" data-module="${module}" data-id="${row.id}">Excluir</button>`:'';
    const complete=module==='ACTIONS'&&row.status!=='Concluída'?`<button class="btn alt" data-crud="complete" data-module="${module}" data-id="${row.id}">Concluir</button>`:'';
    return `<div class="toolbar section"><button class="btn alt" data-crud="edit" data-module="${module}" data-id="${row.id}">Editar</button>${complete}${del}</div>`;
  }

  function renderCrudLists(){
    if(typeof db==='undefined')return;
    if($('actList')) $('actList').innerHTML=(db.actions||[]).map(a=>`<div class="item"><b>${esc2(a.title)}</b><br><small>${esc2(a.owner)} · ${esc2(a.due)} · ${esc2(a.status)}</small>${controls('ACTIONS',a)}</div>`).join('')||'<span class="muted">Nenhuma ação.</span>';
    if($('audList')) $('audList').innerHTML=(db.audits||[]).map(a=>`<div class="item"><b>${esc2(a.title)}</b><br><small>${esc2(a.date)} · ${esc2(a.scope||'—')}</small>${controls('AUDITS',a)}</div>`).join('')||'<span class="muted">Nenhuma auditoria.</span>';
    if($('kpiList')) $('kpiList').innerHTML=(db.kpis||[]).map(k=>`<div class="item"><b>${esc2(k.name)}</b><br><small>${esc2(k.value)}${esc2(k.unit||'')} · meta ${esc2(k.target||'—')}</small>${controls('KPIS',k)}</div>`).join('')||'<span class="muted">Nenhum indicador.</span>';
    if($('riskList')) $('riskList').innerHTML=(db.risks||[]).map(r=>`<div class="item"><b>${esc2(r.title)}</b><br><small>P ${esc2(r.p)} × I ${esc2(r.i)} = NPR ${esc2((r.p||1)*(r.i||1))}</small>${controls('RISKS',r)}</div>`).join('')||'<span class="muted">Nenhum risco.</span>';
  }

  function findRow(module,id){const rows=module==='ACTIONS'?db.actions:module==='AUDITS'?db.audits:module==='KPIS'?db.kpis:db.risks;return (rows||[]).find(x=>String(x.id)===String(id));}

  function install(){
    if(!$('actionForm')||!window.SGQCentralSync)return setTimeout(install,300);
    $('actionForm').onsubmit=submitHandler('ACTIONS',$('actionForm'),()=>({title:$('actTitle').value,owner:$('actOwner').value,due:$('actDue').value,status:$('actStatus').value}),'AÇÃO');
    $('auditForm').onsubmit=submitHandler('AUDITS',$('auditForm'),()=>({title:$('audTitle').value,date:$('audDate').value,scope:$('audScope').value}),'AUDITORIA');
    $('kpiForm').onsubmit=submitHandler('KPIS',$('kpiForm'),()=>({name:$('kpiName').value,value:$('kpiValue').value,target:$('kpiTarget').value,unit:$('kpiUnit').value,period:new Date().toISOString().slice(0,10)}),'INDICADOR');
    $('riskForm').onsubmit=submitHandler('RISKS',$('riskForm'),()=>({title:$('riskTitle').value,p:+$('riskP').value,i:+$('riskI').value}),'RISCO');
    document.addEventListener('click',async e=>{
      const b=e.target.closest('[data-crud]');if(!b)return;const module=b.dataset.module,id=b.dataset.id,row=findRow(module,id);if(!row)return;
      try{if(b.dataset.crud==='edit')beginEdit(module,row);else if(b.dataset.crud==='complete')await completeAction(row);else if(b.dataset.crud==='delete')await removeCentral(module,id,row.title||row.name||id);}catch(err){alert(err.message||String(err));}
    });
    const original=window.renderLocal;
    if(typeof original==='function')window.renderLocal=function(){original();renderCrudLists();};
    setTimeout(renderCrudLists,1200);
  }

  window.SGQCentralCRUD={refresh,renderCrudLists,beginEdit,removeCentral,validateActiveMembership,enforceAccessGuard};
  enforceAccessGuard();
  install();
})();