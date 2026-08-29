(() => {
  'use strict';

  const INTERVAL_MS = 60000;
  let refreshing = false;
  let lastSuccess = null;
  let lastError = null;

  const byId = id => document.getElementById(id);

  function isAppActive() {
    const app = byId('appView');
    return app && !app.classList.contains('hidden');
  }

  function ensureBadge() {
    const head = document.querySelector('#execDashboard .exec-head');
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
      const jobs = [];
      if (typeof window.loadDocs === 'function') jobs.push(window.loadDocs());
      if (typeof window.loadNorms === 'function') jobs.push(window.loadNorms());
      await Promise.allSettled(jobs);
      if (typeof window.localAutomation === 'function') window.localAutomation();
      if (typeof window.renderExecutiveDashboard === 'function') window.renderExecutiveDashboard();
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

  // Atualização ao retornar para a aba e quando a conexão volta.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshAll();
  });
  window.addEventListener('online', refreshAll);

  // Primeiro ciclo após a autenticação/interface ficar disponível.
  const bootTimer = setInterval(() => {
    ensureBadge();
    if (isAppActive()) {
      clearInterval(bootTimer);
      refreshAll();
    }
  }, 1000);

  setInterval(refreshAll, INTERVAL_MS);
  window.sgqAutoRefresh = { refresh: refreshAll, intervalMs: INTERVAL_MS, getStatus: () => ({lastSuccess, lastError}) };
})();
