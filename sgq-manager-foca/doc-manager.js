(()=>{
  const q=(s,r=document)=>r.querySelector(s), escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let filterMode='all', editingId=null;
  const filterMap={m05:'all',m27:'MANUAL',m28:'PR',m29:'IT_DC',m30:'REGISTROS',m31:'OBSOLETE'};
  const types=[['MANUAL','Manual'],['PR','Procedimento'],['IT','Instrução de Trabalho'],['DC','Documento Complementar'],['RQ','Registro / RQ'],['REGISTRO','Registro'],['TECNICO','Informação Técnica'],['OUTRO','Outro']];

  function panel(){
    if(q('#docManagerPanel'))return;
    const app=q('#appPanel'); if(!app)return;
    const sec=document.createElement('section'); sec.id='docManagerPanel'; sec.className='section'; sec.style.display='none';
    sec.innerHTML=`<div class="box"><div class="module-head"><div><span class="tag ok">GESTÃO DOCUMENTAL</span><h2>Lista Mestra de Documentos</h2><p class="muted">Cadastro, upload, revisão, vigência, obsolescência e histórico por tenant.</p></div><button id="docNewBtn" type="button" class="btn">Novo documento</button></div>
      <div class="grid two"><div class="form"><h3 id="docFormTitle">Cadastrar documento</h3><form id="docForm"><input id="docId" type="hidden"><div class="row"><div class="field"><label>Código</label><input id="docCode" required placeholder="Ex.: PR 01"></div><div class="field"><label>Revisão</label><input id="docRevision" value="00" required></div></div><div class="field"><label>Título</label><input id="docTitleInput" required></div><div class="row"><div class="field"><label>Tipo</label><select id="docType">${types.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div><div class="field"><label>Status</label><select id="docStatus"><option>DRAFT</option><option>IN_REVIEW</option><option>ACTIVE</option><option>OBSOLETE</option></select></div></div><div class="row"><div class="field"><label>Data de vigência</label><input id="docEffective" type="date"></div><div class="field"><label>Próxima revisão</label><input id="docNextReview" type="date"></div></div><div class="field"><label>Arquivo</label><input id="docFile" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.xlsm,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp"></div><div class="field"><label>Resumo da alteração / observação</label><textarea id="docChange" placeholder="Descreva a criação ou alteração desta revisão."></textarea></div><div class="right"><button class="btn" type="submit">Salvar documento</button><button id="docCancel" class="btn alt" type="button">Cancelar</button></div><div id="docMsg" class="msg"></div></form></div>
      <div class="list"><h3>Filtros</h3><div class="row"><div class="field"><label>Tipo</label><select id="docFilterType"><option value="all">Todos</option>${types.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}<option value="IT_DC">IT + DC</option><option value="REGISTROS">RQ + Registros</option><option value="OBSOLETE">Obsoletos</option></select></div><div class="field"><label>Busca</label><input id="docSearch" placeholder="Código ou título"></div></div><p class="muted">Documentos obsoletos permanecem preservados para rastreabilidade. O SGQ não utiliza exclusão física como rotina.</p></div></div>
      <div class="section"><div id="docList" class="list"><div class="empty">Carregando documentos...</div></div></div></div>`;
    app.prepend(sec);
    q('#docForm').addEventListener('submit',saveDoc); q('#docNewBtn').onclick=()=>resetForm(); q('#docCancel').onclick=()=>resetForm();
    q('#docFilterType').onchange=e=>{filterMode=e.target.value;loadDocs()}; q('#docSearch').oninput=()=>loadDocs();
  }

  function resetForm(){editingId=null;const f=q('#docForm');if(f)f.reset();q('#docRevision').value='00';q('#docStatus').value='DRAFT';q('#docFormTitle').textContent='Cadastrar documento';q('#docMsg').textContent='';}
  const safe=s=>String(s||'').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'');
  async function upload(file,type,code,revision){
    if(!file)return null;if(!ctx)throw Error('Sessão não autenticada.');
    const path=`${ctx.m.tenant_id}/${safe(type)}/${safe(code)}/R${safe(revision)}/${Date.now()}_${safe(file.name)}`;
    const {error}=await sb.storage.from('sgq-documents').upload(path,file,{upsert:false,contentType:file.type||undefined});if(error)throw error;
    return {bucket:'sgq-documents',path,name:file.name,mime:file.type||'',size:file.size};
  }
  async function saveDoc(e){e.preventDefault();if(!ctx)return;const msg=q('#docMsg');msg.textContent='Salvando...';try{
    const code=q('#docCode').value.trim(),title=q('#docTitleInput').value.trim(),type=q('#docType').value,revision=q('#docRevision').value.trim()||'00',status=q('#docStatus').value,file=q('#docFile').files[0]||null;
    let currentFile=null;if(file)currentFile=await upload(file,type,code,revision);
    const base={tenant_id:ctx.m.tenant_id,company_id:ctx.m.company_id||null,code,title,document_type:type,revision,status,effective_date:q('#docEffective').value||null,next_review_date:q('#docNextReview').value||null,updated_by:ctx.user.id};
    let docId=editingId;
    if(editingId){const upd={...base};if(currentFile)upd.current_file=currentFile;const {error}=await sb.from('sgq_documents').update(upd).eq('id',editingId);if(error)throw error;}
    else{const ins={...base,current_file:currentFile||{},owner_user_id:ctx.user.id,created_by:ctx.user.id};const {data,error}=await sb.from('sgq_documents').insert(ins).select('id').single();if(error)throw error;docId=data.id;}
    if(currentFile){const {error}=await sb.from('sgq_document_revisions').insert({tenant_id:ctx.m.tenant_id,document_id:docId,revision,change_summary:q('#docChange').value.trim()||null,approval_status:status==='ACTIVE'?'APPROVED':'PENDING',approver_user_id:status==='ACTIVE'?ctx.user.id:null,approved_at:status==='ACTIVE'?new Date().toISOString():null,file:currentFile,created_by:ctx.user.id});if(error)throw error;}
    msg.textContent='Documento salvo com rastreabilidade.';resetForm();await loadDocs();if(typeof load==='function')await load();
  }catch(err){msg.textContent='Não salvo: '+err.message}}

  async function signed(file){if(!file?.path)return null;const {data,error}=await sb.storage.from(file.bucket||'sgq-documents').createSignedUrl(file.path,3600);if(error)throw error;return data.signedUrl}
  window.sgqDocOpen=async(id,mode='panel')=>{try{const {data,error}=await sb.from('sgq_documents').select('title,current_file').eq('id',id).single();if(error)throw error;const url=await signed(data.current_file);if(!url)throw Error('Arquivo não vinculado.');window.sgqOpenDocument(url,data.title,mode)}catch(e){alert(e.message)}};
  window.sgqDocEdit=async id=>{const {data,error}=await sb.from('sgq_documents').select('*').eq('id',id).single();if(error)return alert(error.message);editingId=id;q('#docId').value=id;q('#docCode').value=data.code;q('#docTitleInput').value=data.title;q('#docType').value=data.document_type;q('#docRevision').value=data.revision;q('#docStatus').value=data.status;q('#docEffective').value=data.effective_date||'';q('#docNextReview').value=data.next_review_date||'';q('#docFormTitle').textContent='Editar / criar nova revisão';q('#docMsg').textContent='Ao selecionar novo arquivo, a revisão será preservada no histórico.';q('#docManagerPanel').scrollIntoView({behavior:'smooth',block:'start'});};
  window.sgqDocObsolete=async id=>{if(!confirm('Marcar este documento como OBSOLETO? O histórico será preservado.'))return;const {error}=await sb.from('sgq_documents').update({status:'OBSOLETE',updated_by:ctx.user.id,updated_at:new Date().toISOString()}).eq('id',id);if(error)return alert(error.message);await loadDocs();};
  window.sgqDocHistory=async id=>{const {data,error}=await sb.from('sgq_document_revisions').select('revision,change_summary,approval_status,approved_at,created_at,file').eq('document_id',id).order('created_at',{ascending:false});if(error)return alert(error.message);const lines=(data||[]).map(r=>`R${r.revision} · ${r.approval_status} · ${new Date(r.created_at).toLocaleDateString('pt-BR')} · ${r.change_summary||'sem resumo'}`).join('\n');alert(lines||'Sem revisões registradas.');};

  async function loadDocs(){if(!ctx||!q('#docList'))return;let qry=sb.from('sgq_documents').select('id,code,title,document_type,revision,status,effective_date,next_review_date,current_file,updated_at').eq('tenant_id',ctx.m.tenant_id).order('code');
    const fm=filterMode;if(fm==='MANUAL')qry=qry.eq('document_type','MANUAL');else if(fm==='PR')qry=qry.eq('document_type','PR');else if(fm==='IT_DC')qry=qry.in('document_type',['IT','DC']);else if(fm==='REGISTROS')qry=qry.in('document_type',['RQ','REGISTRO']);else if(fm==='OBSOLETE')qry=qry.eq('status','OBSOLETE');else if(fm!=='all')qry=qry.eq('document_type',fm);
    const {data,error}=await qry;if(error){q('#docList').innerHTML=`<div class="empty">${escHtml(error.message)}</div>`;return}const term=(q('#docSearch')?.value||'').trim().toLowerCase();const rows=(data||[]).filter(d=>!term||`${d.code} ${d.title}`.toLowerCase().includes(term));
    q('#docList').innerHTML=rows.length?rows.map(d=>`<div class="item"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><b>${escHtml(d.code)} — ${escHtml(d.title)}</b><span class="meta">${escHtml(d.document_type)} · Rev. ${escHtml(d.revision)} · ${escHtml(d.status)} · próxima revisão ${d.next_review_date?new Date(d.next_review_date+'T12:00:00').toLocaleDateString('pt-BR'):'—'}</span></div><span class="tag ${d.status==='ACTIVE'?'ok':d.status==='OBSOLETE'?'warn':''}">${escHtml(d.status)}</span></div><div class="right" style="margin-top:8px">${d.current_file?.path?`<button class="btn alt" onclick="sgqDocOpen('${d.id}','panel')">Visualizar aqui</button><button class="btn alt" onclick="sgqDocOpen('${d.id}','tab')">Nova aba</button>`:''}<button class="btn alt" onclick="sgqDocHistory('${d.id}')">Histórico</button>${isAdmin()?`<button class="btn alt" onclick="sgqDocEdit('${d.id}')">Editar/Revisar</button>${d.status!=='OBSOLETE'?`<button class="btn alt" onclick="sgqDocObsolete('${d.id}')">Obsoletar</button>`:''}`:''}</div></div>`).join(''):'<div class="empty">Nenhum documento encontrado neste filtro.</div>';
  }

  window.sgqDocsSetModule=id=>{filterMode=filterMap[id]||'all';if(q('#docFilterType'))q('#docFilterType').value=filterMode;loadDocs();};
  window.sgqDocsRefresh=loadDocs;
  panel();
})();