(() => {
  'use strict';

  const LEGACY_IDS = [
    'actList','audList','kpiList','riskList','alertList','agendaList','eventList',
    'kd','ka','ku','ki','kn','kx','dashAlerts','dashDue','dashEvents'
  ];

  function ensureLegacyTargets(){
    let box = document.getElementById('sgqLegacyCompatTargets');
    if(!box){
      box = document.createElement('div');
      box.id = 'sgqLegacyCompatTargets';
      box.hidden = true;
      box.setAttribute('aria-hidden','true');
      document.body.appendChild(box);
    }
    for(const id of LEGACY_IDS){
      if(!document.getElementById(id)){
        const el = document.createElement('div');
        el.id = id;
        box.appendChild(el);
      }
    }
  }

  function installSafeLocalAutomation(){
    if(typeof window.localAutomation !== 'function' || window.localAutomation.__sgqSafe) return;
    const original = window.localAutomation;
    const safe = function(...args){
      ensureLegacyTargets();
      try {
        return original.apply(this,args);
      } catch(err){
        console.error('SGQ localAutomation protegido:', err);
        const msg = document.getElementById('loginMsg');
        if(msg && /Cannot set properties of null/.test(String(err?.message||''))){
          msg.textContent = 'Compatibilidade da interface aplicada. Tente entrar novamente.';
        }
      }
    };
    safe.__sgqSafe = true;
    window.localAutomation = safe;
  }

  function install(){
    ensureLegacyTargets();
    installSafeLocalAutomation();
    setTimeout(installSafeLocalAutomation, 500);
    setTimeout(installSafeLocalAutomation, 1500);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
