(()=>{
  'use strict';
  window.AGENDA_MANAGER_R09=true;
  const qs=(s,r=document)=>r.querySelector(s);
  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const fmt=d=>d?new Date(d).toLocaleString('pt-BR'):'—';
  let users=[],roles=[];

  function style(){
    if(qs('#agm-r09-style'))return;
    const st=document.createElement('style');st.id='agm-r09-style';st.textContent=`
    .agm-user-grid{display:grid;grid-template-columns:1.2fr 1.4fr 1.1fr .8fr auto;gap:8px;align-items:end}.agm-user-table{width:100%;border-collapse:collapse}.agm-user-table th,.agm-user-table td{padding:9px;border-bottom:1px solid var(--ln);text-align:left;vertical-align:top}.agm-user-actions{display:flex;gap:6px;flex-wrap:wrap}.agm-small{font-size:12px}.agm-pass-wrap{display:flex;gap:6px}.agm-pass-wrap input{min-width:0}.agm-security-note{padding:10px;border:1px solid var(--ln);border-radius:10px;background:var(--p2);margin:10px 0}.agm-force{position:fixed;inset:0;z-index:80;background:#071019ee;display:grid;place-items:center;padding:18px}.agm-force.hidden{display:none}.agm-force-box{width:min(460px,100%);background:#121821;color:#f4f7fb;border:1px solid #273242;border-radius:18px;padding:22px}.agm-force-box .row{display:grid;gap:10px;margin-top:14px}@media(max-width:900px){.agm-user-grid{grid-template-columns:1fr 1fr}.agm-user-table{display:block;overflow:auto;white-space:nowrap}}@media(max-width:560px){.agm-user-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(st);
  }

  async function invoke(body){
    const {data,error}=await sb.functions.invoke('agenda-user-admin',{body});
    if(error)throw new Error(data?.error||error.message||'Falha na administração de usuários');
    if(data?.error)throw new Error(data.error);
    return data;
  }

  function adminRoot(){
    const page=qs('#admin');if(!page)return null;
    let root=qs('#agmUserAdmin',page);
    if(root)return root;
    root=document.createElement('div');root.id='agmUserAdmin';root.className='card section';
    root.innerHTML=`<h3>Administração de Usuários Online</h3><div class="agm-security-note"><b>Segurança:</b> a senha atual nunca é exibida. O MASTER pode criar uma senha inicial ou substituir por uma nova senha temporária. O usuário será obrigado a alterá-la no próximo acesso.</div><div id="agmUserAdminBody" class="muted">Carregando permissões…</div>`;
    page.appendChild(root);return root;
  }

  function tempPassword(){
    const a='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';let out='';
    const arr=new Uint32Array(14);crypto.getRandomValues(arr);for(const n of arr)out+=a[n%a.length];return out;
  }

  function render(){
    const body=qs('#agmUserAdminBody');if(!body)return;
    const roleOpts=roles.map(r=>`<option value="${esc(r.code)}">${esc(r.code)}</option>`).join('');
    body.className='';
    body.innerHTML=`
      <div class="agm-user-grid">
        <div class="field"><label>Nome</label><input id="agmNewName" placeholder="Nome do usuário"></div>
        <div class="field"><label>E-mail</label><input id="agmNewEmail" type="email" placeholder="usuario@empresa.com"></div>
        <div class="field"><label>Senha inicial</label><div class="agm-pass-wrap"><input id="agmNewPass" type="password" autocomplete="new-password" placeholder="mín. 8 caracteres"><button class="btn" id="agmShowPass" type="button">👁</button><button class="btn" id="agmGenPass" type="button">Gerar</button></div></div>
        <div class="field"><label>Perfil</label><select id="agmNewRole">${roleOpts}</select></div>
        <button class="btn primary" id="agmCreateUser" type="button">+ Criar usuário</button>
      </div>
      <div id="agmAdminMsg" class="muted section"></div>
      <div class="section" style="overflow:auto"><table class="agm-user-table"><thead><tr><th>Usuário</th><th>Perfil</th><th>Status</th><th>Último acesso</th><th>Credencial</th><th>Ações</th></tr></thead><tbody>${users.map(row=>{
        const opts=roles.map(r=>`<option value="${esc(r.code)}" ${r.code===row.role?'selected':''}>${esc(r.code)}</option>`).join('');
        return `<tr data-uid="${esc(row.id)}"><td><b>${esc(row.full_name||row.email)}</b><div class="muted agm-small">${esc(row.email)}</div>${row.is_self?'<span class="pill">Você</span>':''}</td><td><select class="agmRole" ${row.is_self?'disabled':''}>${opts}</select></td><td><span class="pill">${esc(row.status)}</span></td><td class="agm-small">${fmt(row.last_sign_in_at)}</td><td class="agm-small">${row.must_change_password?'⚠ Troca obrigatória':'✅ Regular'}<div class="muted">Alterada: ${fmt(row.password_changed_at)}</div></td><td><div class="agm-user-actions"><button class="btn agmResetPass" type="button">Nova senha</button><button class="btn agmForcePass" type="button">Exigir troca</button><button class="btn ${row.status==='active'?'danger':''} agmStatus" type="button" ${row.is_self?'disabled':''}>${row.status==='active'?'Bloquear':'Desbloquear'}</button></div></td></tr>`
      }).join('')}</tbody></table></div>`;

    qs('#agmShowPass')?.addEventListener('click',()=>{const p=qs('#agmNewPass');p.type=p.type==='password'?'text':'password'});
    qs('#agmGenPass')?.addEventListener('click',()=>{const p=qs('#agmNewPass');p.value=tempPassword();p.type='text';p.focus()});
    qs('#agmCreateUser')?.addEventListener('click',createUser);
    body.querySelectorAll('tr[data-uid]').forEach(tr=>{
      const uid=tr.dataset.uid;const row=users.find(x=>x.id===uid);
      qs('.agmRole',tr)?.addEventListener('change',e=>changeRole(uid,e.target.value));
      qs('.agmResetPass',tr)?.addEventListener('click',()=>resetPass(uid,row?.email||''));
      qs('.agmForcePass',tr)?.addEventListener('click',()=>forcePass(uid));
      qs('.agmStatus',tr)?.addEventListener('click',()=>setStatus(uid,row?.status!=='active'));
    });
  }

  function msg(t,bad=false){const el=qs('#agmAdminMsg');if(el){el.textContent=t;el.style.color=bad?'#ffb4b4':''}}
  async function load(){
    adminRoot();
    if(!window.sb||!window.tenant){const el=qs('#agmUserAdminBody');if(el)el.textContent='Entre no sistema para administrar usuários.';return}
    try{const r=await invoke({action:'list',tenant_id:tenant});users=r.users||[];roles=(r.roles||[]).filter(r=>['MASTER','GESTOR','SGQ','CONSULTA'].includes(r.code));render()}catch(e){const el=qs('#agmUserAdminBody');if(el)el.innerHTML=`<div class="muted">Administração restrita ao perfil MASTER deste ambiente.<br><span class="agm-small">${esc(e.message)}</span></div>`}
  }

  async function createUser(){
    const full_name=qs('#agmNewName').value.trim(),email=qs('#agmNewEmail').value.trim(),password=qs('#agmNewPass').value,role=qs('#agmNewRole').value;
    if(!email||password.length<8)return msg('Informe e-mail e senha inicial com pelo menos 8 caracteres.',true);
    try{msg('Criando usuário…');await invoke({action:'create',tenant_id:tenant,full_name,email,password,role});qs('#agmNewName').value='';qs('#agmNewEmail').value='';qs('#agmNewPass').value='';msg('Usuário criado. A troca da senha inicial será exigida no próximo acesso.');await load()}catch(e){msg(e.message,true)}
  }
  async function changeRole(uid,role){try{msg('Atualizando perfil…');await invoke({action:'set_role',tenant_id:tenant,user_id:uid,role});msg('Perfil atualizado.');await load()}catch(e){msg(e.message,true);await load()}}
  async function resetPass(uid,email){const suggested=tempPassword();const p=prompt(`Nova senha temporária para ${email}\n\nSugestão gerada:\n${suggested}\n\nCole a sugestão ou informe outra senha (mín. 8 caracteres):`,suggested);if(p===null)return;if(p.length<8)return alert('A senha deve ter pelo menos 8 caracteres.');try{msg('Substituindo senha…');await invoke({action:'set_password',tenant_id:tenant,user_id:uid,password:p});alert('Senha substituída. O usuário deverá alterá-la no próximo acesso.');await load()}catch(e){alert(e.message)}}
  async function forcePass(uid){if(!confirm('Exigir troca de senha no próximo acesso?'))return;try{await invoke({action:'force_password_change',tenant_id:tenant,user_id:uid});await load()}catch(e){alert(e.message)}}
  async function setStatus(uid,active){if(!confirm(active?'Desbloquear este acesso?':'Bloquear este usuário neste ambiente?'))return;try{await invoke({action:'set_status',tenant_id:tenant,user_id:uid,active});await load()}catch(e){alert(e.message)}}

  function forceModal(){
    if(qs('#agmForcePassword'))return;
    const d=document.createElement('div');d.id='agmForcePassword';d.className='agm-force hidden';d.innerHTML=`<div class="agm-force-box"><h2>Troca de senha obrigatória</h2><p>Por segurança, defina uma nova senha pessoal antes de continuar.</p><div class="row"><input id="agmOwnPass1" type="password" autocomplete="new-password" placeholder="Nova senha (mín. 8 caracteres)"><input id="agmOwnPass2" type="password" autocomplete="new-password" placeholder="Repita a nova senha"><button class="btn primary" id="agmOwnPassSave" type="button">Salvar nova senha</button><div id="agmOwnPassMsg" class="muted"></div></div></div>`;document.body.appendChild(d);
    qs('#agmOwnPassSave').addEventListener('click',async()=>{const a=qs('#agmOwnPass1').value,b=qs('#agmOwnPass2').value,m=qs('#agmOwnPassMsg');if(a.length<8){m.textContent='Use pelo menos 8 caracteres.';return}if(a!==b){m.textContent='As senhas não conferem.';return}m.textContent='Atualizando…';try{await invoke({action:'self_change_password',password:a});m.textContent='Senha alterada com sucesso.';setTimeout(()=>d.classList.add('hidden'),600)}catch(e){m.textContent=e.message}});
  }
  async function checkForce(){
    if(!window.sb)return;forceModal();
    const {data:{session:s}}=await sb.auth.getSession();if(!s)return;
    const {data,error}=await sb.from('agenda_user_security').select('must_change_password').eq('user_id',s.user.id).maybeSingle();
    if(!error&&data?.must_change_password)qs('#agmForcePassword')?.classList.remove('hidden');
  }

  style();forceModal();
  const boot=()=>{adminRoot();setTimeout(load,300);setTimeout(checkForce,500);const sub=qs('.side .sub');if(sub)sub.textContent='AMICO CONSULTYNG · v0.5 R09';};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  sb?.auth?.onAuthStateChange?.((event)=>{if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'){setTimeout(load,250);setTimeout(checkForce,350)}});
})();