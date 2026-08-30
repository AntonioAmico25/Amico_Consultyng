// AGENDA_MANAGER_R07
// Fundação comercial: planos, licenciamento, limites e integrações opcionais.
// Não armazena tokens OAuth. Conectores reais dependem de autorização do provedor.

const AGENDA_R07_PROVIDERS=[
  ['microsoft_outlook','Microsoft Outlook','Calendário e e-mail.'],
  ['microsoft_sharepoint','Microsoft SharePoint / OneDrive','Documentos e colaboração.'],
  ['microsoft_teams','Microsoft Teams','Opcional; requer conta organizacional compatível e consentimento.'],
  ['google_calendar','Google Calendar','Calendário opcional.'],
  ['gmail','Gmail','E-mail opcional.'],
  ['google_drive','Google Drive','Arquivos opcionais.'],
  ['moodle','Moodle','Integração educacional futura.']
];

function agendaR07StatusLabel(status){
  const labels={disconnected:'Não configurado',pending:'Preparação registrada',connected:'Conectado',error:'Erro',blocked:'Bloqueado'};
  return labels[status]||status||'Não configurado';
}
function agendaR07Money(cents,currency){
  if(cents===null||cents===undefined)return 'Preço a definir';
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:currency||'BRL'}).format(cents/100);
}
function agendaR07Escape(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

async function agendaR07LoadPlan(){
  const box=document.getElementById('r07PlanCurrent');
  const all=document.getElementById('r07PlanCatalog');
  if(!box||!all)return;
  if(typeof tenant==='undefined'||!tenant){box.innerHTML='<div class="empty">Autentique-se para consultar a licença.</div>';return}
  box.innerHTML='<div class="muted">Consultando licença no Supabase…</div>';
  const {data:sub,error}=await sb.from('agenda_tenant_subscriptions')
    .select('id,tenant_id,plan_id,status,source,starts_at,trial_ends_at,renews_at,agenda_plans(id,code,name,description,price_cents,currency,billing_interval,limits)')
    .eq('tenant_id',tenant).maybeSingle();
  if(error){box.innerHTML='<div class="empty">'+agendaR07Escape(error.message)+'</div>';return}
  const p=sub?.agenda_plans||{};
  let features=[];
  if(sub?.plan_id){const r=await sb.from('agenda_plan_features').select('feature_code,enabled,quota').eq('plan_id',sub.plan_id).order('feature_code');if(!r.error)features=r.data||[]}
  const enabled=features.filter(x=>x.enabled).map(x=>`<span class="pill">${agendaR07Escape(x.feature_code)}</span>`).join(' ');
  box.innerHTML=`<div class="item"><div class="grow"><b>${agendaR07Escape(p.name||'Plano')}</b><div class="muted">${agendaR07Escape(p.description||'')}</div><div class="muted">Status: ${agendaR07Escape(sub?.status||'—')} · Origem: ${agendaR07Escape(sub?.source||'—')}</div></div><span class="pill">${agendaR07Money(p.price_cents,p.currency)}</span></div><div class="section">${enabled||'<span class="muted">Nenhum recurso liberado.</span>'}</div>`;

  const plans=await sb.from('agenda_plans').select('id,code,name,audience,description,price_cents,currency,billing_interval,limits,sort_order').eq('is_active',true).order('sort_order');
  if(plans.error){all.innerHTML='<div class="empty">'+agendaR07Escape(plans.error.message)+'</div>';return}
  all.innerHTML=(plans.data||[]).map(x=>`<div class="card"><h3 style="margin-top:0">${agendaR07Escape(x.name)}</h3><div class="muted">${agendaR07Escape(x.description||'')}</div><p><b>${agendaR07Money(x.price_cents,x.currency)}</b></p><div class="muted">Usuários: ${x.limits?.users??'sem limite definido'} · Workspaces: ${x.limits?.workspaces??'sem limite definido'} · IA/mês: ${x.limits?.ai_monthly??'sem limite definido'}</div><div class="section"><span class="pill">${agendaR07Escape(x.code)}</span></div></div>`).join('')||'<div class="empty">Nenhum plano disponível.</div>';
}

async function agendaR07PrepareIntegration(provider){
  if(typeof tenant==='undefined'||!tenant)return alert('Autentique-se primeiro.');
  const payload={tenant_id:tenant,provider,account_label:'Principal',status:'pending',config:{mode:'optional',credentials_stored:false,requested_from:'agenda-manager-r07'}};
  const {error}=await sb.from('agenda_integration_connections').upsert(payload,{onConflict:'tenant_id,provider,account_label'});
  if(error)return alert(error.message);
  await agendaR07LoadIntegrations();
}

async function agendaR07LoadIntegrations(){
  const box=document.getElementById('r07Integrations');
  if(!box)return;
  if(typeof tenant==='undefined'||!tenant){box.innerHTML='<div class="empty">Autentique-se para consultar integrações.</div>';return}
  const {data,error}=await sb.from('agenda_integration_connections').select('id,provider,account_label,status,last_sync_at,last_error,config').eq('tenant_id',tenant);
  if(error){box.innerHTML='<div class="empty">'+agendaR07Escape(error.message)+'</div>';return}
  const by=new Map((data||[]).map(x=>[x.provider,x]));
  box.innerHTML=AGENDA_R07_PROVIDERS.map(([code,name,desc])=>{
    const c=by.get(code);const status=agendaR07StatusLabel(c?.status);
    const extra=c?.last_sync_at?` · última sincronização ${new Date(c.last_sync_at).toLocaleString('pt-BR')}`:'';
    return `<div class="item"><div class="grow"><b>${agendaR07Escape(name)}</b><div class="muted">${agendaR07Escape(desc)}</div><div class="muted">${agendaR07Escape(status)}${agendaR07Escape(extra)}</div></div>${c?'<span class="pill">'+agendaR07Escape(c.status)+'</span>':`<button class="btn" onclick="agendaR07PrepareIntegration('${code}')">Preparar</button>`}</div>`;
  }).join('');
}

function agendaR07Inject(){
  const sideSub=document.querySelector('.side .sub');if(sideSub)sideSub.textContent='AMICO CONSULTYNG · v0.3 R07';
  const authSub=document.querySelector('#auth .muted');if(authSub)authSub.textContent='AMICO CONSULTYNG · Fundação SaaS Comercial R07';

  if(typeof navItems!=='undefined'&&!navItems.some(x=>x[0]==='plano')){
    const adminIndex=Math.max(0,navItems.findIndex(x=>x[0]==='admin'));
    navItems.splice(adminIndex,0,['plano','💼 Plano & Licença'],['integracoes','🔌 Integrações']);
  }
  const main=document.querySelector('main.main');
  const admin=document.getElementById('admin');
  if(main&&admin&&!document.getElementById('plano')){
    const plan=document.createElement('section');plan.id='plano';plan.className='page';plan.innerHTML=`<div class="card"><h3>Plano & Licença</h3><p class="muted">O Agenda Manager funciona como SaaS independente. Preços permanecem sem cobrança automática até a homologação comercial.</p><div id="r07PlanCurrent" class="list"></div></div><div class="section"><h3>Catálogo de planos</h3><div id="r07PlanCatalog" class="grid"></div></div>`;
    const integrations=document.createElement('section');integrations.id='integracoes';integrations.className='page';integrations.innerHTML=`<div class="card"><h3>Integrações opcionais</h3><p class="muted">Registrar uma integração aqui não conecta a conta nem grava credenciais. OAuth/tokens deverão ser tratados em serviço seguro próprio.</p><div id="r07Integrations" class="list"></div></div>`;
    main.insertBefore(plan,admin);main.insertBefore(integrations,admin);
  }
  const gate=admin?.querySelector('.list');
  if(gate&&!gate.textContent.includes('R07'))gate.insertAdjacentHTML('beforeend','<div class="item">✅ R07 · Planos, licenças e conectores opcionais</div><div class="item">⚠ Cobrança automática: ainda não habilitada</div>');

  if(typeof go==='function'&&!window.__agendaR07GoWrapped){
    const baseGo=go;
    go=function(id){baseGo(id);if(id==='plano')agendaR07LoadPlan();if(id==='integracoes')agendaR07LoadIntegrations()};
    window.__agendaR07GoWrapped=true;
  }
  if(typeof nav==='function')nav();
}

window.addEventListener('load',()=>setTimeout(agendaR07Inject,50));
