(() => {
'use strict';

const POLL_MS = 30000;
const AGENDA_URL = '../agenda-manager/';
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tenantId = null;
let tasks = [];
let events = [];
let channel = null;
let refreshing = false;
let lastSync = null;

function ptPriority(v){return ({critical:'Crítica',high:'Alta',medium:'Média',low:'Baixa'})[String(v||'').toLowerCase()] || v || '—';}
function ptStatus(v){return ({created:'Criada',open:'Aberta',in_progress:'Em andamento',completed:'Concluída',cancelled:'Cancelada',overdue:'Vencida'})[String(v||'').toLowerCase()] || v || '—';}
function dateBR(v, withTime=false){if(!v)return '—';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return withTime?d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):d.toLocaleDateString('pt-BR');}
function isOpen(t){return !['completed','cancelled','closed'].includes(String(t.status||'').toLowerCase());}
function overdue(t){return isOpen(t) && t.due_at && new Date(t.due_at).getTime() < Date.now();}

async function getTenant(){
  const {data:{session},error:se}=await sb.auth.getSession();
  if(se)throw se;
  if(!session?.user)return null;
  const {data,error}=await sb.from('user_memberships').select('tenant_id,status,is_default').eq('user_id',session.user.id).in('status',['active','ACTIVE','ATIVO']).order('is_default',{ascending:false}).limit(1).maybeSingle();
  if(error)throw error;
  return data?.tenant_id || null;
}

function ensureUi(){
  const section=$('agenda');
  if(!section || $('agendaManagerBridge'))return;
  const card=document.createElement('div');
  card.id='agendaManagerBridge';
  card.className='card';
  card.style.marginBottom='14px';
  card.innerHTML=`
    <div class="toolbar" style="justify-content:space-between;align-items:flex-start">
      <div><h2 style="margin:0 0 4px">Agenda Manager Online</h2><div class="muted">Agenda oficial integrada ao SGQ Manager · sincronização automática</div></div>
      <div class="toolbar"><span id="agendaBridgeStatus" class="tag">Conectando…</span><button id="agendaBridgeRefresh" class="btn alt" type="button">Atualizar agora</button><button id="agendaBridgeOpen" class="btn" type="button">Abrir Agenda Manager</button></div>
    </div>
    <div class="grid4 section">
      <div class="card"><b id="agendaTaskOpen">0</b><div class="muted">tarefas abertas</div></div>
      <div class="card"><b id="agendaTaskOverdue">0</b><div class="muted">tarefas vencidas</div></div>
      <div class="card"><b id="agendaEventsUpcoming">0</b><div class="muted">próximos eventos</div></div>
      <div class="card"><b id="agendaSyncTime">—</b><div class="muted">última sincronização</div></div>
    </div>
    <div class="grid2 section">
      <div><h3>Próximas tarefas</h3><div id="agendaBridgeTasks" class="list"></div></div>
      <div><h3>Próximos compromissos</h3><div id="agendaBridgeEvents" class="list"></div></div>
    </div>`;
  section.insertBefore(card,section.firstChild);
  $('agendaBridgeOpen').onclick=()=>window.open(AGENDA_URL,'_blank','noopener');
  $('agendaBridgeRefresh').onclick=()=>refresh(true);
}

function render(){
  ensureUi();
  const open=tasks.filter(isOpen);
  const late=open.filter(overdue);
  const now=Date.now();
  const upcoming=events.filter(e=>!e.ends_at || new Date(e.ends_at).getTime()>=now).sort((a,b)=>String(a.starts_at||'').localeCompare(String(b.starts_at||'')));
  if($('agendaTaskOpen'))$('agendaTaskOpen').textContent=open.length;
  if($('agendaTaskOverdue'))$('agendaTaskOverdue').textContent=late.length;
  if($('agendaEventsUpcoming'))$('agendaEventsUpcoming').textContent=upcoming.length;
  if($('agendaSyncTime'))$('agendaSyncTime').textContent=lastSync?lastSync.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—';
  if($('agendaBridgeTasks'))$('agendaBridgeTasks').innerHTML=open.sort((a,b)=>String(a.due_at||'9999').localeCompare(String(b.due_at||'9999'))).slice(0,12).map(t=>`<div class="item"><b>${esc(t.title)}</b>${overdue(t)?' <span class="tag dangerText">VENCIDA</span>':''}<br><small>${esc(t.context_type||'Agenda')} · ${esc(ptPriority(t.priority))} · ${esc(ptStatus(t.status))} · prazo ${esc(dateBR(t.due_at))}</small></div>`).join('')||'<span class="muted">Nenhuma tarefa aberta.</span>';
  if($('agendaBridgeEvents'))$('agendaBridgeEvents').innerHTML=upcoming.slice(0,12).map(e=>`<div class="item"><b>${esc(e.title)}</b><br><small>${esc(dateBR(e.starts_at,true))}${e.location?` · ${esc(e.location)}`:''}</small></div>`).join('')||'<span class="muted">Nenhum compromisso futuro.</span>';
  const status=$('agendaBridgeStatus');if(status){status.textContent=`● Online · ${tasks.length} tarefa(s) · ${events.length} evento(s)`;status.className='tag ok';}
  // Atualiza a agenda resumida nativa do SGQ sem apagar alertas de qualidade.
  const native=$('agendaList');
  if(native) native.innerHTML=[...open.slice(0,6).map(t=>`<div class="item"><b>${esc(t.title)}</b><br><small>Agenda Manager · ${esc(dateBR(t.due_at))} · ${esc(ptStatus(t.status))}</small></div>`),...upcoming.slice(0,4).map(e=>`<div class="item"><b>${esc(e.title)}</b><br><small>Compromisso · ${esc(dateBR(e.starts_at,true))}</small></div>`)].join('')||'<span class="muted">Agenda vazia.</span>';
}

async function refresh(manual=false){
  if(refreshing)return;
  refreshing=true;
  try{
    ensureUi();
    if(!tenantId)tenantId=await getTenant();
    if(!tenantId)throw new Error('Tenant ativo não identificado.');
    const [tr,er]=await Promise.all([
      sb.from('agm_tasks').select('*').eq('tenant_id',tenantId).order('created_at',{ascending:false}),
      sb.from('agm_events').select('*').eq('tenant_id',tenantId).order('starts_at',{ascending:true})
    ]);
    if(tr.error)throw tr.error;if(er.error)throw er.error;
    tasks=tr.data||[];events=er.data||[];lastSync=new Date();render();
    window.dispatchEvent(new CustomEvent('amico:agenda-updated',{detail:{tenantId,tasks,events,lastSync,manual}}));
  }catch(e){const s=$('agendaBridgeStatus');if(s){s.textContent='Falha na sincronização';s.className='tag dangerText';}console.error('Agenda Manager → SGQ Manager',e);}finally{refreshing=false;}
}

async function subscribe(){
  try{
    if(!tenantId)tenantId=await getTenant();
    if(!tenantId || channel)return;
    channel=sb.channel(`sgq-agenda-${tenantId}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'agm_tasks',filter:`tenant_id=eq.${tenantId}`},()=>setTimeout(()=>refresh(),250))
      .on('postgres_changes',{event:'*',schema:'public',table:'agm_events',filter:`tenant_id=eq.${tenantId}`},()=>setTimeout(()=>refresh(),250))
      .subscribe();
  }catch(e){console.warn('Realtime Agenda indisponível; mantendo atualização periódica.',e);}
}

async function boot(){
  ensureUi();
  const {data:{session}}=await sb.auth.getSession();
  if(!session)return;
  await refresh();
  await subscribe();
}

sb.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_OUT'){tenantId=null;tasks=[];events=[];if(channel){sb.removeChannel(channel);channel=null;}return;}
  if(session)setTimeout(boot,300);
});
setInterval(()=>{const app=$('appView');if(app&&!app.classList.contains('hidden'))refresh();},POLL_MS);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));else setTimeout(boot,1200);
window.SGQAgendaBridge={refresh,getState:()=>({tenantId,tasks,events,lastSync})};
})();
