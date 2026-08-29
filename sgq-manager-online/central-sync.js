(() => {
  'use strict';

  const API='sgq-core-record-admin';
  let busy=false;
  const text=v=>String(v??'').trim();
  const sig=(...v)=>v.map(x=>text(x).toLowerCase()).join('|');
  const mapActionStatus=s=>{const x=text(s).toLowerCase();if(x==='completed'||x==='closed'||x==='verified')return'Concluída';if(x==='in_progress')return'Em andamento';if(x==='awaiting_validation')return'Aguardando eficácia';return'Aberta';};

  async function pushPending(){
    if(busy||typeof currentUser==='undefined'||!currentUser||typeof db==='undefined')return;
    busy=true;
    try{
      const groups=[
        ['ACTIONS',db.actions||[]],['AUDITS',db.audits||[]],['KPIS',db.kpis||[]],['RISKS',db.risks||[]]
      ];
      for(const [module,rows] of groups){
        for(const row of rows){
          if(!row?.source_import||row._central_synced)continue;
          try{await invoke(API,{action:'upsert',module,item:row});row._central_synced=true;}catch(e){console.error('central-sync push',module,row,e);}
        }
      }
      save();
    }finally{busy=false;}
  }

  function merge(local,central,signature){
    const keys=new Set(central.map(signature));
    return [...central,...local.filter(x=>!keys.has(signature(x)))];
  }

  async function pullCentral(){
    if(busy||typeof currentUser==='undefined'||!currentUser||typeof db==='undefined')return;
    busy=true;
    try{
      const d=await invoke(API,{action:'list'});
      const actions=(d.actions||[]).map(x=>({id:x.id,title:x.title,owner:x.metadata?.owner_name||'SGQ',due:x.due_date,status:mapActionStatus(x.status),source_import:x.metadata?.source_import||'',raw_import:x.metadata?.raw_import||null,_central_synced:true,_central:true}));
      const audits=(d.audits||[]).map(x=>({id:x.id,title:x.title,date:x.planned_date||'',scope:x.scope||'',source_import:x.metadata?.source_import||'',raw_import:x.metadata?.raw_import||null,_central_synced:true,_central:true}));
      const values=d.indicator_values||[];
      const kpis=(d.indicators||[]).map(x=>{const vals=values.filter(v=>v.indicator_id===x.id).sort((a,b)=>String(b.reference_date).localeCompare(String(a.reference_date)));const v=vals[0]||{};return{id:x.id,name:x.name,value:v.value??'',target:x.target??'',unit:x.unit||'',period:v.reference_date||'',source_import:x.metadata?.source_import||v.source||'',raw_import:x.metadata?.raw_import||v.metadata?.raw_import||null,_central_synced:true,_central:true};});
      const risks=(d.risks||[]).map(x=>({id:x.id,title:x.title,p:x.probability||1,i:x.impact||1,source_import:x.metadata?.source_import||'',raw_import:x.metadata?.raw_import||null,_central_synced:true,_central:true}));

      db.actions=merge(db.actions||[],actions,x=>sig(x.title,x.due,x.source_import));
      db.audits=merge(db.audits||[],audits,x=>sig(x.title,x.date,x.source_import));
      db.kpis=merge(db.kpis||[],kpis,x=>sig(x.name,x.period,x.source_import));
      db.risks=merge(db.risks||[],risks,x=>sig(x.title,x.p,x.i,x.source_import));
      save();
      if(typeof renderLocal==='function')renderLocal();
      if(typeof localAutomation==='function')localAutomation();
      if(typeof window.renderExecutiveDashboard==='function')window.renderExecutiveDashboard();
    }catch(e){console.error('central-sync pull',e);}finally{busy=false;}
  }

  async function cycle(){
    try{await pushPending();await pullCentral();}catch(e){console.error('central-sync cycle',e);}
  }

  function installBadge(){
    const box=document.querySelector('.importBox');
    if(!box||box.querySelector('.central-sync-note'))return;
    const p=document.createElement('p');
    p.className='central-sync-note muted';
    p.textContent='Sincronização online ativa: ações, auditorias, indicadores e riscos importados são registrados no banco central e reaparecem em qualquer sessão autorizada.';
    box.appendChild(p);
  }

  setTimeout(()=>{installBadge();cycle();},1800);
  setInterval(cycle,15000);
  window.SGQCentralSync={cycle,pushPending,pullCentral};
})();