(() => {
  'use strict';

  const ALLOWED_ROLES = new Set(['MASTER','SGQ','GESTOR','CONSULTA']);
  const originalBoot = typeof boot === 'function' ? boot : null;
  let checking = false;

  const $id = id => document.getElementById(id);

  function lockUi(message='Validando vínculo com a organização...') {
    const app = $id('appView');
    const login = $id('loginView');
    const msg = $id('loginMsg');
    if (app) app.classList.add('hidden');
    if (login) login.classList.remove('hidden');
    if (msg) msg.textContent = message;
  }

  async function deny(reason) {
    lockUi(reason);
    try { await sb.auth.signOut(); } catch (e) { console.error('access-guard signout', e); }
    try { currentUser = null; currentRole = ''; } catch (_) {}
    const badge = $id('sessionBadge');
    if (badge) badge.textContent = 'ACESSO BLOQUEADO';
    return false;
  }

  async function activeMembership(userId) {
    const { data, error } = await sb
      .from('user_memberships')
      .select('tenant_id,company_id,status,is_default,roles:role_id(code)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function guardedBoot(session) {
    if (checking) return;
    if (!session?.user) {
      lockUi('');
      if (originalBoot) await originalBoot(session);
      return;
    }

    checking = true;
    lockUi('Validando acesso e vínculo ativo...');
    try {
      const membership = await activeMembership(session.user.id);
      const role = membership?.roles?.code || '';
      if (!membership?.tenant_id || !ALLOWED_ROLES.has(role)) {
        await deny('Acesso bloqueado: usuário autenticado sem vínculo ativo e perfil autorizado no tenant. Contate o administrador MASTER.');
        return;
      }

      if (originalBoot) await originalBoot(session);
      try { currentRole = role; } catch (_) {}
      const badge = $id('sessionBadge');
      if (badge) badge.textContent = `${session.user.email} · ${role}`;
      const msg = $id('loginMsg');
      if (msg) msg.textContent = '';
    } catch (e) {
      console.error('access-guard', e);
      await deny('Acesso bloqueado por segurança: não foi possível validar o vínculo ativo. Tente novamente ou contate o administrador MASTER.');
    } finally {
      checking = false;
    }
  }

  if (originalBoot) {
    try { boot = guardedBoot; } catch (e) { console.error('access-guard override', e); }
  }

  lockUi('Validando acesso e vínculo ativo...');
  sb.auth.getSession().then(({ data, error }) => {
    if (error) return deny('Acesso bloqueado por segurança: sessão não pôde ser validada.');
    return guardedBoot(data.session);
  }).catch(e => deny(`Acesso bloqueado por segurança: ${e?.message || e}`));

  window.SGQAccessGuard = { guardedBoot, activeMembership, deny };
})();
