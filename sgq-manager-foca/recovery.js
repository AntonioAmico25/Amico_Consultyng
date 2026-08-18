const RESET_EMAIL='antonio.amico@foca.com.br';
const RESET_ENDPOINT=U+'/functions/v1/reset-master-foca-once';
const RESET_TICKET_KEY='sgq_reset_ticket';
function showRecovery(){
  const lp=$('loginPanel'),rp=$('recoveryPanel'),ap=$('appPanel');
  if(lp)lp.classList.add('hidden');
  if(ap)ap.classList.add('hidden');
  if(rp)rp.classList.remove('hidden');
  if($('logoutBtn'))$('logoutBtn').classList.add('hidden');
  const p=rp?.querySelector('.muted');
  if(p)p.textContent='Defina a nova senha e confirme. Não é necessário e-mail nem código visível.';
  if($('recoveryMsg'))$('recoveryMsg').textContent='Informe a nova senha e a confirmação.';
  setTimeout(()=>$('newPassword')?.focus(),50);
}
function captureResetTicket(){
  const u=new URL(window.location.href);
  const t=u.searchParams.get('rt');
  if(t){
    sessionStorage.setItem(RESET_TICKET_KEY,t);
    u.searchParams.delete('rt');
    history.replaceState({},document.title,u.pathname+(u.searchParams.toString()?('?'+u.searchParams.toString()):'')+u.hash);
    showRecovery();
  }
}
if($('forgotBtn')){
  $('forgotBtn').textContent='Redefinir senha';
  $('forgotBtn').addEventListener('click',()=>showRecovery());
}
$('recoveryForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const p1=$('newPassword').value,p2=$('newPassword2').value;
  const ticket=sessionStorage.getItem(RESET_TICKET_KEY)||'';
  if(p1.length<12){$('recoveryMsg').textContent='Use no mínimo 12 caracteres.';return;}
  if(p1!==p2){$('recoveryMsg').textContent='As senhas não coincidem.';return;}
  if(!ticket){$('recoveryMsg').textContent='Sessão segura de redefinição não disponível. Abra o link de recuperação fornecido pelo administrador.';return;}
  $('recoveryMsg').textContent='Atualizando senha...';
  try{
    const res=await fetch(RESET_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','apikey':K},body:JSON.stringify({email:RESET_EMAIL,ticket,password:p1,confirm:p2})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const map={invalid_reset_session:'Sessão de redefinição inválida ou expirada.',reset_session_already_used:'Esta sessão de redefinição já foi utilizada.',password_invalid_or_mismatch:'A senha é inválida ou a confirmação não coincide.',user_not_found:'Usuário não encontrado.'};
      $('recoveryMsg').textContent=map[data.error]||('Não foi possível redefinir: '+(data.error||res.status));
      return;
    }
    sessionStorage.removeItem(RESET_TICKET_KEY);
    $('recoveryMsg').textContent='Senha alterada com sucesso.';
    $('recoveryForm').reset();
    setTimeout(()=>{
      $('recoveryPanel').classList.add('hidden');
      $('loginPanel').classList.remove('hidden');
      $('email').value=RESET_EMAIL;
      $('password').value='';
      $('loginMsg').textContent='Senha redefinida. Entre com a nova senha.';
      $('password').focus();
    },500);
  }catch(err){$('recoveryMsg').textContent='Falha de comunicação ao redefinir senha.';}
});
captureResetTicket();