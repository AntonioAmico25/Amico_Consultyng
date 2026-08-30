(() => {
  'use strict';

  const INTERVAL_MS = 60000;
  const BRAZIL_MAP_SRC = 'brazil-map.js?v=20260830-r8';
  const MASTER_ADMIN_SRC = 'https://cdn.jsdelivr.net/gh/AntonioAmico25/Amico_Consultyng@b9e3c57c145fe5c28c947d50ed4b9915d757f118/sgq-manager-online/master-admin.js';
  const AUTH_FIX_SRC = 'https://cdn.jsdelivr.net/gh/AntonioAmico25/Amico_Consultyng@6f2ba3dc982a81cf7fab4a55a65e8ca77a2f360b/sgq-manager-online/auth-session-fix.js';
  const PTBR_SRC = 'https://cdn.jsdelivr.net/gh/AntonioAmico25/Amico_Consultyng@6f2ba3dc982a81cf7fab4a55a65e8ca77a2f360b/sgq-manager-online/ptbr-ui.js';
  const AGENDA_BRIDGE_SRC = 'https://cdn.jsdelivr.net/gh/AntonioAmico25/Amico_Consultyng@12803a39cf9ace7adf127b618dd69bfe620a2a48/sgq-manager-online/agenda-bridge.js';
  let refreshing = false;
  let lastSuccess = null;
  let lastError = null;

  const byId = id => document.getElementById(id);
  function inject(src,key){
    if(document.querySelector(`script[data-${key}]`))return;
    const s=document.createElement('script');s.src=src;s.async=true;s.dataset[key]='1';s.onerror=()=>console.error(`Falha ao carregar ${key}.`);document.head.appendChild(s);
  }
  function ensureSupport(){
    if(!window.SGQSecureBoot)inject(AUTH_FIX_SRC,'sgqAuthFix');
    if(!window.SGQ_PTBR)inject(PTBR_SRC,'sgqPtbr');
    if(!window.SGQAgendaBridge)inject(AGENDA_BRIDGE_SRC,'sgqAgendaBridge');
  }
  ensureSupport();

  function isAppActive() {
    const app = byId('appView');
    return app && !app.classList.contains('hidden');
  }

  function ensureBadge() {
    const head = document.querySelector('#execDashboard .exec-head, #execDashboard .exec-headline');
    if (!head || byId('execAutoUpdate')) return;
    const badge = document.createElement('span');
    badge.id = 'execAutoUpdate';
    badge.className = 'pill ok';
    badge.textContent = '● Atualização automática ativa · 60 s';
    const current = byId('execUpdated');
    if (current && current.parentElement === head) {
      const wrap = document.createElement('div');
      wrap.className = 'toolbar';
      head.replaceChild(wrap, current);
      wrap.append(current, badge);
    } else {
      head.appendChild(badge);
    }
  }

  function ensureBrazilMap() {
    if (window.SGQBrazilMap || document.querySelector('script[data-sgq-brazil-map]')) return;
    const s = document.createElement('script');
    s.src = BRAZIL_MAP_SRC;
    s.async = true;
    s.dataset.sgqBrazilMap = '1';
    s.onerror = () => console.error('Falha ao carregar o mapa regional do SGQ Manager.');
    document.head.appendChild(s);
  }

  function ensureMasterAdmin() {
    if (window.SGQMasterAdmin || document.querySelector('script[data-sgq-master-admin]')) return;
    const s = document.createElement('script');
    s.src = MASTER_ADMIN_SRC;
    s.async = true;
    s.dataset.sgqMasterAdmin = '1';
    s.onerror = () => console.error('Falha ao carregar a Central de Administração MASTER.');
    document.head.appendChild(s);
  }

  function updateBadge(state, detail = '') {
    ensureBadge();
    const badge = byId('execAutoUpdate');
    if (!badge) return;
    badge.classList.remove('ok', 'warn', 'dangerText');
    if (state === 'loading') {
      badge.classList.add('warn');
      badge.textContent = '● Atualizando dados…';
    } else if (state === 'error') {
      badge.classList.add('dangerText');
      badge.textContent = `● Falha na atualização${detail ? ' · ' + detail : ''}`;
    } else {
      badge.classList.add('ok');
      const t = lastSuccess ? lastSuccess.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : '—';
      badge.textContent = `● Automático 60 s · última ${t}`;
    }
  }

  async function refreshAll() {
    if (refreshing || !isAppActive() || document.hidden) return;
    refreshing = true;
    updateBadge('loading');
    try {
      ensureSupport();
      ensureBrazilMap();
      ensureMasterAdmin();
      const jobs = [];
      if (typeof window.loadDocs === 'function') jobs.push(window.loadDocs());
      if (typeof window.loadNorms === 'function') jobs.push(window.loadNorms());
      if (typeof window.SGQAgendaBridge?.refresh === 'function') jobs.push(window.SGQAgendaBridge.refresh());
      await Promise.allSettled(jobs);
      if (typeof window.localAutomation === 'function') window.localAutomation();
      if (typeof window.renderExecutiveDashboard === 'function') window.renderExecutiveDashboard();
      if (typeof window.SGQBrazilMap?.render === 'function') await window.SGQBrazilMap.render();
      if (typeof window.SGQMasterAdmin?.load === 'function') await window.SGQMasterAdmin.load();
      if (typeof window.SGQ_PTBR?.apply === 'function') window.SGQ_PTBR.apply();
      lastSuccess = new Date();
      lastError = null;
      updateBadge('ok');
    } catch (err) {
      lastError = err;
      updateBadge('error', String(err?.message || 'erro'));
    } finally {
      refreshing = false;
    }
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAll(); });
  window.addEventListener('online', refreshAll);

  const bootTimer = setInterval(() => {
    ensureSupport();
    ensureBadge();
    ensureBrazilMap();
    ensureMasterAdmin();
    if (isAppActive()) {
      clearInterval(bootTimer);
      refreshAll();
    }
  }, 1000);

  setInterval(refreshAll, INTERVAL_MS);
  window.sgqAutoRefresh = { refresh: refreshAll, intervalMs: INTERVAL_MS, getStatus: () => ({lastSuccess, lastError}) };
})();
