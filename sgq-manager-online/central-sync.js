(() => {
  'use strict';

  const API='sgq-core-record-admin';
  const MODULES=['ACTIONS','AUDITS','KPIS','RISKS'];
  let busy=false;
  let bootstrapped=false;
  const text=v=>String(v??'').trim();
  const mapActionStatus=s=>{const x=text(s).toLowerCase();if(x==='completed'||x==='closed'||x==='verified')return'Concluída';if(x==='in_progress')return'Em andamento';if(x==='awaiting_validation')return'Aguardando eficácia';if(x==='cancelled')return'Cancelada';return'Aberta';};

  function rowsFor(module){
    if(module==='ACTIONS')return db.actions||[];
    if(module==='AUDITS')return db.audits||[];
    if(module==='KPIS')return db.kpis||[];
    if(module==='RISKS')return db.risks||[];
    return [];
  }

  function setRows(module,rows){
    if(module==='ACTIONS')db.actions=rows;
    else if(module==='AUDITS')db.audits=rows;
    else if(module==='KPIS')db.kpis=rows;
    else if(module==='RISKS')db.risks=rows;
  }

  async function pushPending(){
    if(busy||typeof currentUser==='undefined'||!currentUser||typeof db==='undefined')return {pushed:0,failed:0};
    busy=true;
    let pushed=0,failed=0;
    try{
      for(const module of MODULES){
        for(const row of rowsFor(module)){
          if(!row||row._central===true||row._central_synced===true)continue;
          try{
            const r=await invoke(API,{action:'upsert',module,item:row});
            row._central_synced=true;
            row._central_id=r?.item?.id||r?.indicator?.id||row.id||null;
            pushed++;
          }catch(e){
            failed++;
            row._central_sync_error=String(e?.message||e);
            console.error('central-sync push',module,row,e);
          }
        }
      }
      save();
      return {pushed,failed};
    }finally{busy=false;}
  }

  function centralToLocal(d){
    const actions=(d.actions||[]).map(x=>({id:x.id,title:x.title,owner:x.metadata?.owner_name||'SGQ',due:x.due_date,status:mapActionStatus(x.status),source_import:x.metadata?.source_import||'',raw_import:x.metadata?.raw_import||null,description:x.description||'',priority:x.priority||'',_central_synced:true,_central:true}));
    const audits=(d.audits||[]).map(x=>({id:x.id,title:x.title,date:x.planned_date||'',scope:x.scope||'',status:x.status||'',source_import:x.metadata?.source_import||'',raw_import:x.metadata?.raw_import||null,_central_synced:true,_central:true}));
    const values=d.indicator_values||[];
    const kpis=(d.indicators||[]).map(x=>{const vals=values.filter(v=>v.indicator_id===x.id).sort((a,b)=>String(b.reference_date).localeCompare(String(a.reference_date)));const v=vals[0]||{};return{id:x.id,name:x.name,value:v.value??'',target:x.target??'',unit:x.unit||'',period:v.reference_date||'',source_import:x.metadata?.source_import||v.source||'',raw_import:x.metadata?.raw_import||v.metadata?.raw_import||null,_central_synced:true,_central:true};});
    const risks=(d.risks||[]).map(x=>({id:x.id,title:x.title,p:x.probability||1,i:x.impact||1,score:x.score||((x.probability||1)*(x.impact||1)),status:x.status||'OPEN',source_import:x.metadata?.source_import||'',raw_import:x.metadata?.raw_import||null,_central_synced:true,_central:true}));
    return {ACTIONS:actions,AUDITS:audits,KPIS:kpis,RISKS:risks};
  }

  async function pullCentral(){
    if(busy||typeof currentUser==='undefined'||!currentUser||typeof db==='undefined')return null;
    busy=true;
    try{
      const d=await invoke(API,{action:'list'});
      const mapped=centralToLocal(d);
      // Supabase é a fonte oficial: após sincronizar o legado local, as quatro coleções
      // passam a ser reconstruídas integralmente a partir do banco central.
      for(const module of MODULES)setRows(module,mapped[module]);
      bootstrapped=true;
      save();
      if(typeof renderLocal==='function')renderLocal();
      if(typeof localAutomation==='function')localAutomation();
      if(typeof window.renderExecutiveDashboard==='function')window.renderExecutiveDashboard();
      updateBadge('online');
      return d;
    }catch(e){
      console.error('central-sync pull',e);
      updateBadge('error',String(e?.message||e));
      throw e;
    }finally{busy=false;}
  }

  async function cycle(){
    if(typeof currentUser==='undefined'||!currentUser||typeof db==='undefined')return;
    try{
      // Migração segura: primeiro envia qualquer registro local ainda não centralizado.
      await pushPending();
      // Depois substitui as coleções locais pela fonte oficial central.
      await pullCentral();
    }catch(e){console.error('central-sync cycle',e);}
  }

  function installBadge(){
    const box=document.querySelector('.importBox');
    if(!box||box.querySelector('.central-sync-note'))return;
    const p=document.createElement('p');
    p.className='central-sync-note muted';
    p.dataset.centralSync='status';
    p.textContent='Fonte oficial online ativa: ações, auditorias, indicadores e riscos são sincronizados com o banco central.';
    box.appendChild(p);
  }

  function updateBadge(state,detail=''){
    installBadge();
    const p=document.querySelector('[data-central-sync="status"]');
    if(!p)return;
    if(state==='online'){
      p.className='central-sync-note ok';
      p.textContent='Fonte oficial: Supabase · Ações, Auditorias, Indicadores e Riscos sincronizados online.';
    }else if(state==='error'){
      p.className='central-sync-note warn';
      p.textContent=`Sincronização central temporariamente indisponível${detail?`: ${detail}`:''}. Os dados locais não serão descartados até a reconexão.`;
    }
  }

  async function centralUpsert(module,item){
    if(!MODULES.includes(module))throw new Error('Módulo central não suportado');
    const r=await invoke(API,{action:'upsert',module,item});
    await pullCentral();
    return r;
  }

  setTimeout(()=>{installBadge();cycle();},1200);
  setInterval(cycle,15000);
  window.SGQCentralSync={cycle,pushPending,pullCentral,centralUpsert,isCentralSource:()=>bootstrapped};
})();