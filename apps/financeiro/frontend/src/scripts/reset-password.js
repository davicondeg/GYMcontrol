document.addEventListener('DOMContentLoaded', async () => {
  const authService = window.GestorFinanceiroAuthService;
  const recoveryWaitingState = document.getElementById('recovery-waiting-state');
  const recoveryForm = document.getElementById('recovery-form');
  const recoveryFeedback = document.getElementById('recovery-feedback');
  const recoveryFormFeedback = document.getElementById('recovery-form-feedback');
  const recoverySubmitButton = document.getElementById('recovery-submit-button');
  const recoveryNewPasswordInput = document.getElementById('new-password');
  const recoveryConfirmPasswordInput = document.getElementById('confirm-new-password');
  const backToLoginRecoveryButton = document.getElementById('back-to-login-recovery');

  if (
    !authService ||
    !recoveryWaitingState ||
    !recoveryForm ||
    !recoveryFeedback ||
    !recoveryFormFeedback ||
    !recoverySubmitButton ||
    !recoveryNewPasswordInput ||
    !recoveryConfirmPasswordInput ||
    !backToLoginRecoveryButton
  ) {
    console.error('Campos obrigatórios da tela de redefinição de senha não foram encontrados.');
    return;
  }

  const recoveryUrl = new URL(window.location.href);
  const recoverySearchParams = recoveryUrl.searchParams;
  const recoveryHash = recoveryUrl.hash || '';
  const recoveryLinkDetected = Boolean(
    recoverySearchParams.get('type') === 'recovery'
      || recoverySearchParams.has('code')
      || recoverySearchParams.has('token_hash')
      || recoverySearchParams.has('access_token')
      || recoveryHash.includes('type=recovery')
      || recoveryHash.includes('token_hash=')
      || recoveryHash.includes('access_token=')
  );

  let recoveryActive = false;
  let recoveryBootstrapAttempts = 0;
  let recoveryBootstrapTimeoutId = null;
  let recoverySubscription = null;
  let recoveryUserEmail = '';

  function setRecoveryFeedback(message, type) {
    recoveryFeedback.textContent = message;
    recoveryFeedback.className = 'form-feedback';

    if (type) {
      recoveryFeedback.classList.add(type);
    }
  }

  function setRecoveryFormFeedback(message, type) {
    recoveryFormFeedback.textContent = message;
    recoveryFormFeedback.className = 'form-feedback';

    if (type) {
      recoveryFormFeedback.classList.add(type);
    }
  }

  function setRecoveryLoadingState(isLoading) {
    recoverySubmitButton.disabled = isLoading;
    recoverySubmitButton.textContent = isLoading ? 'ATUALIZANDO...' : 'Atualizar senha';
  }

  function clearRecoveryBootstrapRetry() {
    if (recoveryBootstrapTimeoutId) {
      window.clearTimeout(recoveryBootstrapTimeoutId);
      recoveryBootstrapTimeoutId = null;
    }
  }

  function showWaitingState(message) {
    recoveryActive = false;
    recoveryWaitingState.hidden = false;
    recoveryForm.hidden = true;
    setRecoveryFeedback(message || '', '');
    setRecoveryFormFeedback('', '');
  }

  function showRecoveryForm(message) {
    clearRecoveryBootstrapRetry();
    recoveryActive = true;
    recoveryWaitingState.hidden = true;
    recoveryForm.hidden = false;
    setRecoveryFeedback(message || 'Defina sua nova senha para concluir a recuperação.', '');
    setRecoveryFormFeedback('', '');

    window.requestAnimationFrame(() => {
      recoveryNewPasswordInput.focus();
    });
  }

  function cleanupAndGoToLogin() {
    clearRecoveryBootstrapRetry();

    if (recoverySubscription) {
      try {
        recoverySubscription.unsubscribe();
      } catch (error) {
        console.warn('Nao foi possivel encerrar a assinatura da recuperacao.', error);
      }

      recoverySubscription = null;
    }

    const loginUrl = new URL('./login.html', window.location.href);
    loginUrl.searchParams.set('password-reset', 'updated');

    if (recoveryUserEmail) {
      loginUrl.searchParams.set('email', recoveryUserEmail);
    }

    window.location.href = loginUrl.toString();
  }

  async function tryEnableRecoveryForm() {
    if (!recoveryLinkDetected || recoveryActive) {
      return;
    }

    try {
      const { data, error } = await authService.getSession();

      if (error) {
        console.warn('Nao foi possivel consultar a sessao de recuperacao.', error);
      }

      if (data && data.session) {
        recoveryUserEmail = String(data.session.user && data.session.user.email ? data.session.user.email : recoveryUserEmail);
        showRecoveryForm('Agora você pode definir sua nova senha.');
        return;
      }

      recoveryBootstrapAttempts += 1;

      if (recoveryBootstrapAttempts < 4) {
        clearRecoveryBootstrapRetry();
        recoveryBootstrapTimeoutId = window.setTimeout(tryEnableRecoveryForm, 500);
        return;
      }

      setRecoveryFeedback(
        'Não foi possível validar o link de recuperação. Abra o e-mail novamente.',
        'is-error',
      );
    } catch (error) {
      console.error('Erro inesperado ao consultar a sessão de recuperação.', error);
      setRecoveryFeedback(
        'Não foi possível validar o link de recuperação. Tente abrir o e-mail novamente.',
        'is-error',
      );
    }
  }

  if (!recoveryLinkDetected) {
    showWaitingState('Abra o link recebido por e-mail para liberar a redefinição.');
  } else {
    showWaitingState('Aguardando a confirmação do link de recuperação...');
    tryEnableRecoveryForm();
  }

  recoverySubscription = authService.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
      recoveryUserEmail = String(session.user && session.user.email ? session.user.email : recoveryUserEmail);
      showRecoveryForm('Agora você pode definir sua nova senha.');
    }
  }).data.subscription;

  backToLoginRecoveryButton.addEventListener('click', () => {
    window.location.href = './login.html';
  });

  recoveryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setRecoveryFormFeedback('', '');

    if (!recoveryActive) {
      setRecoveryFormFeedback(
        'Abra o link de recuperação recebido por e-mail antes de continuar.',
        'is-error',
      );
      return;
    }

    const newPassword = recoveryNewPasswordInput.value;
    const confirmPassword = recoveryConfirmPasswordInput.value;

    if (!newPassword) {
      setRecoveryFormFeedback('A nova senha é obrigatória.', 'is-error');
      recoveryNewPasswordInput.focus();
      return;
    }

    if (newPassword.length < 6) {
      setRecoveryFormFeedback('A nova senha deve ter no mínimo 6 caracteres.', 'is-error');
      recoveryNewPasswordInput.focus();
      return;
    }

    if (confirmPassword !== newPassword) {
      setRecoveryFormFeedback('A confirmação da nova senha deve ser igual à senha.', 'is-error');
      recoveryConfirmPasswordInput.focus();
      return;
    }

    setRecoveryLoadingState(true);

    try {
      const { error } = await authService.updatePassword(newPassword);

      if (error) {
        setRecoveryFormFeedback(
          error.message || 'Não foi possível atualizar sua senha. Tente novamente.',
          'is-error',
        );
        recoveryNewPasswordInput.focus();
        return;
      }

      setRecoveryFormFeedback('Senha atualizada com sucesso. Redirecionando para o login...', 'is-success');
      recoveryForm.reset();

      window.setTimeout(async () => {
        try {
          await authService.logoutUser();
        } catch (logoutError) {
          console.warn('Nao foi possivel encerrar a sessao apos redefinir a senha.', logoutError);
        }

        cleanupAndGoToLogin();
      }, 1200);
    } catch (error) {
      console.error('Erro inesperado ao atualizar a senha.', error);
      setRecoveryFormFeedback('Erro ao atualizar a senha. Tente novamente.', 'is-error');
    } finally {
      setRecoveryLoadingState(false);
    }
  });
});
