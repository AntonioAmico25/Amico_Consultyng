(() => {
  'use strict';

  const $id = id => document.getElementById(id);
  const text = v => String(v ?? '').trim();
  const nk = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const upper = v => text(v).toUpperCase();
  const asDate = v => {
    if (!v) return '';
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0,10);
    if (typeof v === 'number' && window.XLSX) {
      const d = XLSX.SSF.parse_date_code(v);
      return d ? `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}` : '';
    }
    const s = text(v);
    const br = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (br) return `${br[3]}-${br[2].padStart(2,'0')}-${br[1].padStart(2,'0')}`;
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0,10) : '';
  };
  const first = (row, names) => {
    const keys = Object.keys(row || {});
    for (const name of names) {
      const hit = keys.find(k => nk(k) === nk(name));
      if (hit && text(row[hit]) !== '') return row[hit];
    }
    return '';
  };
  const rowText = row => Object.entries(row || {}).map(([k,v]) => `${k} ${v}`).join(' ');

  const moduleRules = [
    {module:'ACTIONS', words:['rq045','planoacao','planodeacao','acao','acoes','action','5w2h','masp','8d','corretiva','preventiva']},
    {module:'AUDITS', words:['auditoria','auditorias','audit','checklistauditoria','naoconformidadeauditoria','constatacao']},
    {module:'KPIS', words:['indicador','indicadores','kpi','meta','resultado','ppm','eficiencia','absenteismo','rotatividade','margem']},
    {module:'RISKS', words:['risco','riscos','oportunidade','oportunidades','fmea','probabilidade','impacto','npr','severidade']},
    {module:'NORMS', words:['norma','normas','portaria','portarias','nbr','iso','inmetro','legislacao','regulamento','rgcp']},
    {module:'DOCS', words:['documento','documentos','listamestra','procedimento','instrucao','registro','manual','politica','rq','pr','it','mq','dc','desenho','especificacao']}
  ];

  function detectModule({fileName='', sheetName='', row=null, extractedText=''}) {
    const scope = nk(`${fileName} ${sheetName} ${rowText(row)} ${extractedText.slice(0,2500)}`);
    let best = {module:'DOCS', score:0};
    for (const rule of moduleRules) {
      let score = 0;
      for (const w of rule.words) if (scope.includes(nk(w))) score++;
      if (score > best.score) best = {module:rule.module, score};
    }
    return best.module;
  }

  function toAction(row, source) {
    return {
      id: crypto.randomUUID(),
      title: text(first(row,['Descrição','Acao','Ação','Titulo','Título','Problema','Atividade'])) || `Ação importada de ${source}`,
      owner: text(first(row,['Responsável','Responsavel','Owner','Quem'])) || 'Não identificado',
      due: asDate(first(row,['Prazo','Data prazo','Vencimento','Due Date','Data'])) || new Date().toISOString().slice(0,10),
      status: text(first(row,['Status','Situação','Situacao'])) || 'Aberta',
      source_import: source,
      raw_import: row
    };
  }

  function toAudit(row, source) {
    return {
      id: crypto.randomUUID(),
      title: text(first(row,['Auditoria','Título','Titulo','Descrição','Descricao'])) || `Auditoria importada de ${source}`,
      date: asDate(first(row,['Data','Data auditoria','Audit Date'])) || new Date().toISOString().slice(0,10),
      scope: text(first(row,['Escopo','Critério','Criterio','Processo','Área','Area'])) || `Importado de ${source}`,
      source_import: source,
      raw_import: row
    };
  }

  function toKpi(row, source) {
    return {
      id: crypto.randomUUID(),
      name: text(first(row,['Indicador','KPI','Nome','Descrição','Descricao'])) || `Indicador importado de ${source}`,
      value: text(first(row,['Valor','Resultado','Realizado','Atual'])) || '0',
      target: text(first(row,['Meta','Target','Objetivo'])) || '',
      unit: text(first(row,['Unidade','Un','Unit'])) || '',
      period: text(first(row,['Período','Periodo','Mês','Mes','Competência','Competencia'])) || '',
      source_import: source,
      raw_import: row
    };
  }

  function toRisk(row, source) {
    const p = Number(first(row,['Probabilidade','P','Ocorrência','Ocorrencia']) || 1);
    const i = Number(first(row,['Impacto','I','Severidade','S']) || 1);
    return {
      id: crypto.randomUUID(),
      title: text(first(row,['Risco','Oportunidade','Descrição','Descricao','Evento'])) || `Risco importado de ${source}`,
      p: Number.isFinite(p) ? Math.max(1,Math.min(5,p)) : 1,
      i: Number.isFinite(i) ? Math.max(1,Math.min(5,i)) : 1,
      source_import: source,
      raw_import: row
    };
  }

  function toNorm(row, source) {
    const reference = text(first(row,['Referência','Referencia','Código','Codigo','Norma','Portaria','NBR','ISO'])) || inferCode(source, rowText(row));
    return {
      normative_type: /PORTARIA/i.test(reference + ' ' + rowText(row)) ? 'PORTARIA' : 'NORMA',
      issuer: text(first(row,['Emissor','Órgão','Orgao','Issuer'])) || (/INMETRO/i.test(rowText(row)) ? 'INMETRO' : 'Não identificado'),
      reference,
      title: text(first(row,['Título','Titulo','Descrição','Descricao','Assunto'])) || source.replace(/\.[^.]+$/,''),
      source_url: text(first(row,['URL','Link','Fonte','Source URL'])) || null,
      status: upper(first(row,['Status','Situação','Situacao'])) || 'VIGENTE',
      current_version: text(first(row,['Versão','Versao','Revisão','Revisao'])) || null,
      publication_date: asDate(first(row,['Data publicação','Data publicacao','Publicação','Publicacao'])) || null,
      effective_date: asDate(first(row,['Vigência','Vigencia','Data vigência','Data vigencia'])) || null,
      next_review_date: asDate(first(row,['Próxima revisão','Proxima revisao','Vencimento'])) || null,
      monitor_enabled: true,
      check_frequency: 'DAILY',
      notes: `Importado automaticamente de ${source}`
    };
  }

  function preserveRawDoc(row, source, sheetName='') {
    const doc = mapRow(row, source);
    doc.custom_fields = {
      ...(doc.custom_fields || {}),
      origem_arquivo: source,
      aba_origem: sheetName || '',
      dados_originais: row
    };
    return doc;
  }

  async function importNorm(item) {
    const existing = (typeof normItems !== 'undefined' ? normItems : []).find(n => nk(n.reference) === nk(item.reference));
    if (existing) return invoke('sgq-normative-monitor',{action:'update',item:{id:existing.id,...item}});
    return invoke('sgq-normative-monitor',{action:'create',item});
  }

  async function registerBatch(batch) {
    const counts = {DOCS:0,ACTIONS:0,AUDITS:0,KPIS:0,RISKS:0,NORMS:0,fail:0};
    const docMap = new Map();
    for (const rec of batch) {
      try {
        if (rec.module === 'DOCS') {
          const k = codeKey(rec.item.code);
          if (k) docMap.set(k,rec.item);
          else throw new Error('Documento sem código reconhecível');
          continue;
        }
        if (rec.module === 'ACTIONS') { db.actions.unshift(rec.item); counts.ACTIONS++; continue; }
        if (rec.module === 'AUDITS') { db.audits.unshift(rec.item); counts.AUDITS++; continue; }
        if (rec.module === 'KPIS') { db.kpis.unshift(rec.item); counts.KPIS++; continue; }
        if (rec.module === 'RISKS') { db.risks.unshift(rec.item); counts.RISKS++; continue; }
        if (rec.module === 'NORMS') { await importNorm(rec.item); counts.NORMS++; continue; }
      } catch (e) {
        counts.fail++;
        console.error('smart-router',rec,e);
      }
    }
    for (const item of docMap.values()) {
      try { await invoke('sgq-document-admin',{action:'upsert',item}); counts.DOCS++; }
      catch (e) { counts.fail++; console.error('smart-router-doc',item,e); }
    }
    save();
    await Promise.all([loadDocs(),loadNorms()]);
    localAutomation();
    event('IMPORTAÇÃO INTELIGENTE',`DOCS ${counts.DOCS} · AÇÕES ${counts.ACTIONS} · AUDITORIAS ${counts.AUDITS} · KPIs ${counts.KPIS} · RISCOS ${counts.RISKS} · NORMAS ${counts.NORMS} · FALHAS ${counts.fail}`);
    if (typeof window.renderExecutiveDashboard === 'function') window.renderExecutiveDashboard();
    return counts;
  }

  async function parseStructured(file) {
    const n = file.name.toLowerCase();
    const out = [];
    if (/\.(xlsx|xls)$/.test(n)) {
      const wb = XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});
      for (const sheetName of wb.SheetNames) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{defval:''});
        for (const row of rows.filter(r => Object.values(r).some(v => text(v) !== ''))) {
          const module = detectModule({fileName:file.name,sheetName,row});
          if (module === 'DOCS') out.push({module,item:preserveRawDoc(row,file.name,sheetName),source:file.name,sheetName});
          else if (module === 'ACTIONS') out.push({module,item:toAction(row,file.name),source:file.name,sheetName});
          else if (module === 'AUDITS') out.push({module,item:toAudit(row,file.name),source:file.name,sheetName});
          else if (module === 'KPIS') out.push({module,item:toKpi(row,file.name),source:file.name,sheetName});
          else if (module === 'RISKS') out.push({module,item:toRisk(row,file.name),source:file.name,sheetName});
          else if (module === 'NORMS') out.push({module,item:toNorm(row,file.name),source:file.name,sheetName});
        }
      }
      return out;
    }
    if (n.endsWith('.csv')) {
      const wb = XLSX.read(await file.arrayBuffer(),{type:'array'});
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
      return rows.filter(r=>Object.values(r).some(v=>text(v)!=='')).map(row=>{
        const module=detectModule({fileName:file.name,row});
        const item=module==='ACTIONS'?toAction(row,file.name):module==='AUDITS'?toAudit(row,file.name):module==='KPIS'?toKpi(row,file.name):module==='RISKS'?toRisk(row,file.name):module==='NORMS'?toNorm(row,file.name):preserveRawDoc(row,file.name,'CSV');
        return {module,item,source:file.name,sheetName:'CSV'};
      });
    }
    if (n.endsWith('.json')) {
      const raw = JSON.parse(await file.text());
      const arr = Array.isArray(raw) ? raw : (raw.documents || raw.items || raw.actions || raw.audits || raw.kpis || raw.risks || [raw]);
      return arr.map(row=>{
        const module=detectModule({fileName:file.name,row});
        const item=module==='ACTIONS'?toAction(row,file.name):module==='AUDITS'?toAudit(row,file.name):module==='KPIS'?toKpi(row,file.name):module==='RISKS'?toRisk(row,file.name):module==='NORMS'?toNorm(row,file.name):preserveRawDoc(row,file.name,'JSON');
        return {module,item,source:file.name,sheetName:'JSON'};
      });
    }
    return null;
  }

  async function parseUnstructured(file) {
    let extracted = '';
    const n = file.name.toLowerCase();
    if (n.endsWith('.pdf')) extracted = await extractPdf(file);
    else if (n.endsWith('.docx')) extracted = await extractDocx(file);
    else extracted = await file.text();
    const module = detectModule({fileName:file.name,extractedText:extracted});
    if (module === 'NORMS') {
      const row = {Título:file.name.replace(/\.[^.]+$/,''),Descrição:extracted.slice(0,3000)};
      return [{module,item:toNorm(row,file.name),source:file.name,sheetName:'CONTEÚDO'}];
    }
    const item = mapRow({titulo:file.name.replace(/\.[^.]+$/,''),observacoes:extracted.slice(0,6000)},file.name);
    item.code = inferCode(file.name,extracted);
    item.revision = inferRev(file.name,extracted);
    item.document_type = inferType(file.name,extracted);
    item.notes = extracted.slice(0,6000);
    item.custom_fields = {...(item.custom_fields||{}),origem_arquivo:file.name,modulo_detectado:module,texto_extraido:extracted.slice(0,12000)};
    return [{module:'DOCS',item,source:file.name,sheetName:'CONTEÚDO'}];
  }

  function labelModule(m){return ({DOCS:'Documentos e registros',ACTIONS:'RQ 045 / Ações',AUDITS:'Auditorias',KPIS:'Indicadores',RISKS:'Riscos e oportunidades',NORMS:'Normas e Portarias'})[m]||m;}

  async function smartRouteHandler(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    if (!['MASTER','SGQ'].includes(currentRole)) { alert('Somente MASTER ou SGQ podem importar e classificar registros.'); e.target.value=''; return; }
    try {
      $id('importStatus').textContent=`Reconhecendo ${files.length} arquivo(s) e identificando módulos...`;
      $id('importPreview').innerHTML='';
      let batch=[];
      for (let i=0;i<files.length;i++) {
        const file=files[i];
        const parsed=(await parseStructured(file)) || (await parseUnstructured(file));
        batch.push(...parsed);
        $id('importProgress').style.width=`${Math.round(((i+1)/files.length)*45)}%`;
      }
      const byModule=batch.reduce((acc,r)=>{acc[r.module]=(acc[r.module]||0)+1;return acc;},{});
      $id('importPreview').innerHTML=Object.entries(byModule).map(([m,c])=>item(labelModule(m),`${c} registro(s) reconhecido(s)`,'MÓDULO DETECTADO')).join('') + batch.slice(0,12).map(r=>item(`${labelModule(r.module)} · ${r.item.code||r.item.title||r.item.name||r.item.reference||'Registro'}`,r.source)).join('');
      $id('importStatus').textContent='Classificação concluída. Registrando cada informação no módulo correspondente...';
      $id('importProgress').style.width='55%';
      const c=await registerBatch(batch);
      $id('importProgress').style.width='100%';
      $id('importStatus').innerHTML=`<span class="ok">Importação inteligente concluída:</span> Documentos ${c.DOCS} · Ações ${c.ACTIONS} · Auditorias ${c.AUDITS} · Indicadores ${c.KPIS} · Riscos ${c.RISKS} · Normas/Portarias ${c.NORMS}${c.fail?` · Falhas ${c.fail}`:''}.`;
      alert(`Arquivo reconhecido e distribuído automaticamente.\n\nDocumentos: ${c.DOCS}\nAções: ${c.ACTIONS}\nAuditorias: ${c.AUDITS}\nIndicadores: ${c.KPIS}\nRiscos: ${c.RISKS}\nNormas/Portarias: ${c.NORMS}\nFalhas: ${c.fail}`);
    } catch (err) {
      $id('importStatus').innerHTML=`<span class="dangerText">Falha na classificação: ${esc(err.message)}</span>`;
    } finally { e.target.value=''; }
  }

  function install(){
    const input=$id('smartImportFile');
    if (!input) return setTimeout(install,300);
    input.onchange=smartRouteHandler;
    const box=input.closest('.importBox');
    if (box && !box.querySelector('.smart-router-note')) {
      const p=document.createElement('p'); p.className='smart-router-note ok';
      p.textContent='Classificação automática ativa: o SGQ Manager reconhece o conteúdo e registra no módulo correspondente.';
      box.insertBefore(p,box.children[2]||null);
    }
  }

  window.SGQSmartRouter={detectModule,registerBatch,smartRouteHandler};
  install();
})();