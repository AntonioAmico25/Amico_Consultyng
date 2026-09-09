const AMICO_SUPABASE_URL='https://jldmisisyqewmzqhcdob.supabase.co';
const AMICO_SUPABASE_KEY='sb_publishable__FKm_nNVYKJPRTlg-l84Kw_O9Izh8eI';
const sb=window.supabase.createClient(AMICO_SUPABASE_URL,AMICO_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

async function agendaSession(){const {data:{session}}=await sb.auth.getSession();return session}
async function agendaBootstrap(){const {data,error}=await sb.rpc('agm_bootstrap_current_user');if(error)throw error;return data}
async function agendaMembership(){const {data,error}=await sb.from('user_memberships').select('tenant_id,is_default,status').eq('user_id',(await agendaSession())?.user?.id).in('status',['active','ACTIVE','ATIVO']).order('is_default',{ascending:false}).limit(1).maybeSingle();if(error)throw error;return data}
async function agendaLoad(tenant){
 const [tasks,events,workspaces,calendars]=await Promise.all([
  sb.from('agm_tasks').select('*').eq('tenant_id',tenant).order('created_at',{ascending:false}),
  sb.from('agm_events').select('*').eq('tenant_id',tenant).order('starts_at',{ascending:true}),
  sb.from('agm_workspaces').select('*').eq('tenant_id',tenant).order('is_default',{ascending:false}),
  sb.from('agm_calendars').select('*').eq('tenant_id',tenant).order('is_default',{ascending:false})
 ]);
 for(const r of [tasks,events,workspaces,calendars])if(r.error)throw r.error;
 return {tasks:tasks.data||[],events:events.data||[],workspaces:workspaces.data||[],calendars:calendars.data||[]};
}
