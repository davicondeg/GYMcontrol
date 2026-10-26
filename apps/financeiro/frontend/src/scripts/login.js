document.addEventListener('DOMContentLoaded', async () => {
  const authService = window.GestorFinanceiroAuthService;
  const loginForm = document.getElementById('login-form');
  const loginEmailInput = document.getElementById('email');
  const loginPasswordInput = document.getElementById('password');
  const loginFeedback = document.getElementById('login-feedback');
  const loginSubmitButton = document.getElementById('login-submit-button');
  const togglePasswordButton = document.getElementById('toggle-password');
  const openPasswordResetLink = document.getElementById('open-password-reset');
  const openSignupLink = document.getElementById('open-signup');
  const passwordResetModal = document.getElementById('password-reset-modal');
  const passwordResetForm = document.getElementById('password-reset-form');
  const passwordResetFeedback = document.getElementById('password-reset-feedback');
  const passwordResetSubmitButton = passwordResetForm
    ? passwordResetForm.querySelector('button[type="submit"]')
    : null;
  const backToLoginPasswordResetButton = document.getElementById('back-to-login-password-reset');
  const passwordResetEmailInput = document.getElementById('password-reset-email');
  const signupModal = document.getElementById('signup-modal');
  const signupForm = document.getElementById('signup-form');
  const signupFeedback = document.getElementById('signup-feedback');
  const signupSubmitButton = signupForm ? signupForm.querySelector('button[type="submit"]') : null;
  const backToLoginButton = document.getElementById('back-to-login');
  const signupNameInput = document.getElementById('full-name');
  const signupEmailInput = document.getElementById('signup-email');
  const signupPasswordInput = document.getElementById('signup-password');
  const signupConfirmInput = document.getElementById('confirm-password');
  let signupSuccessTimeoutId = null;
  let passwordResetSuccessTimeoutId = null;
  const TEMPORARY_LOGIN_BYPASS = true;

  if (
    !authService ||
    !loginForm ||
    !loginEmailInput ||
    !loginPasswordInput ||
    !loginFeedback ||
    !loginSubmitButton ||
    !togglePasswordButton ||
    !openPasswordResetLink ||
    !openSignupLink ||
    !passwordResetModal ||
    !passwordResetForm ||
    !passwordResetFeedback ||
    !passwordResetSubmitButton ||
    !backToLoginPasswordResetButton ||
    !passwordResetEmailInput ||
    !signupModal ||
    !signupForm ||
    !signupFeedback ||
    !signupSubmitButton ||
    !backToLoginButton ||
    !signupNameInput ||
    !signupEmailInput ||
    !signupPasswordInput ||
    !signupConfirmInput
  ) {
    console.error('Campos obrigatórios da tela de login/cadastro não foram encontrados.');
    return;
  }

  function setLoginFeedback(message, type) {
    loginFeedback.textContent = message;
    loginFeedback.className = 'form-feedback';

    if (type) {
      loginFeedback.classList.add(type);
    }
  }

  function setSignupFeedback(message, type) {
    signupFeedback.textContent = message;
    signupFeedback.className = 'form-feedback';

    if (type) {
      signupFeedback.classList.add(type);
    }
  }

  function setPasswordResetFeedback(message, type) {
    passwordResetFeedback.textContent = message;
    passwordResetFeedback.className = 'form-feedback';

    if (type) {
      passwordResetFeedback.classList.add(type);
    }
  }

  function clearSignupSuccessRedirect() {
    if (signupSuccessTimeoutId) {
      window.clearTimeout(signupSuccessTimeoutId);
      signupSuccessTimeoutId = null;
    }
  }

  function clearPasswordResetSuccessRedirect() {
    if (passwordResetSuccessTimeoutId) {
      window.clearTimeout(passwordResetSuccessTimeoutId);
      passwordResetSuccessTimeoutId = null;
    }
  }

  function openSignupModal() {
    clearPasswordResetSuccessRedirect();
    closePasswordResetModal();
    clearSignupSuccessRedirect();
    signupModal.hidden = false;
    setSignupFeedback('', '');
    signupForm.reset();
    signupNameInput.focus();
  }

  function closeSignupModal() {
    clearSignupSuccessRedirect();
    signupModal.hidden = true;
    setSignupFeedback('', '');
  }

  function openPasswordResetModal() {
    clearSignupSuccessRedirect();
    closeSignupModal();
    clearPasswordResetSuccessRedirect();
    passwordResetModal.hidden = false;
    passwordResetForm.reset();
    passwordResetEmailInput.value = loginEmailInput.value.trim();
    setPasswordResetFeedback('', '');
    window.requestAnimationFrame(() => {
      passwordResetEmailInput.focus();
    });
  }

  function closePasswordResetModal() {
    clearPasswordResetSuccessRedirect();
    passwordResetModal.hidden = true;
    setPasswordResetFeedback('', '');
    passwordResetForm.reset();
  }

  function setLoginLoadingState(isLoading) {
    loginSubmitButton.disabled = isLoading;
    loginSubmitButton.textContent = isLoading ? 'ENTRANDO...' : 'ENTRAR';
  }

  function setSignupLoadingState(isLoading) {
    signupSubmitButton.disabled = isLoading;
    signupSubmitButton.textContent = isLoading ? 'CRIANDO CONTA...' : 'Criar conta';
  }

  function setPasswordResetLoadingState(isLoading) {
    passwordResetSubmitButton.disabled = isLoading;
    passwordResetSubmitButton.textContent = isLoading ? 'ENVIANDO...' : 'Enviar link';
  }

  function enterDashboardWithoutAuthentication() {
    const email = loginEmailInput.value.trim();
    authService.enableTemporaryLoginBypass(email);
    setLoginFeedback('Entrando direto no dashboard...', 'is-success');
    window.location.href = './dashboard.html';
  }

  function returnToInitialLogin(email, message) {
    loginEmailInput.value = email || '';
    loginPasswordInput.value = '';
    setLoginFeedback(message, 'is-success');
    closeSignupModal();
    closePasswordResetModal();

    window.requestAnimationFrame(() => {
      loginPasswordInput.focus();
    });
  }

  const loginPageUrl = new URL(window.location.href);
  const recoveredEmail = loginPageUrl.searchParams.get('email');

  if (recoveredEmail) {
    loginEmailInput.value = recoveredEmail;
  }

  if (loginPageUrl.searchParams.get('password-reset') === 'updated') {
    setLoginFeedback('Senha atualizada com sucesso. Entre com a nova senha.', 'is-success');

    window.requestAnimationFrame(() => {
      loginPasswordInput.focus();
    });
  }

  togglePasswordButton.addEventListener('click', () => {
    const shouldShow = loginPasswordInput.type === 'password';
    loginPasswordInput.type = shouldShow ? 'text' : 'password';
    togglePasswordButton.setAttribute('aria-pressed', String(shouldShow));
    togglePasswordButton.setAttribute('aria-label', shouldShow ? 'Ocultar senha' : 'Mostrar senha');
  });

  openSignupLink.addEventListener('click', (event) => {
    event.preventDefault();
    openSignupModal();
  });

  openPasswordResetLink.addEventListener('click', (event) => {
    event.preventDefault();
    openPasswordResetModal();
  });

  backToLoginButton.addEventListener('click', () => {
    closeSignupModal();
  });

  backToLoginPasswordResetButton.addEventListener('click', () => {
    closePasswordResetModal();
  });

  signupModal.addEventListener('click', (event) => {
    if (event.target === signupModal) {
      closeSignupModal();
    }
  });

  passwordResetModal.addEventListener('click', (event) => {
    if (event.target === passwordResetModal) {
      closePasswordResetModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!passwordResetModal.hidden) {
        closePasswordResetModal();
        return;
      }

      if (!signupModal.hidden) {
        closeSignupModal();
      }
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setLoginFeedback('', '');

    if (TEMPORARY_LOGIN_BYPASS) {
      setLoginLoadingState(true);

      try {
        enterDashboardWithoutAuthentication();
      } catch (error) {
        console.error('Erro inesperado ao liberar acesso temporario.', error);
        setLoginLoadingState(false);
        setLoginFeedback('Nao foi possivel entrar. Tente novamente.', 'is-error');
      }

      return;
    }

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (!email) {
      setLoginFeedback('O e-mail é obrigatório.', 'is-error');
      loginEmailInput.focus();
      return;
    }

    if (!password) {
      setLoginFeedback('A senha é obrigatória.', 'is-error');
      loginPasswordInput.focus();
      return;
    }

    setLoginLoadingState(true);

    try {
      const { error } = await authService.loginUser(email, password);

      if (error) {
        setLoginFeedback(error.message || 'Não foi possível entrar. Verifique suas credenciais.', 'is-error');
        loginPasswordInput.focus();
        return;
      }

      setLoginFeedback('Login realizado com sucesso. Redirecionando...', 'is-success');
      window.location.href = './dashboard.html';
    } catch (error) {
      console.error('Erro inesperado ao tentar autenticar.', error);
      setLoginFeedback('Ocorreu um erro ao tentar entrar. Tente novamente.', 'is-error');
    } finally {
      setLoginLoadingState(false);
    }
  });

  passwordResetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setPasswordResetFeedback('', '');

    const email = passwordResetEmailInput.value.trim();

    if (!email) {
      setPasswordResetFeedback('O e-mail é obrigatório.', 'is-error');
      passwordResetEmailInput.focus();
      return;
    }

    setPasswordResetLoadingState(true);

    try {
      const { error } = await authService.requestPasswordReset(email);

      if (error) {
        setPasswordResetFeedback(
          error.message || 'Não foi possível enviar o link. Tente novamente.',
          'is-error',
        );
        passwordResetEmailInput.focus();
        return;
      }

      const successMessage = 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.';
      setPasswordResetFeedback(successMessage, 'is-success');
      clearPasswordResetSuccessRedirect();
      passwordResetSuccessTimeoutId = window.setTimeout(() => {
        returnToInitialLogin(email, successMessage);
      }, 1800);
    } catch (error) {
      console.error('Erro inesperado ao solicitar a redefinição de senha.', error);
      setPasswordResetFeedback('Erro ao enviar o link. Tente novamente.', 'is-error');
    } finally {
      setPasswordResetLoadingState(false);
    }
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setSignupFeedback('', '');

    const fullName = signupNameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value;
    const confirmPassword = signupConfirmInput.value;

    if (!fullName) {
      setSignupFeedback('O nome completo é obrigatório.', 'is-error');
      signupNameInput.focus();
      return;
    }

    if (!email) {
      setSignupFeedback('O e-mail é obrigatório.', 'is-error');
      signupEmailInput.focus();
      return;
    }

    if (!password) {
      setSignupFeedback('A senha é obrigatória.', 'is-error');
      signupPasswordInput.focus();
      return;
    }

    if (password.length < 6) {
      setSignupFeedback('A senha deve ter no mínimo 6 caracteres.', 'is-error');
      signupPasswordInput.focus();
      return;
    }

    if (confirmPassword !== password) {
      setSignupFeedback('A confirmação de senha deve ser igual à senha.', 'is-error');
      signupConfirmInput.focus();
      return;
    }

    setSignupLoadingState(true);

    try {
      const { data, error, meta } = await authService.registerUser(fullName, email, password);

      if (error) {
        const errorMessage = String(error.message || '');

        if (error.code === 'user_already_registered') {
          setSignupFeedback('Este e-mail já está cadastrado.', 'is-error');
          signupEmailInput.focus();
          return;
        }

        if (/weak password|password/i.test(errorMessage)) {
          setSignupFeedback('Senha muito fraca. Use pelo menos 6 caracteres.', 'is-error');
          signupPasswordInput.focus();
          return;
        }

        setSignupFeedback(errorMessage || 'Erro ao criar conta. Tente novamente.', 'is-error');
        return;
      }

      if (data && data.session) {
        try {
          await authService.logoutUser();
        } catch (logoutError) {
          console.error('Não foi possível encerrar a sessão criada no cadastro.', logoutError);
        }
      }

      signupForm.reset();

      if (meta && meta.needsEmailConfirmation) {
        setSignupFeedback(
          'Conta criada com sucesso! Verifique seu e-mail antes de entrar.',
          'is-success',
        );
        clearSignupSuccessRedirect();
        signupSuccessTimeoutId = window.setTimeout(() => {
          returnToInitialLogin(
            email,
            'Conta criada com sucesso! Verifique seu e-mail antes de entrar.',
          );
        }, 1800);
        return;
      }

      if (meta && meta.profileError) {
        console.warn('Perfil ainda não pôde ser salvo no cadastro.', meta.profileError);
      }

      setSignupFeedback('Conta criada com sucesso! Você já pode fazer login.', 'is-success');
      clearSignupSuccessRedirect();
      signupSuccessTimeoutId = window.setTimeout(() => {
        returnToInitialLogin(
          email,
          'Conta criada com sucesso! Você já pode fazer login.',
        );
      }, 1800);
    } catch (error) {
      console.error('Erro inesperado ao tentar criar a conta.', error);
      setSignupFeedback('Erro ao criar conta. Tente novamente.', 'is-error');
    } finally {
      setSignupLoadingState(false);
    }
  });
});
