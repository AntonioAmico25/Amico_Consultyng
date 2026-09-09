(() => {
'use strict';

const STYLE_ID='sgqExplicitAuthStyle';
function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent='body:not(.sgq-explicit-auth) #appView{display:none!important}body:not(.sgq-explicit-auth) #loginView{display:block!important}';
  document.head.appendChild(s);
}
installStyle();

/*
  O index legado registra onAuthStateChange/getSession antes da camada nova.
  Como este arquivo é carregado no <head>, interceptamos a criação do cliente
  Supabase e bloqueamos SOMENTE essas inscrições automáticas durante o parsing.
  Após DOMContentLoaded, o cliente volta ao comportamento normal e o login
  explícito abaixo assume o controle integral da sessão.
*/
let rawOnAuthStateChange=null;
let rawGetSession=null;
if(window.supabase?.createClient && !window.__sgqCreateClientWrapped){
  const originalCreateClient=window.supabase.createClient.bind(window.supabase);
  window.supabase.createClient=(...args)=>{
    const client=originalCreateClient(...args);
    if(client?.auth && !client.auth.__sgqLegacyShield){
      rawOnAuthStateChange=client.auth.onAuthStateChange.bind(client.auth);
      rawGetSession=client.auth.getSession.bind(client.auth);
      client.auth.onAuthStateChange=(callback)=>{
        if(document.readyState==='loading'){
          return {data:{subscription:{unsubscribe(){}}}};
        }
        return rawOnAuthStateChange(callback);
      };
      client.auth.getSession=()=>{
        if(document.readyState==='loading'){
          return Promise.resolve({data:{session:null},error:null});
        }
        return rawGetSession();
      };
      client.auth.__sgqLegacyShield=true;
    }
    return client;
  };
  window.__sgqCreateClientWrapped=true;
}

let explicit=false;
const el=id=>document.getElementById(id);

async function forceLoginState(){
  document.body?.classList.remove('sgq-explicit-auth');
  explicit=false;
  try{await sb.auth.signOut({scope:'local'});}catch(_){try{await sb.auth.signOut();}catch(__){}}
  const login=el('loginView'),app=el('appView');
  if(login)login.classList.remove('hidden');
  if(app)app.classList.add('hidden');
}

function showDashboard(){
  try{
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    el('masterAdminPanel')?.classList.add('hidden');
    el('dash')?.classList.remove('hidden');
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view==='dash'));
  }catch(e){console.error('dashboard init',e);}
}

async function safeHydrate(session){
  currentUser=session.user;
  try{currentRole=await getRole();}catch(_){currentRole='';}
  if(!currentRole)throw new Error('Usuário sem perfil ativo no SGQ Manager.');

  const badge=el('sessionBadge');
  if(badge)badge.textContent=`${currentUser.email} · ${currentRole}`;
  const users=el('usersNav');
  if(users)users.classList.toggle('hidden',currentRole!=='MASTER');

  const login=el('loginView'),app=el('appView');
  if(login)login.classList.add('hidden');
  if(app)app.classList.remove('hidden');
  showDashboard();

  // Carregamentos isolados: falha em um módulo não derruba o login.
  const safe=async(label,fn)=>{try{if(typeof fn==='function')await fn();}catch(e){console.error(label,e);}};
  await Promise.all([
    safe('loadDocs',typeof loadDocs==='function'?loadDocs:null),
    safe('loadNorms',typeof loadNorms==='function'?loadNorms:null),
    currentRole==='MASTER'?safe('loadUsers',typeof loadUsers==='function'?loadUsers:null):Promise.resolve()
  ]);
  try{if(typeof localAutomation==='function')localAutomation();}catch(e){console.error('localAutomation',e);}
  showDashboard();
  setTimeout(()=>{try{window.SGQExplicitAuth?.afterLogin?.();}catch(_){}},400);
}

async function explicitLogin(){
  const email=el('loginEmail')?.value?.trim()||'';
  const password=el('loginPassword')?.value||'';
  const msg=el('loginMsg');
  if(!email||!password){if(msg)msg.textContent='Informe e-mail e senha.';return;}
  if(msg)msg.textContent='Validando usuário e senha...';
  try{
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.session)throw new Error('Sessão não criada.');
    explicit=true;
    document.body.classList.add('sgq-explicit-auth');
    if(msg)msg.textContent='';
    await safeHydrate(data.session);
  }catch(e){
    explicit=false;
    document.body.classList.remove('sgq-explicit-auth');
    const app=el('appView'),login=el('loginView');
    if(app)app.classList.add('hidden');
    if(login)login.classList.remove('hidden');
    if(msg)msg.textContent=e?.message||String(e);
  }
}

function bind(){
  const btn=el('loginBtn');
  if(!btn)return setTimeout(bind,100);
  btn.onclick=e=>{e.preventDefault();explicitLogin();};

  const logout=el('logoutBtn');
  if(logout)logout.onclick=async()=>{
    explicit=false;
    document.body.classList.remove('sgq-explicit-auth');
    try{await sb.auth.signOut();}finally{location.reload();}
  };

  // Usa a inscrição original, não o wrapper de compatibilidade.
  const subscribe=rawOnAuthStateChange || sb.auth.onAuthStateChange.bind(sb.auth);
  subscribe((event,session)=>{
    if(event==='SIGNED_OUT'||!session){
      explicit=false;
      document.body.classList.remove('sgq-explicit-auth');
    }
    if(session&&!explicit){
      const app=el('appView'),login=el('loginView');
      if(app)app.classList.add('hidden');
      if(login)login.classList.remove('hidden');
    }
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',async()=>{await forceLoginState();bind();},{once:true});
}else{
  forceLoginState().then(bind);
}

window.SGQExplicitAuth={login:explicitLogin,isExplicit:()=>explicit,reset:forceLoginState,hydrate:safeHydrate,afterLogin:null};
})();