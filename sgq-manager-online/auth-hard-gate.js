(() => {
'use strict';
const STYLE_ID='sgqExplicitAuthStyle';
function installStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='body:not(.sgq-explicit-auth) #appView{display:none!important}body:not(.sgq-explicit-auth) #loginView{display:block!important}';document.head.appendChild(s)}
installStyle();
let explicit=false;
const el=id=>document.getElementById(id);
let legacyBootShielded=false;
function shieldLegacyBoot(){
  try{
    const noop=async()=>{};
    window.boot=noop;
    legacyBootShielded=true;
  }catch(e){console.error('Não foi possível neutralizar o boot legado',e)}
}
async function forceLoginState(){shieldLegacyBoot();document.body?.classList.remove('sgq-explicit-auth');explicit=false;try{await sb.auth.signOut({scope:'local'})}catch(_){try{await sb.auth.signOut()}catch(__){}}const login=el('loginView'),app=el('appView');if(login)login.classList.remove('hidden');if(app)app.classList.add('hidden')}
async function safeHydrate(session){
  currentUser=session.user;
  try{currentRole=await getRole()}catch(_){currentRole=''}
  if(!currentRole)throw new Error('Usuário sem perfil ativo no SGQ Manager.');
  const badge=el('sessionBadge');if(badge)badge.textContent=`${currentUser.email} · ${currentRole}`;
  const users=el('usersNav');if(users)users.classList.toggle('hidden',currentRole!=='MASTER');
  const login=el('loginView'),app=el('appView');if(login)login.classList.add('hidden');if(app)app.classList.remove('hidden');
  try{document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));el('dash')?.classList.remove('hidden');document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view==='dash'))}catch(e){console.error('dashboard init',e)}
  setTimeout(async()=>{
    if(!explicit)return;
    const jobs=[];
    if(typeof loadDocs==='function')jobs.push(Promise.resolve().then(()=>loadDocs()).catch(e=>console.error('loadDocs',e)));
    if(typeof loadNorms==='function')jobs.push(Promise.resolve().then(()=>loadNorms()).catch(e=>console.error('loadNorms',e)));
    if(currentRole==='MASTER'&&typeof loadUsers==='function')jobs.push(Promise.resolve().then(()=>loadUsers()).catch(e=>console.error('loadUsers',e)));
    await Promise.all(jobs);
    try{window.SGQExplicitAuth?.afterLogin?.()}catch(e){console.error('afterLogin',e)}
  },700);
}
async function explicitLogin(){
  shieldLegacyBoot();
  const email=el('loginEmail')?.value?.trim()||'',password=el('loginPassword')?.value||'',msg=el('loginMsg');
  if(!email||!password){if(msg)msg.textContent='Informe e-mail e senha.';return}
  if(msg)msg.textContent='Validando usuário e senha...';
  try{
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.session)throw new Error('Sessão não criada.');
    explicit=true;document.body.classList.add('sgq-explicit-auth');if(msg)msg.textContent='';
    await safeHydrate(data.session);
  }catch(e){
    explicit=false;document.body.classList.remove('sgq-explicit-auth');const app=el('appView'),login=el('loginView');if(app)app.classList.add('hidden');if(login)login.classList.remove('hidden');if(msg)msg.textContent=e?.message||String(e)
  }
}
function bind(){
  shieldLegacyBoot();
  const btn=el('loginBtn');if(!btn)return setTimeout(bind,100);
  btn.onclick=e=>{e.preventDefault();explicitLogin()};
  const logout=el('logoutBtn');if(logout)logout.onclick=async()=>{explicit=false;document.body.classList.remove('sgq-explicit-auth');try{await sb.auth.signOut()}finally{location.reload()}};
  sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session){explicit=false;document.body.classList.remove('sgq-explicit-auth')}if(session&&!explicit){const app=el('appView'),login=el('loginView');if(app)app.classList.add('hidden');if(login)login.classList.remove('hidden')}})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',async()=>{shieldLegacyBoot();await forceLoginState();bind()});else{shieldLegacyBoot();forceLoginState().then(bind)}
window.SGQExplicitAuth={login:explicitLogin,isExplicit:()=>explicit,reset:forceLoginState,hydrate:safeHydrate,afterLogin:null,legacyBootShielded:()=>legacyBootShielded};
})();