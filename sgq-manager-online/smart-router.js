(() => {
  'use strict';

  const $id = id => document.getElementById(id);
  const text = v => String(v ?? '').trim();
  const nk = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const upper = v => text(v).toUpperCase();
  const safe = v => String(v ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const asDate = v => {
    if (!v) return '';
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0,10);
    if (typeof v === 'number' && window.XLSX) {
      const d = XLSX.SSF.parse_date_code(v);
      return d ? `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}` : '';
    }
    const s = text(v), br = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (br) return `${br[3]}-${br[2].padStart(2,'0')}-${br[1].padStart(2,'0')}`;
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0,10) : '';
  };
  const first = (row,names) => {
    const keys=Object.keys(row||{});
    for(const name of names){const hit=keys.find(k=>nk(k)===nk(name));if(hit&&text(row[hit])!=='')return row[hit];}
    return '';
  };
  const rowText = row => Object.entries(row||{}).map(([k,v])=>`${k} ${v}`).join(' ');

  const modules = ['DOCS','ACTIONS','AUDITS','KPIS','RISKS','NORMS'];
  const moduleRules = [
    {module:'ACTIONS',words:['rq045','planoacao','planodeacao','acao','acoes','action','5w2h','masp','8d','corretiva','preventiva','responsavel','prazo']},
    {module:'AUDITS',words:['auditoria','auditorias','audit','checklistauditoria','naoconformidadeauditoria','constatacao','auditor','escopo']},
    {module:'KPIS',words:['indicador','indicadores','kpi','meta','resultado','ppm','eficiencia','absenteismo','rotatividade','margem','realizado','unidade']},
    {module:'RISKS',words:['risco','riscos','oportunidade','oportunidades','fmea','probabilidade','impacto','npr','severidade','ocorrencia']},
    {module:'NORMS',words:['norma','normas','portaria','portarias','nbr','iso','inmetro','legislacao','regulamento','rgcp','emissor','vigencia']},
    {module:'DOCS',words:['documento','documentos','listamestra','procedimento','instrucao','registro','manual','politica','rq','pr','it','mq','dc','desenho','especificacao','revisao','aprovou']}
  ];

  function classify({fileName='',sheetName='',row=null,extractedText=''}){
    const file=nk(fileName), sheet=nk(sheetName), headers=nk(Object.keys(row||{}).join(' ')), body=nk(`${rowText(row)} ${extractedText.slice(0,6000)}`);
    const scored=moduleRules.map(rule=>{
      let score=0, hits=[];
      for(const w0 of rule.words){const w=nk(w0);let local=0;if(file.includes(w))local+=5;if(sheet.includes(w))local+=5;if(headers.includes(w))local+=4;if(body.includes(w))local+=1;if(local){score+=local;hits.push(w0);}}
      return {module:rule.module,score,hits};
    }).sort((a,b)=>b.score-a.score);
    const best=scored[0], second=scored[1]||{score:0};
    let confidence;
    if(!best.score) confidence=25;
    else confidence=Math.max(45,Math.min(99,48 + best.score*2.5 + Math.max(0,best.score-second.score)*2.2));
    if(best.score>=16 && best.score-second.score>=6) confidence=Math.max(confidence,88);
    const reason=best.hits.slice(0,5).join(', ') || 'sem evidência forte';
    return {module:best.module||'DOCS',confidence:Math.round(confidence),reason,scores:scored};
  }
  function detectModule(ctx){return classify(ctx).module;}

  function toAction(row,source){return{id:crypto.randomUUID(),title:text(first(row,['Descrição','Acao','Ação','Titulo','Título','Problema','Atividade']))||`Ação importada de ${source}`,owner:text(first(row,['Responsável','Responsavel','Owner','Quem']))||'Não identificado',due:asDate(first(row,['Prazo','Data prazo','Vencimento','Due Date','Data']))||new Date().toISOString().slice(0,10),status:text(first(row,['Status','Situação','Situacao']))||'Aberta',source_import:source,raw_import:row};}
  function toAudit(row,source){return{id:crypto.randomUUID(),title:text(first(row,['Auditoria','Título','Titulo','Descrição','Descricao']))||`Auditoria importada de ${source}`,date:asDate(first(row,['Data','Data auditoria','Audit Date']))||new Date().toISOString().slice(0,10),scope:text(first(row,['Escopo','Critério','Criterio','Processo','Área','Area']))||`Importado de ${source}`,source_import:source,raw_import:row};}
  function toKpi(row,source){return{id:crypto.randomUUID(),name:text(first(row,['Indicador','KPI','Nome','Descrição','Descricao']))||`Indicador importado de ${source}`,value:text(first(row,['Valor','Resultado','Realizado','Atual']))||'0',target:text(first(row,['Meta','Target','Objetivo']))||'',unit:text(first(row,['Unidade','Un','Unit']))||'',period:text(first(row,['Período','Periodo','Mês','Mes','Competência','Competencia']))||'',source_import:source,raw_import:row};}
  function toRisk(row,source){const p=Number(first(row,['Probabilidade','P','Ocorrência','Ocorrencia'])||1),i=Number(first(row,['Impacto','I','Severidade','S'])||1);return{id:crypto.randomUUID(),title:text(first(row,['Risco','Oportunidade','Descrição','Descricao','Evento']))||`Risco importado de ${source}`,p:Number.isFinite(p)?Math.max(1,Math.min(5,p)):1,i:Number.isFinite(i)?Math.max(1,Math.min(5,i)):1,source_import:source,raw_import:row};}
  function toNorm(row,source){const reference=text(first(row,['Referência','Referencia','Código','Codigo','Norma','Portaria','NBR','ISO']))||inferCode(source,rowText(row));return{normative_type:/PORTARIA/i.test(reference+' '+rowText(row))?'PORTARIA':'NORMA',issuer:text(first(row,['Emissor','Órgão','Orgao','Issuer']))||(/INMETRO/i.test(rowText(row))?'INMETRO':'Não identificado'),reference,title:text(first(row,['Título','Titulo','Descrição','Descricao','Assunto']))||source.replace(/\.[^.]+$/,''),source_url:text(first(row,['URL','Link','Fonte','Source URL']))||null,status:upper(first(row,['Status','Situação','Situacao']))||'VIGENTE',current_version:text(first(row,['Versão','Versao','Revisão','Revisao']))||null,publication_date:asDate(first(row,['Data publicação','Data publicacao','Publicação','Publicacao']))||null,effective_date:asDate(first(row,['Vigência','Vigencia','Data vigência','Data vigencia']))||null,next_review_date:asDate(first(row,['Próxima revisão','Proxima revisao','Vencimento']))||null,monitor_enabled:true,check_frequency:'DAILY',notes:`Importado automaticamente de ${source}`};}
  function preserveRawDoc(row,source,sheetName=''){const doc=mapRow(row,source);doc.custom_fields={...(doc.custom_fields||{}),origem_arquivo:source,aba_origem:sheetName||'',dados_originais:row};return doc;}
  function convert(module,row,source,sheetName=''){
    if(module==='ACTIONS')return toAction(row,source);if(module==='AUDITS')return toAudit(row,source);if(module==='KPIS')return toKpi(row,source);if(module==='RISKS')return toRisk(row,source);if(module==='NORMS')return toNorm(row,source);return preserveRawDoc(row,source,sheetName);
  }
  async function importNorm(item){const existing=(typeof normItems!=='undefined'?normItems:[]).find(n=>nk(n.reference)===nk(item.reference));if(existing)return invoke('sgq-normative-monitor',{action:'update',item:{id:existing.id,...item}});return invoke('sgq-normative-monitor',{action:'create',item});}

  async function registerBatch(batch){
    const counts={DOCS:0,ACTIONS:0,AUDITS:0,KPIS:0,RISKS:0,NORMS:0,fail:0};const docMap=new Map();
    for(const rec of batch){try{if(rec.module==='DOCS'){const k=codeKey(rec.item.code);if(k)docMap.set(k,rec.item);else throw new Error('Documento sem código reconhecível');continue;}if(rec.module==='ACTIONS'){db.actions.unshift(rec.item);counts.ACTIONS++;continue;}if(rec.module==='AUDITS'){db.audits.unshift(rec.item);counts.AUDITS++;continue;}if(rec.module==='KPIS'){db.kpis.unshift(rec.item);counts.KPIS++;continue;}if(rec.module==='RISKS'){db.risks.unshift(rec.item);counts.RISKS++;continue;}if(rec.module==='NORMS'){await importNorm(rec.item);counts.NORMS++;continue;}}catch(e){counts.fail++;console.error('smart-router',rec,e);}}
    for(const item of docMap.values()){try{await invoke('sgq-document-admin',{action:'upsert',item});counts.DOCS++;}catch(e){counts.fail++;console.error('smart-router-doc',item,e);}}
    save();await Promise.all([loadDocs(),loadNorms()]);localAutomation();event('IMPORTAÇÃO INTELIGENTE',`DOCS ${counts.DOCS} · AÇÕES ${counts.ACTIONS} · AUDITORIAS ${counts.AUDITS} · KPIs ${counts.KPIS} · RISCOS ${counts.RISKS} · NORMAS ${counts.NORMS} · FALHAS ${counts.fail}`);if(typeof window.renderExecutiveDashboard==='function')window.renderExecutiveDashboard();return counts;
  }

  function recordFrom(row,fileName,sheetName,classification){return{module:classification.module,confidence:classification.confidence,reason:classification.reason,item:convert(classification.module,row,fileName,sheetName),rawRow:row,source:fileName,sheetName};}
  async function parseStructured(file){
    const n=file.name.toLowerCase(),out=[];
    if(/\.(xlsx|xls)$/.test(n)){const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});for(const sheetName of wb.SheetNames){const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{defval:''});for(const row of rows.filter(r=>Object.values(r).some(v=>text(v)!==''))){const c=classify({fileName:file.name,sheetName,row});out.push(recordFrom(row,file.name,sheetName,c));}}return out;}
    if(n.endsWith('.csv')){const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});return rows.filter(r=>Object.values(r).some(v=>text(v)!=='')).map(row=>recordFrom(row,file.name,'CSV',classify({fileName:file.name,sheetName:'CSV',row})));}
    if(n.endsWith('.json')){const raw=JSON.parse(await file.text()),arr=Array.isArray(raw)?raw:(raw.documents||raw.items||raw.actions||raw.audits||raw.kpis||raw.risks||[raw]);return arr.map(row=>recordFrom(row,file.name,'JSON',classify({fileName:file.name,sheetName:'JSON',row})));}
    return null;
  }
  async function parseUnstructured(file){
    let extracted='';const n=file.name.toLowerCase();if(n.endsWith('.pdf'))extracted=await extractPdf(file);else if(n.endsWith('.docx'))extracted=await extractDocx(file);else extracted=await file.text();
    const c=classify({fileName:file.name,sheetName:'CONTEÚDO',extractedText:extracted});const row={Título:file.name.replace(/\.[^.]+$/,''),Descrição:extracted.slice(0,6000),Conteúdo:extracted.slice(0,12000)};let rec=recordFrom(row,file.name,'CONTEÚDO',c);
    if(c.module==='DOCS'){rec.item.code=inferCode(file.name,extracted);rec.item.revision=inferRev(file.name,extracted);rec.item.document_type=inferType(file.name,extracted);rec.item.notes=extracted.slice(0,6000);rec.item.custom_fields={...(rec.item.custom_fields||{}),origem_arquivo:file.name,modulo_detectado:c.module,confianca_classificacao:c.confidence,texto_extraido:extracted.slice(0,12000)};}
    return [rec];
  }

  function labelModule(m){return({DOCS:'Documentos e registros',ACTIONS:'RQ 045 / Ações',AUDITS:'Auditorias',KPIS:'Indicadores',RISKS:'Riscos e oportunidades',NORMS:'Normas e Portarias'})[m]||m;}
  function rebuildItem(rec,newModule){rec.module=newModule;rec.item=convert(newModule,rec.rawRow||{},rec.source,rec.sheetName);return rec;}
  function renderReview(queue){
    const host=$id('importPreview');if(!host)return;
    host.innerHTML=`<div class="item"><b>Revisão humana necessária</b><br><small>${queue.length} registro(s) com confiança inferior a 75%. Confirme ou corrija o módulo antes da gravação.</small></div>`+queue.map((r,i)=>`<div class="item"><b>${safe(r.source)}${r.sheetName?` · ${safe(r.sheetName)}`:''}</b> <span class="tag ${r.confidence<55?'dangerText':'warn'}">Confiança ${r.confidence}%</span><br><small>Evidências: ${safe(r.reason)}</small><div class="field"><label>Módulo de destino</label><select data-review-index="${i}">${modules.map(m=>`<option value="${m}" ${m===r.module?'selected':''}>${safe(labelModule(m))}</option>`).join('')}</select></div></div>`).join('')+`<div class="toolbar"><button id="confirmSmartImport" class="btn" type="button">Confirmar e registrar</button><button id="cancelSmartImport" class="btn alt" type="button">Cancelar importação</button></div>`;
  }
  function finalMessage(c){return`Documentos: ${c.DOCS}\nAções: ${c.ACTIONS}\nAuditorias: ${c.AUDITS}\nIndicadores: ${c.KPIS}\nRiscos: ${c.RISKS}\nNormas/Portarias: ${c.NORMS}\nFalhas: ${c.fail}`;}

  async function smartRouteHandler(e){
    const files=[...(e.target.files||[])];if(!files.length)return;if(!['MASTER','SGQ'].includes(currentRole)){alert('Somente MASTER ou SGQ podem importar e classificar registros.');e.target.value='';return;}
    try{$id('importStatus').textContent=`Reconhecendo ${files.length} arquivo(s), módulo e nível de confiança...`;$id('importPreview').innerHTML='';let batch=[];for(let i=0;i<files.length;i++){const file=files[i],parsed=(await parseStructured(file))||(await parseUnstructured(file));batch.push(...parsed);$id('importProgress').style.width=`${Math.round(((i+1)/files.length)*45)}%`;}
      const low=batch.filter(r=>r.confidence<75),high=batch.filter(r=>r.confidence>=75);const summary=batch.reduce((a,r)=>{a[r.module]=(a[r.module]||0)+1;return a;},{});
      if(!low.length){$id('importPreview').innerHTML=Object.entries(summary).map(([m,c])=>item(labelModule(m),`${c} registro(s) · classificação automática com confiança suficiente`,'AUTO')).join('')+batch.slice(0,12).map(r=>item(`${labelModule(r.module)} · ${r.item.code||r.item.title||r.item.name||r.item.reference||'Registro'}`,`${r.source} · Confiança ${r.confidence}%`)).join('');$id('importStatus').textContent='Classificação concluída com confiança suficiente. Registrando nos módulos correspondentes...';const c=await registerBatch(batch);$id('importProgress').style.width='100%';$id('importStatus').innerHTML=`<span class="ok">Importação inteligente concluída:</span> ${finalMessage(c).replaceAll('\n',' · ')}`;alert(`Arquivo reconhecido e distribuído automaticamente.\n\n${finalMessage(c)}`);return;}
      $id('importProgress').style.width='55%';$id('importStatus').innerHTML=`<span class="warn">Classificação parcial:</span> ${high.length} registro(s) com alta confiança e ${low.length} aguardando revisão humana. Nada foi gravado ainda.`;renderReview(low);
      await new Promise((resolve,reject)=>{const ok=$id('confirmSmartImport'),cancel=$id('cancelSmartImport');ok.onclick=()=>{low.forEach((r,i)=>{const sel=document.querySelector(`[data-review-index="${i}"]`);if(sel&&sel.value!==r.module)rebuildItem(r,sel.value);r.confidence_reviewed=true;});resolve();};cancel.onclick=()=>reject(new Error('Importação cancelada pelo usuário antes da gravação.'));});
      const c=await registerBatch([...high,...low]);$id('importProgress').style.width='100%';$id('importStatus').innerHTML=`<span class="ok">Importação concluída após revisão humana:</span> ${finalMessage(c).replaceAll('\n',' · ')}`;event('REVISÃO HUMANA DE IMPORTAÇÃO',`${low.length} classificação(ões) revisada(s) antes da gravação`);alert(`Importação confirmada e distribuída por módulo.\n\n${finalMessage(c)}`);
    }catch(err){$id('importStatus').innerHTML=`<span class="dangerText">${safe(err.message)}</span>`;}finally{e.target.value='';}
  }

  function install(){const input=$id('smartImportFile');if(!input)return setTimeout(install,300);input.onchange=smartRouteHandler;const box=input.closest('.importBox');if(box&&!box.querySelector('.smart-router-note')){const p=document.createElement('p');p.className='smart-router-note ok';p.textContent='Classificação automática ativa com nível de confiança. Casos abaixo de 75% exigem revisão humana antes da gravação.';box.insertBefore(p,box.children[2]||null);}}

  window.SGQSmartRouter={detectModule,classify,registerBatch,smartRouteHandler};
  install();
})();