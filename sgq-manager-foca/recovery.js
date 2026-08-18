const RESET_EMAIL='antonio.amico@foca.com.br';
const RESET_ENDPOINT=U+'/functions/v1/reset-master-foca-once';
function showRecovery(){
  const lp=$('loginPanel'),rp=$('recoveryPanel'),ap=$('appPanel');
  if(lp)lp.classList.add('hidden'); if(ap)ap.classList.add('hidden'); if(rp)rp.classList.remove('hidden');
  if($('logoutBtn'))$('logoutBtn').classList.add('hidden');
  let form=$('recoveryForm');
  if(form && !$('recoveryCode')){
    const wrap=document.createElement('div');
    wrap.className='field';
    wrap.innerHTML='<label>Código de recuperação</label><input id="recoveryCode" type="text" autocomplete="one-time-code" required placeholder="FOCA-...">';
    form.insertBefore(wrap,form.firstChild);
  }
  const p=rp?.querySelector('.muted');
  if(p)p.textContent='Informe o código de recuperação e defina a nova senha. Não é necessário acessar e-mail.';
  if($('recoveryMsg'))$('recoveryMsg').textContent='Informe o código de recuperação, a nova senha e a confirmação.';
}
if($('forgotBtn')){
  $('forgotBtn').textContent='Redefinir senha';
  $('forgotBtn').addEventListener('click',()=>showRecovery());
}
$('recoveryForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const code=$('recoveryCode')?.value.trim()||'';
  const p1=$('newPassword').value,p2=$('newPassword2').value;
  if(!code){$('recoveryMsg').textContent='Informe o código de recuperação.';return;}
  if(p1.length<12){$('recoveryMsg').textContent='Use no mínimo 12 caracteres.';return;}
  if(p1!==p2){$('recoveryMsg').textContent='As senhas não coincidem.';return;}
  $('recoveryMsg').textContent='Atualizando senha...';
  try{
    const res=await fetch(RESET_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','apikey':K},body:JSON.stringify({email:RESET_EMAIL,code,password:p1,confirm:p2})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const map={invalid_recovery_code:'Código de recuperação inválido.',recovery_code_already_used:'Este código já foi utilizado.',password_invalid_or_mismatch:'A senha é inválida ou a confirmação não coincide.',user_not_found:'Usuário não encontrado.'};
      $('recoveryMsg').textContent=map[data.error]||('Não foi possível redefinir: '+(data.error||res.status));
      return;
    }
    $('recoveryMsg').textContent='Senha alterada com sucesso.';
    $('recoveryForm').reset();
    setTimeout(()=>{ $('recoveryPanel').classList.add('hidden'); $('loginPanel').classList.remove('hidden'); $('email').value=RESET_EMAIL; $('password').value=''; $('loginMsg').textContent='Senha redefinida. Entre com a nova senha.'; },700);
  }catch(err){$('recoveryMsg').textContent='Falha de comunicação ao redefinir senha.';}
});