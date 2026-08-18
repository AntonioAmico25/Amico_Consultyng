// SGQ Manager FOCA — patch R6
// Corrige status de membership em minúsculas e adiciona visualização de senha.

context = async function(u){
  const {data:m,error}=await sb.from('user_memberships')
    .select('tenant_id,company_id,role_id,status,is_default')
    .eq('user_id',u.id)
    .in('status',['active','ACTIVE','ATIVO','ativo'])
    .order('is_default',{ascending:false})
    .limit(1)
    .maybeSingle();
  if(error||!m) throw Error('Usuário autenticado, mas sem vínculo ativo com o tenant.');
  const [{data:r},{data:t},{data:c}]=await Promise.all([
    sb.from('roles').select('code,name').eq('id',m.role_id).maybeSingle(),
    sb.from('tenants').select('code,name').eq('id',m.tenant_id).maybeSingle(),
    m.company_id?sb.from('companies').select('code,trade_name,legal_name').eq('id',m.company_id).maybeSingle():Promise.resolve({data:null})
  ]);
  return {user:u,m,r,t,c};
};

function addPasswordToggle(inputId,labelText='Mostrar senha'){
  const input=document.getElementById(inputId);
  if(!input||document.getElementById(inputId+'Toggle')) return;
  const row=document.createElement('label');
  row.style.display='inline-flex';
  row.style.alignItems='center';
  row.style.gap='8px';
  row.style.marginTop='8px';
  row.style.cursor='pointer';
  row.innerHTML=`<input id="${inputId}Toggle" type="checkbox"> <span>${labelText}</span>`;
  input.parentElement.appendChild(row);
  row.querySelector('input').addEventListener('change',e=>{
    input.type=e.target.checked?'text':'password';
  });
}

addPasswordToggle('password');
addPasswordToggle('newPassword','Mostrar nova senha');
addPasswordToggle('newPassword2','Mostrar confirmação');

// Se o usuário já autenticou antes da correção, tenta carregar novamente o contexto.
(async()=>{
  const {data:{session}}=await sb.auth.getSession();
  if(session){
    try{await enter(session);}catch(e){
      if(document.getElementById('loginMsg')) document.getElementById('loginMsg').textContent=e.message;
    }
  }
})();
