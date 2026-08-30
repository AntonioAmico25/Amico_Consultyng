(() => {
'use strict';

const STYLE_ID='sgqExplicitAuthStyle';
function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent='body:not(.sgq-explicit-auth) #appView{display:none!important}body:not(.sgq-explicit-auth) #loginView{display:block!important}';
  document.head.appendChild(s);
}
installStyle();

let explicit=false;
async function forceLoginState(){
  document.body?.classList.remove('sgq-explicit-auth');
  explicit=false;
  try{await sb.auth.signOut({scope:'local'});}catch(_){try{await sb.auth.signOut();}catch(__){}}
  const login=document.getElementById('loginView'),app=document.getElementById('appView');
  if(login)login.classList.remove('hidden');if(app)app.classList.add('hidden');
}

async function explicitLogin(){
  const email=document.getElementById('loginEmail')?.value?.trim()||'';
  const password=document.getElementById('loginPassword')?.value||'';
  const msg=document.getElementById('loginMsg');
  if(!email||!password){if(msg)msg.textContent='Informe e-mail e senha.';return;}
  if(msg)msg.textContent='Validando usuário e senha...';
  try{
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.session)throw new Error('Sessão não criada.');
    currentUser=data.session.user;
    currentRole=await getRole();
    if(!currentRole)throw new Error('Usuário sem perfil ativo no SGQ Manager.');
    explicit=true;
    document.body.classList.add('sgq-explicit-auth');
    if(msg)msg.textContent='';
    await boot(data.session);
  }catch(e){
    explicit=false;document.body.classList.remove('sgq-explicit-auth');
    const app=document.getElementById('appView'),login=document.getElementById('loginView');
    if(app)app.classList.add('hidden');if(login)login.classList.remove('hidden');
    if(msg)msg.textContent=e?.message||String(e);
  }
}

function bind(){
  const btn=document.getElementById('loginBtn');if(!btn)return setTimeout(bind,100);
  btn.onclick=e=>{e.preventDefault();explicitLogin();};
  const logout=document.getElementById('logoutBtn');if(logout)logout.onclick=async()=>{explicit=false;document.body.classList.remove('sgq-explicit-auth');try{await sb.auth.signOut();}finally{location.reload();}};
  sb.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'||!session){explicit=false;document.body.classList.remove('sgq-explicit-auth');}
    if(session&&!explicit){const app=document.getElementById('appView'),login=document.getElementById('loginView');if(app)app.classList.add('hidden');if(login)login.classList.remove('hidden');}
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',async()=>{await forceLoginState();bind();});else{forceLoginState().then(bind);}
window.SGQExplicitAuth={login:explicitLogin,isExplicit:()=>explicit,reset:forceLoginState};
})();
