// AGENDA_MANAGER_R08
// Entitlements reais: limites, solicitação de mudança de plano e bloqueio amigável de integrações.

const AGENDA_R08_PROVIDER_FEATURE={
  microsoft_outlook:'integrations.microsoft',
  microsoft_sharepoint:'integrations.microsoft',
  microsoft_teams:'integrations.microsoft',
  google_calendar:'integrations.google',
  gmail:'integrations.google',
  google_drive:'integrations.google',
  moodle:'education'
};

async function agendaR08FeatureEnabled(feature){
  if(typeof tenant==='undefined'||!tenant)return false;
  const {data,error}=await sb.rpc('agenda_feature_enabled',{p_tenant:tenant,p_feature:feature});
  if(error)throw error;
  return !!data;
}

async function agendaR08Limit(key){
  if(typeof tenant==='undefined'||!tenant)return 0;
  const {data,error}=await sb.rpc('agenda_limit_int',{p_tenant:tenant,p_key:key});
  if(error)throw error;
  return data===null?null:Number(data);
}

async function agendaR08PlanState(){
  const {data:sub,error}=await sb.from('agenda_tenant_subscriptions')
    .select('id,status,plan_id,agenda_plans(id,code,name,limits)')
    .eq('tenant_id',tenant).maybeSingle();
  if(error)throw error;
  const {data:reqs,error:reqErr}=await sb.from('agenda_plan_change_requests')
    .select('id,status,created_at,requested_plan_id,agenda_plans!agenda_plan_change_requests_requested_plan_id_fkey(code,name)')
    .eq('tenant_id',tenant).order('created_at',{ascending:false}).limit(5);
  if(reqErr)throw reqErr;
  return {sub,requests:reqs||[]};
}

async function agendaR08RequestPlan(planId){
  if(!session?.user?.id||!tenant)return alert('Autentique-se primeiro.');
  const {data:existing,error:existingError}=await sb.from('agenda_plan_change_requests')
    .select('id,status').eq('tenant_id',tenant).eq('status','pending').limit(1);
  if(existingError)return alert(existingError.message);
  if(existing?.length)return alert('Já existe uma solicitação de alteração de plano pendente.');
  const {error}=await sb.from('agenda_plan_change_requests').insert({
    tenant_id:tenant,
    requester_id:session.user.id,
    requested_plan_id:planId,
    status:'pending',
    note:'Solicitação iniciada pelo Agenda Manager R08. Sem cobrança automática.'
  });
  if(error)return alert(error.message);
  alert('Solicitação registrada. Nenhuma cobrança ou alteração automática foi executada.');
  await agendaR08LoadPlan();
}

async function agendaR08LoadPlan(){
  const box=document.getElementById('r07PlanCurrent');
  const all=document.getElementById('r07PlanCatalog');
  if(!box||!all||!tenant)return;
  try{
    const state=await agendaR08PlanState();
    const p=state.sub?.agenda_plans||{};
    const workspaceLimit=await agendaR08Limit('workspaces');
    const workspaces=(typeof data!=='undefined'?data.workspaces?.filter(w=>w.status!=='inactive').length:0)||0;
    const pending=state.requests.find(r=>r.status==='pending');
    box.innerHTML=`<div class="item"><div class="grow"><b>${agendaR07Escape(p.name||'Plano')}</b><div class="muted">Status: ${agendaR07Escape(state.sub?.status||'—')}</div><div class="muted">Workspaces: ${workspaces} / ${workspaceLimit===null?'∞':workspaceLimit}</div></div><span class="pill">R08 · entitlement ativo</span></div>${pending?`<div class="status section">Solicitação pendente: <b>${agendaR07Escape(pending.agenda_plans?.name||pending.agenda_plans?.code||'plano')}</b> · ${new Date(pending.created_at).toLocaleString('pt-BR')}</div>`:''}`;

    const plans=await sb.from('agenda_plans').select('id,code,name,audience,description,price_cents,currency,billing_interval,limits,sort_order').eq('is_active',true).order('sort_order');
    if(plans.error)throw plans.error;
    all.innerHTML=(plans.data||[]).map(x=>{
      const current=x.id===state.sub?.plan_id;
      return `<div class="card"><h3 style="margin-top:0">${agendaR07Escape(x.name)}</h3><div class="muted">${agendaR07Escape(x.description||'')}</div><p><b>${agendaR07Money(x.price_cents,x.currency)}</b></p><div class="muted">Usuários: ${x.limits?.users??'sem limite definido'} · Workspaces: ${x.limits?.workspaces??'sem limite definido'} · IA/mês: ${x.limits?.ai_monthly??'sem limite definido'}</div><div class="section">${current?'<span class="pill">Plano atual</span>':`<button class="btn" onclick="agendaR08RequestPlan('${x.id}')" ${pending?'disabled':''}>Solicitar alteração</button>`}</div></div>`;
    }).join('');
  }catch(e){box.innerHTML='<div class="empty">'+agendaR07Escape(e.message)+'</div>'}
}

