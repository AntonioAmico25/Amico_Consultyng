(() => {
'use strict';
const $=id=>document.getElementById(id);
let seq=0, running=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function showLogin(msg=''){
  $('appView')?.classList.add('hidden');
  $('loginView')?.classList.remove('hidden');
  if($('loginMsg')&&msg)$('loginMsg').textContent=msg;
}
function showApp(user,role){
  if($('sessionBadge'))$('sessionBadge').textContent=`${user.email} · ${role}`;
  $('usersNav')?.classList.toggle('hidden',role!=='MASTER');
  $('loginView')?.classList.add('hidden');
  $('appView')?.classList.remove('hidden');
  if($('loginMsg'))$('loginMsg').textContent='';
}
async function activeMembership(userId){
  let lastErr=null;
  for(let i=0;i<3;i++){
    try{
      const {data,error}=await sb.from('user_memberships').select('tenant_id,company_id,status,is_default,roles:role_id(code)').eq('user_id',userId).eq('status','active').order('is_default',{ascending:false}).limit(1).maybeSingle();
      if(error)throw error;
      if(data?.tenant_id&&data?.roles?.code)return data;
    }catch(e){lastErr=e;}
    await sleep(250*(i+1));
  }
  if(lastErr)throw lastErr;
  return null;
}
async function secureBoot(session){
  const ticket=++seq;
  if(running) await sleep(60);
  running=true;
  try{
    const s=session || (await sb.auth.getSession()).data?.session || null;
    if(ticket!==seq)return;
    if(!s?.user){
      try{currentUser=null;currentRole='';}catch(_){}
      showLogin('');
      return;
    }
    const membership=await activeMembership(s.user.id);
    if(ticket!==seq)return;
    if(!membership){
      try{currentUser=s.user;currentRole='';}catch(_){}
      showLogin('Sessão válida, mas sem vínculo ativo com uma empresa.');
      return;
    }
    const role=membership.roles?.code||'';
    try{currentUser=s.user;currentRole=role;}catch(_){}
    showApp(s.user,role);
    const jobs=[];
    if(typeof window.loadDocs==='function')jobs.push(window.loadDocs());
    if(typeof window.loadNorms==='function')jobs.push(window.loadNorms());
    await Promise.allSettled(jobs);
    if(role==='MASTER'&&typeof window.loadUsers==='function')await window.loadUsers().catch(()=>{});
    if(typeof window.localAutomation==='function')window.localAutomation();
  }catch(e){
    console.error('auth-session-fix',e);
    showLogin('Não foi possível validar a sessão. Tente entrar novamente.');
  }finally{running=false;}
}
window.boot=secureBoot;
window.SGQSecureBoot=secureBoot;
sb.auth.onAuthStateChange((_,session)=>secureBoot(session));
setTimeout(()=>secureBoot(null),0);
})();