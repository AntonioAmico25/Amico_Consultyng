const recoveryUrl=()=>window.location.origin+window.location.pathname;
function showRecovery(){
  const lp=$('loginPanel'),rp=$('recoveryPanel'),ap=$('appPanel');
  if(lp)lp.classList.add('hidden'); if(ap)ap.classList.add('hidden'); if(rp)rp.classList.remove('hidden');
  if($('logoutBtn'))$('logoutBtn').classList.add('hidden');
}
$('forgotBtn').addEventListener('click',async()=>{
  const email=$('email').value.trim();
  if(!email){$('loginMsg').textContent='Informe seu e-mail antes de solicitar a recuperação.';return;}
  $('loginMsg').textContent='Enviando link de recuperação...';
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:recoveryUrl()});
  $('loginMsg').textContent=error?'Não foi possível enviar: '+error.message:'Link de recuperação enviado. Abra o e-mail e retorne por ele para definir a nova senha.';
});
$('recoveryForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const p1=$('newPassword').value,p2=$('newPassword2').value;
  if(p1.length<12){$('recoveryMsg').textContent='Use no mínimo 12 caracteres.';return;}
  if(p1!==p2){$('recoveryMsg').textContent='As senhas não coincidem.';return;}
  $('recoveryMsg').textContent='Atualizando senha...';
  const {error}=await sb.auth.updateUser({password:p1});
  if(error){$('recoveryMsg').textContent='Não foi possível atualizar: '+error.message;return;}
  $('recoveryMsg').textContent='Senha alterada com sucesso. Você já pode entrar com a nova senha.';
  await sb.auth.signOut();
  $('recoveryPanel').classList.add('hidden'); $('loginPanel').classList.remove('hidden');
  $('password').value=''; $('loginMsg').textContent='Senha redefinida. Entre novamente.';
  history.replaceState({},document.title,recoveryUrl());
});
sb.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY'){
    showRecovery();
    $('recoveryMsg').textContent='Link validado. Defina sua nova senha.';
  }
});
if(window.location.hash.includes('type=recovery')||window.location.search.includes('type=recovery')) showRecovery();