async function agendaR08LoadIntegrations(){
  const box=document.getElementById('r07Integrations');
  if(!box||!tenant)return;
  const {data:connections,error}=await sb.from('agenda_integration_connections').select('id,provider,account_label,status,last_sync_at,last_error,config').eq('tenant_id',tenant);
  if(error){box.innerHTML='<div class="empty">'+agendaR07Escape(error.message)+'</div>';return}
  const by=new Map((connections||[]).map(x=>[x.provider,x]));
  const featureCache={};
  for(const feature of [...new Set(Object.values(AGENDA_R08_PROVIDER_FEATURE))]){
    try{featureCache[feature]=await agendaR08FeatureEnabled(feature)}catch{featureCache[feature]=false}
  }
  box.innerHTML=AGENDA_R07_PROVIDERS.map(([code,name,desc])=>{
    const c=by.get(code);const feature=AGENDA_R08_PROVIDER_FEATURE[code]||'admin.advanced';
    const allowed=!!featureCache[feature];
    const status=c?agendaR07StatusLabel(c.status):(allowed?'Disponível para preparação':'Não incluído no plano atual');
    let action='';
    if(c) action=`<span class="pill">${agendaR07Escape(c.status)}</span>`;
    else if(allowed) action=`<button class="btn" onclick="agendaR08PrepareIntegration('${code}')">Preparar</button>`;
    else action='<span class="pill">Requer upgrade</span>';
    return `<div class="item"><div class="grow"><b>${agendaR07Escape(name)}</b><div class="muted">${agendaR07Escape(desc)}</div><div class="muted">${agendaR07Escape(status)}</div></div>${action}</div>`;
  }).join('');
}

async function agendaR08PrepareIntegration(provider){
  const feature=AGENDA_R08_PROVIDER_FEATURE[provider]||'admin.advanced';
  let allowed=false;try{allowed=await agendaR08FeatureEnabled(feature)}catch(e){return alert(e.message)}
  if(!allowed)return alert('Este conector não está incluído no plano atual. Solicite alteração de plano.');
  return agendaR07PrepareIntegration(provider);
}

function agendaR08WrapWorkspaceLimit(){
  if(typeof addWorkspace!=='function'||window.__agendaR08WorkspaceWrapped)return;
  const baseAddWorkspace=addWorkspace;
  addWorkspace=async function(){
    try{
      const limit=await agendaR08Limit('workspaces');
      const count=(data.workspaces||[]).filter(w=>w.status!=='inactive').length;
      if(limit!==null&&count>=limit)return alert(`Limite de ${limit} workspaces atingido para o plano atual.`);
    }catch(e){console.warn('R08 limit check',e)}
    return baseAddWorkspace();
  };
  window.__agendaR08WorkspaceWrapped=true;
}

function agendaR08Inject(){
  const sideSub=document.querySelector('.side .sub');if(sideSub)sideSub.textContent='AMICO CONSULTYNG · v0.4 R08';
  const authSub=document.querySelector('#auth .muted');if(authSub)authSub.textContent='AMICO CONSULTYNG · SaaS Comercial R08';
  const gate=document.querySelector('#admin .list');
  if(gate&&!gate.textContent.includes('R08'))gate.insertAdjacentHTML('beforeend','<div class="item">✅ R08 · Entitlements e limites por plano</div><div class="item">✅ Upgrade por solicitação auditável</div><div class="item">⚠ Pagamento/OAuth real: não habilitados nesta revisão</div>');
  agendaR08WrapWorkspaceLimit();
  if(typeof go==='function'&&!window.__agendaR08GoWrapped){
    const baseGo=go;
    go=function(id){baseGo(id);if(id==='plano')agendaR08LoadPlan();if(id==='integracoes')agendaR08LoadIntegrations()};
    window.__agendaR08GoWrapped=true;
  }
  if(typeof nav==='function')nav();
}

window.addEventListener('load',()=>setTimeout(agendaR08Inject,100));
