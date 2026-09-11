(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const MASTER_NATIVE = { DOCS: 'doc-list', USERS: 'users' };

  function setActive(view) {
    all('.nav').forEach(button => {
      const active = button.dataset.view === view ||
        (view.startsWith('doc-') && button.dataset.view === view);
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function show(view, options = {}) {
    const target = $(view);
    if (!target) {
      console.error(`[SGQ] Módulo inexistente: ${view}`);
      return false;
    }

    all('.view').forEach(panel => panel.classList.add('hidden'));
    const master = $('masterAdminPanel');
    if (master && view !== 'master-admin') master.classList.add('hidden');
    target.classList.remove('hidden');
    setActive(view);
    sessionStorage.setItem('sgq_active_module', view);

    if (view.startsWith('doc-') && typeof window.loadDocs === 'function') {
      Promise.resolve(window.loadDocs()).catch(console.error);
    }
    if (view === 'norms' && typeof window.loadNorms === 'function') {
      Promise.resolve(window.loadNorms()).catch(console.error);
    }
    if (view === 'users' && typeof window.loadUsers === 'function') {
      Promise.resolve(window.loadUsers()).catch(console.error);
    }
    if (!options.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
    document.dispatchEvent(new CustomEvent('sgq:module-opened', { detail: { view } }));
    return true;
  }

  function openMaster(key) {
    const nativeView = MASTER_NATIVE[key];
    if (nativeView) return show(nativeView);

    const panel = $('masterAdminPanel');
    const tab = all('[data-master-tab]').find(item => item.dataset.masterTab === key);
    if (!panel || !tab) return false;
    all('.view').forEach(view => view.classList.add('hidden'));
    panel.classList.remove('hidden');
    $('masterHome')?.classList.add('hidden');
    $('masterWorking')?.classList.add('active');
    tab.click();
    sessionStorage.setItem('sgq_active_module', `master:${key}`);
    return true;
  }

  document.addEventListener('click', event => {
    const nav = event.target.closest('.nav[data-view]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      show(nav.dataset.view);
      return;
    }

    const next = event.target.closest('[data-go]');
    if (next) {
      event.preventDefault();
      event.stopImmediatePropagation();
      show(next.dataset.go);
      return;
    }

    const masterCard = event.target.closest('[data-master-home]');
    if (masterCard) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openMaster(masterCard.dataset.masterHome);
    }
  }, true);

  window.SGQOpenModule = show;
  window.SGQOpenMasterModule = openMaster;
  window.SGQ_NAVIGATION_R7 = true;
})();
