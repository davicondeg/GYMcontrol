(function () {
  const AUTH_SESSION_KEYS = {
    loginConfirmed: 'gestor_financeiro_login_confirmed',
    temporaryLoginBypass: 'gestor_financeiro_temporary_login_bypass',
    temporaryLoginBypassEmail: 'gestor_financeiro_temporary_login_bypass_email',
    temporaryLoginBypassName: 'gestor_financeiro_temporary_login_bypass_name',
  };

  function getSupabaseClient() {
    if (!window.supabaseClient) {
      throw new Error('Cliente Supabase não encontrado.');
    }

    return window.supabaseClient;
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function normalizeName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ');
  }

  // This page must be allowed in the Supabase Auth redirect URL list.
  function buildPasswordRecoveryRedirectUrl() {
    if (window.location.protocol === 'file:' || window.location.origin === 'null') {
      console.warn(
        'Recuperacao de senha usando arquivo local. Abra o projeto via http(s) e configure a URL de redirecionamento no Supabase.',
      );
      return null;
    }

    try {
      return new URL('reset-password.html', window.location.href).toString();
    } catch (error) {
      console.warn('Nao foi possivel montar a URL de redefinicao de senha.', error);
      return null;
    }
  }

  function markLoginConfirmed() {
    try {
      window.sessionStorage.setItem(AUTH_SESSION_KEYS.loginConfirmed, 'true');
    } catch (error) {
      console.warn('Nao foi possivel registrar a confirmacao de login.', error);
    }
  }

  function clearLoginConfirmed() {
    try {
      window.sessionStorage.removeItem(AUTH_SESSION_KEYS.loginConfirmed);
    } catch (error) {
      console.warn('Nao foi possivel limpar a confirmacao de login.', error);
    }
  }

  function enableTemporaryLoginBypass(email, name = 'Usuario local') {
    const normalizedEmail = normalizeEmail(email) || 'usuario@local';
    const normalizedName = normalizeName(name) || 'Usuario local';

    try {
      window.sessionStorage.setItem(AUTH_SESSION_KEYS.loginConfirmed, 'true');
      window.sessionStorage.setItem(AUTH_SESSION_KEYS.temporaryLoginBypass, 'true');
      window.sessionStorage.setItem(AUTH_SESSION_KEYS.temporaryLoginBypassEmail, normalizedEmail);
      window.sessionStorage.setItem(AUTH_SESSION_KEYS.temporaryLoginBypassName, normalizedName);
    } catch (error) {
      console.warn('Nao foi possivel registrar o acesso temporario.', error);
    }
  }

  function clearTemporaryLoginBypass() {
    try {
      window.sessionStorage.removeItem(AUTH_SESSION_KEYS.temporaryLoginBypass);
      window.sessionStorage.removeItem(AUTH_SESSION_KEYS.temporaryLoginBypassEmail);
      window.sessionStorage.removeItem(AUTH_SESSION_KEYS.temporaryLoginBypassName);
    } catch (error) {
      console.warn('Nao foi possivel limpar o acesso temporario.', error);
    }
  }

  function hasTemporaryLoginBypass() {
    try {
      return window.sessionStorage.getItem(AUTH_SESSION_KEYS.temporaryLoginBypass) === 'true';
    } catch (error) {
      return false;
    }
  }

  function buildTemporaryLoginUser() {
    let email = 'usuario@local';
    let name = 'Usuario local';

    try {
      email = window.sessionStorage.getItem(AUTH_SESSION_KEYS.temporaryLoginBypassEmail) || email;
      name = window.sessionStorage.getItem(AUTH_SESSION_KEYS.temporaryLoginBypassName) || name;
    } catch (error) {
      console.warn('Nao foi possivel ler o acesso temporario.', error);
    }

    return {
      id: '00000000-0000-0000-0000-000000000001',
      email,
      user_metadata: {
        name,
      },
    };
  }

  function hasConfirmedLogin() {
    try {
      return window.sessionStorage.getItem(AUTH_SESSION_KEYS.loginConfirmed) === 'true';
    } catch (error) {
      return false;
    }
  }

  function isUserAlreadyRegisteredResponse(data, error) {
    if (error && /already registered/i.test(String(error.message || ''))) {
      return true;
    }

    const identities = data && data.user && Array.isArray(data.user.identities)
      ? data.user.identities
      : null;

    return Boolean(data && data.user && identities && identities.length === 0);
  }

  async function loginUser(email, password) {
    clearTemporaryLoginBypass();
    const client = getSupabaseClient();
    const normalizedUserEmail = normalizeEmail(email);
    const result = await client.auth.signInWithPassword({
      email: normalizedUserEmail,
      password,
    });

    if (!result.error && result.data && result.data.user) {
      markLoginConfirmed();
    }

    return result;
  }

  async function requestPasswordReset(email) {
    const client = getSupabaseClient();
    const normalizedUserEmail = normalizeEmail(email);
    const redirectTo = buildPasswordRecoveryRedirectUrl();

    if (redirectTo) {
      return client.auth.resetPasswordForEmail(normalizedUserEmail, {
        redirectTo,
      });
    }

    return client.auth.resetPasswordForEmail(normalizedUserEmail);
  }

  async function ensureProfile(userId, name) {
    const client = getSupabaseClient();
    const normalizedUserName = normalizeName(name);

    return client
      .from('profiles')
      .upsert(
        {
          id: userId,
          name: normalizedUserName || null,
        },
        { onConflict: 'id' },
      );
  }

  async function updatePassword(password) {
    const client = getSupabaseClient();

    return client.auth.updateUser({
      password,
    });
  }

  async function registerUser(name, email, password) {
    const client = getSupabaseClient();
    const normalizedUserName = normalizeName(name);
    const normalizedUserEmail = normalizeEmail(email);

    const { data, error } = await client.auth.signUp({
      email: normalizedUserEmail,
      password,
      options: {
        data: {
          name: normalizedUserName,
        },
      },
    });

    if (isUserAlreadyRegisteredResponse(data, error)) {
      return {
        data,
        error: {
          message: 'Este e-mail já está cadastrado.',
          code: 'user_already_registered',
        },
        meta: {
          needsEmailConfirmation: false,
          profileCreated: false,
          profileError: null,
        },
      };
    }

    if (error) {
      return {
        data,
        error,
        meta: {
          needsEmailConfirmation: false,
          profileCreated: false,
          profileError: null,
        },
      };
    }

    const needsEmailConfirmation = Boolean(data && data.user && !data.session);
    let profileCreated = false;
    let profileError = null;

    if (data && data.user && data.session) {
      const profileResult = await ensureProfile(data.user.id, normalizedUserName);
      profileError = profileResult.error || null;
      profileCreated = !profileError;
    }

    return {
      data,
      error: null,
      meta: {
        needsEmailConfirmation,
        profileCreated,
        profileError,
      },
    };
  }

  async function logoutUser() {
    const client = getSupabaseClient();
    clearLoginConfirmed();
    clearTemporaryLoginBypass();
    return client.auth.signOut();
  }

  async function getCurrentUser() {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getUser();

    if (error) {
      return { data: { user: null }, error };
    }

    return { data, error: null };
  }

  async function getSession() {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getSession();

    if (error) {
      return { data: { session: null }, error };
    }

    return { data, error: null };
  }

  async function requireAuth(redirectPath = './login.html') {
    clearTemporaryLoginBypass();

    const { data, error } = await getCurrentUser();

    if (error || !data || !data.user) {
      clearLoginConfirmed();
      window.location.href = redirectPath;
      return null;
    }

    if (!hasConfirmedLogin()) {
      try {
        await logoutUser();
      } catch (logoutError) {
        console.warn('Nao foi possivel encerrar uma sessao nao confirmada.', logoutError);
      }

      window.location.href = redirectPath;
      return null;
    }

    return data.user;
  }

  function onAuthStateChange(callback) {
    const client = getSupabaseClient();
    return client.auth.onAuthStateChange(callback);
  }

  window.GestorFinanceiroAuthService = {
    clearTemporaryLoginBypass,
    ensureProfile,
    getSession,
    loginUser,
    onAuthStateChange,
    enableTemporaryLoginBypass,
    registerUser,
    requestPasswordReset,
    logoutUser,
    getCurrentUser,
    updatePassword,
    requireAuth,
  };
})();
