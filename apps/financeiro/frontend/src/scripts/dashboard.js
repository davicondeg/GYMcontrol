document.addEventListener('DOMContentLoaded', async () => {
  console.log('Dashboard JS carregado');

  const authService = window.GestorFinanceiroAuthService;
  const financeDataService = window.GestorFinanceiroDataService;
  const data = window.GestorFinanceiroDashboardData;
  const components = window.GestorFinanceiroDashboardComponents;
  const userLabel = document.getElementById('dashboard-user');
  const userAvatar = document.getElementById('dashboard-user-avatar');
  const userAvatarImage = document.getElementById('dashboard-user-avatar-image');
  const userAvatarFallback = document.getElementById('dashboard-user-avatar-fallback');
  const profileMenuButton = document.getElementById('profile-menu-button');
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileDropdownOpen = document.getElementById('profile-dropdown-open');
  const profileDropdownSettings = document.getElementById('profile-dropdown-settings');
  const dashboardView = document.getElementById('dashboard-view');
  const transactionsView = document.getElementById('transactions-view');
  const recurrencesView = document.getElementById('recurrences-view');
  const cardsView = document.getElementById('cards-view');
  const reportsView = document.getElementById('reports-view');
  const categoriesView = document.getElementById('categories-view');
  const kpiGrid = document.getElementById('kpi-grid');
  const transactionList = document.getElementById('transaction-list');
  const logoutButton = document.getElementById('logout-button');
  const btnAddTransaction = document.getElementById('btnAddTransaction');
  const btnAddTransactionModule = document.getElementById('btnAddTransactionModule');
  const btnAddRecurrence = document.getElementById('btnAddRecurrence');
  const btnAddAccount = document.getElementById('btnAddAccount');
  const btnCreateFirstAccount = document.getElementById('btnCreateFirstAccount');
  const btnAddManagedCategory = document.getElementById('btnAddManagedCategory');
  const btnCreateFirstManagedCategory = document.getElementById('btnCreateFirstManagedCategory');
  const dashboardNavButtons = Array.from(document.querySelectorAll('[data-dashboard-nav]'));
  const dashboardNavFeedback = document.getElementById('dashboard-nav-feedback');
  const transactionsSection = document.getElementById('transactions-section');
  const filterButtons = Array.from(document.querySelectorAll('[data-transaction-filter]'));
  const transactionsSummaryGrid = document.getElementById('transactions-summary-grid');
  const moduleTypeFilterButtons = Array.from(document.querySelectorAll('[data-module-type-filter]'));
  const transactionsPeriodFilter = document.getElementById('transactions-period-filter');
  const transactionsCategoryFilter = document.getElementById('transactions-category-filter');
  const transactionsSearchFilter = document.getElementById('transactions-search-filter');
  const transactionsTableWrap = document.getElementById('transactions-table-wrap');
  const transactionsTableBody = document.getElementById('transactions-table-body');
  const transactionsEmptyState = document.getElementById('transactions-empty-state');
  const btnAddCard = document.getElementById('btnAddCard');
  const cardsList = document.getElementById('cards-list');
  const cardsEmptyState = document.getElementById('cards-empty-state');
  const currentCardTitle = document.getElementById('current-card-title');
  const currentInvoiceStatus = document.getElementById('current-invoice-status');
  const currentInvoiceHighlight = document.getElementById('current-invoice-highlight');
  const currentInvoiceList = document.getElementById('current-invoice-list');
  const currentInvoiceEmptyState = document.getElementById('current-invoice-empty-state');
  const markInvoicePaidButton = document.getElementById('mark-invoice-paid-button');
  const invoiceMonthFilter = document.getElementById('invoice-month-filter');
  const invoiceDetailSummary = document.getElementById('invoice-detail-summary');
  const invoiceMonths = document.getElementById('invoice-months');
  const invoiceDetailWrap = document.getElementById('invoice-detail-wrap');
  const invoiceDetailBody = document.getElementById('invoice-detail-body');
  const invoiceDetailEmptyState = document.getElementById('invoice-detail-empty-state');
  const accountsSummaryGrid = document.getElementById('accounts-summary-grid');
  const accountsList = document.getElementById('accounts-list');
  const accountsEmptyState = document.getElementById('accounts-empty-state');
  const btnExportReport = document.getElementById('btnExportReport');
  const btnReportsEmptyAction = document.getElementById('btnReportsEmptyAction');
  const reportsPeriodFilter = document.getElementById('reports-period-filter');
  const reportsTypeFilter = document.getElementById('reports-type-filter');
  const reportsAccountFilter = document.getElementById('reports-account-filter');
  const reportsCategoryFilter = document.getElementById('reports-category-filter');
  const reportsSummaryGrid = document.getElementById('reports-summary-grid');
  const reportsContentGrid = document.getElementById('reports-content-grid');
  const reportsEmptyState = document.getElementById('reports-empty-state');
  const reportsChartBars = document.getElementById('reports-chart-bars');
  const reportsChartEmptyState = document.getElementById('reports-chart-empty-state');
  const reportsCategoryBreakdown = document.getElementById('reports-category-breakdown');
  const reportsAccountBreakdown = document.getElementById('reports-account-breakdown');
  const reportsCreditBreakdown = document.getElementById('reports-credit-breakdown');
  const reportsInsightsList = document.getElementById('reports-insights-list');
  const reportsTableWrap = document.getElementById('reports-table-wrap');
  const reportsTableBody = document.getElementById('reports-table-body');
  const managedCategoryFilterButtons = Array.from(document.querySelectorAll('[data-managed-category-filter]'));
  const categoriesSummaryGrid = document.getElementById('categories-summary-grid');
  const categoriesGrid = document.getElementById('categories-grid');
  const categoriesEmptyState = document.getElementById('categories-empty-state');
  const recurrenceFilterButtons = Array.from(document.querySelectorAll('[data-recurrence-filter]'));
  const recurrencesSummaryGrid = document.getElementById('recurrences-summary-grid');
  const recurrencesTableWrap = document.getElementById('recurrences-table-wrap');
  const recurrencesTableBody = document.getElementById('recurrences-table-body');
  const recurrencesEmptyState = document.getElementById('recurrences-empty-state');
  const transactionModal = document.getElementById('transaction-modal');
  const transactionForm = document.getElementById('transaction-form');
  const transactionModalTitle = document.getElementById('transaction-modal-title');
  const transactionModalDescription = document.getElementById('transaction-modal-description');
  const transactionSubmitButton = document.getElementById('transaction-submit-button');
  const transactionDescriptionInput = document.getElementById('transaction-description');
  const transactionDescriptionCounter = document.getElementById('transaction-description-counter');
  const transactionAmountInput = document.getElementById('transaction-amount');
  const transactionPaymentMethodInput = document.getElementById('transaction-payment-method');
  const transactionCreditFields = document.getElementById('transaction-credit-fields');
  const transactionCardInput = document.getElementById('transaction-card');
  const transactionInstallmentsInput = document.getElementById('transaction-installments');
  const transactionCreditNote = document.getElementById('transaction-credit-note');
  const transactionFirstInvoiceMonthInput = document.getElementById('transaction-first-invoice-month');
  const transactionDueDayInput = document.getElementById('transaction-due-day');
  const transactionPaymentMethodField = transactionPaymentMethodInput
    ? transactionPaymentMethodInput.closest('.form-field')
    : null;
  const transactionCardField = transactionCardInput ? transactionCardInput.closest('.form-field') : null;
  const transactionLegacyCreditGrid = transactionFirstInvoiceMonthInput
    ? transactionFirstInvoiceMonthInput.closest('.credit-form-grid')
    : null;
  const transactionTypeInput = document.getElementById('transaction-type');
  const transactionTypeButtons = Array.from(document.querySelectorAll('[data-transaction-type-option]'));
  const transactionCategoryInput = document.getElementById('transaction-category');
  const btnShowCategoryInput = document.getElementById('btnShowCategoryInput');
  const categoryCreatePanel = document.getElementById('category-create-panel');
  const newCategoryInput = document.getElementById('new-category-name');
  const btnConfirmCategory = document.getElementById('btnConfirmCategory');
  const btnCancelCategory = document.getElementById('btnCancelCategory');
  const categoryCreateFeedback = document.getElementById('category-create-feedback');
  const transactionDateInput = document.getElementById('transaction-date');
  const transactionFeedback = document.getElementById('transaction-form-feedback');
  const closeModalButtons = Array.from(document.querySelectorAll('[data-close-transaction-modal]'));
  const recurrenceModal = document.getElementById('recurrence-modal');
  const recurrenceForm = document.getElementById('recurrence-form');
  const recurrenceModalTitle = document.getElementById('recurrence-modal-title');
  const recurrenceModalDescription = document.getElementById('recurrence-modal-description');
  const recurrenceSubmitButton = document.getElementById('recurrence-submit-button');
  const recurrenceTypeInput = document.getElementById('recurrence-type');
  const recurrenceStatusInput = document.getElementById('recurrence-status');
  const recurrenceTypeButtons = Array.from(document.querySelectorAll('[data-recurrence-type-option]'));
  const recurrenceDescriptionInput = document.getElementById('recurrence-description');
  const recurrenceAmountInput = document.getElementById('recurrence-amount');
  const recurrenceCategoryInput = document.getElementById('recurrence-category');
  const recurrenceDayInput = document.getElementById('recurrence-day');
  const recurrenceFrequencyInput = document.getElementById('recurrence-frequency');
  const recurrenceFeedback = document.getElementById('recurrence-form-feedback');
  const closeRecurrenceModalButtons = Array.from(document.querySelectorAll('[data-close-recurrence-modal]'));
  const cardModal = document.getElementById('card-modal');
  const cardForm = document.getElementById('card-form');
  const cardModalTitle = document.getElementById('card-modal-title');
  const cardModalDescription = document.getElementById('card-modal-description');
  const cardSubmitButton = document.getElementById('card-submit-button');
  const cardNameInput = document.getElementById('card-name');
  const cardLimitInput = document.getElementById('card-limit');
  const cardClosingDayInput = document.getElementById('card-closing-day');
  const cardDueDayInput = document.getElementById('card-due-day');
  const cardFeedback = document.getElementById('card-form-feedback');
  const closeCardModalButtons = Array.from(document.querySelectorAll('[data-close-card-modal]'));
  const accountModal = document.getElementById('account-modal');
  const accountForm = document.getElementById('account-form');
  const accountModalTitle = document.getElementById('account-modal-title');
  const accountModalDescription = document.getElementById('account-modal-description');
  const accountSubmitButton = document.getElementById('account-submit-button');
  const accountNameInput = document.getElementById('account-name');
  const accountTypeInput = document.getElementById('account-type');
  const accountBalanceInput = document.getElementById('account-balance');
  const accountInstitutionInput = document.getElementById('account-institution');
  const accountColorInput = document.getElementById('account-color');
  const accountIconInput = document.getElementById('account-icon');
  const accountStatusInput = document.getElementById('account-status');
  const accountCreditFields = document.getElementById('account-credit-fields');
  const accountCreditLimitInput = document.getElementById('account-credit-limit');
  const accountClosingDayInput = document.getElementById('account-closing-day');
  const accountDueDayInput = document.getElementById('account-due-day');
  const accountLinkedPaymentInput = document.getElementById('account-linked-payment');
  const accountFeedback = document.getElementById('account-form-feedback');
  const closeAccountModalButtons = Array.from(document.querySelectorAll('[data-close-account-modal]'));
  const accountDetailModal = document.getElementById('account-detail-modal');
  const accountDetailBody = document.getElementById('account-detail-body');
  const accountDetailTitle = document.getElementById('account-detail-title');
  const accountDetailDescription = document.getElementById('account-detail-description');
  const closeAccountDetailModalButtons = Array.from(document.querySelectorAll('[data-close-account-detail-modal]'));
  const categoryManagerModal = document.getElementById('category-manager-modal');
  const categoryManagerForm = document.getElementById('category-manager-form');
  const categoryManagerModalTitle = document.getElementById('category-manager-modal-title');
  const categoryManagerModalDescription = document.getElementById('category-manager-modal-description');
  const categoryManagerSubmitButton = document.getElementById('category-manager-submit-button');
  const managedCategoryNameInput = document.getElementById('managed-category-name');
  const managedCategoryTypeInput = document.getElementById('managed-category-type');
  const managedCategoryIconInput = document.getElementById('managed-category-icon');
  const managedCategoryColorInput = document.getElementById('managed-category-color');
  const managedCategoryStatusInput = document.getElementById('managed-category-status');
  const managedCategoryDescriptionInput = document.getElementById('managed-category-description');
  const categoryManagerFeedback = document.getElementById('category-manager-feedback');
  const closeCategoryManagerModalButtons = Array.from(document.querySelectorAll('[data-close-category-manager-modal]'));
  const categoryDetailModal = document.getElementById('category-detail-modal');
  const categoryDetailTitle = document.getElementById('category-detail-title');
  const categoryDetailDescription = document.getElementById('category-detail-description');
  const categoryDetailBody = document.getElementById('category-detail-body');
  const closeCategoryDetailModalButtons = Array.from(document.querySelectorAll('[data-close-category-detail-modal]'));
  const profileModal = document.getElementById('profile-modal');
  const profileForm = document.getElementById('profile-form');
  const profileModalTitle = document.getElementById('profile-modal-title');
  const profileModalDescription = document.getElementById('profile-modal-description');
  const profileNameInput = document.getElementById('profile-name');
  const profileEmailInput = document.getElementById('profile-email');
  const profilePhotoInput = document.getElementById('profile-photo-input');
  const profileUploadTrigger = document.getElementById('profile-upload-trigger');
  const profileAvatarPreview = document.getElementById('profile-avatar-preview');
  const profileAvatarImage = document.getElementById('profile-avatar-image');
  const profileAvatarFallback = document.getElementById('profile-avatar-fallback');
  const profileFormFeedback = document.getElementById('profile-form-feedback');
  const closeProfileModalButtons = Array.from(document.querySelectorAll('[data-close-profile-modal]'));
  const profilePasswordForm = document.getElementById('profile-password-form');
  const profileCurrentPasswordInput = document.getElementById('profile-current-password');
  const profileNewPasswordInput = document.getElementById('profile-new-password');
  const profileConfirmPasswordInput = document.getElementById('profile-confirm-password');
  const profilePasswordFeedback = document.getElementById('profile-password-feedback');
  const transactionsSource = Array.isArray(data && data.transactions) ? data.transactions : [];
  const installmentsSource = Array.isArray(data && data.installments) ? data.installments : [];
  const cardsSource = Array.isArray(data && data.cards) ? data.cards : [];
  const accountsSource = Array.isArray(data && data.accounts) ? data.accounts : [];
  const accountActivitiesSource = Array.isArray(data && data.accountActivities)
    ? data.accountActivities
    : [];
  const categoryCatalogSource = Array.isArray(data && data.categoryCatalog)
    ? data.categoryCatalog
    : [];
  const categoryActivitiesSource = Array.isArray(data && data.categoryActivities)
    ? data.categoryActivities
    : [];
  const reportTransactionsSource = Array.isArray(data && data.reportTransactions)
    ? data.reportTransactions
    : [];
  const recurrencesSource = Array.isArray(data && data.recurringTransactions)
    ? data.recurringTransactions
    : [];

  let transactions = transactionsSource.map((transaction) => ({ ...transaction }));
  let installments = installmentsSource.map((installment) => ({ ...installment }));
  let cards = cardsSource.map((card) => ({ ...card }));
  let accounts = accountsSource.map((account) => ({ ...account }));
  let accountActivities = accountActivitiesSource.map((activity) => ({ ...activity }));
  let categoryActivities = categoryActivitiesSource.map((activity) => ({ ...activity }));
  let reportTransactions = reportTransactionsSource.map((transaction) => ({ ...transaction }));
  let recurrences = recurrencesSource.map((recurrence) => ({ ...recurrence }));
  let categories = [];
  let currentFilter = 'all';
  let currentDashboardView = 'dashboard';
  let currentRecurrenceFilter = 'all';
  let currentManagedCategoryFilter = 'all';
  let modalMode = 'create';
  let editingTransactionId = null;
  let lastModalTrigger = null;
  let transactionIdCounter = transactions.length;
  let recurrenceModalMode = 'create';
  let editingRecurrenceId = null;
  let lastRecurrenceModalTrigger = null;
  let recurrenceIdCounter = recurrences.length;
  let cardModalMode = 'create';
  let editingCardId = null;
  let lastCardModalTrigger = null;
  let cardIdCounter = cards.length;
  let selectedCardId = cards[0] ? cards[0].id : null;
  let selectedInvoiceMonth = null;
  let accountModalMode = 'create';
  let editingAccountId = null;
  let lastAccountModalTrigger = null;
  let viewingAccountId = null;
  let accountIdCounter = accounts.length;
  let categoryManagerModalMode = 'create';
  let editingManagedCategoryId = null;
  let lastCategoryManagerModalTrigger = null;
  let viewingManagedCategoryId = null;
  let lastProfileModalTrigger = null;
  let profileState = {
    name: '',
    email: '',
    photo: '',
    pendingPhoto: '',
  };
  let transactionsViewFilters = {
    type: 'all',
    period: 'month',
    category: 'all',
    search: '',
  };
  let reportsViewFilters = {
    period: 'month',
    type: 'all',
    account: 'all',
    category: 'all',
  };
  console.log('Botão adicionar transação encontrado:', btnAddTransaction);
  console.log('Botão adicionar transação do módulo encontrado:', btnAddTransactionModule);
  console.log('Botão nova recorrência encontrado:', btnAddRecurrence);
  console.log('Botão novo cartão encontrado:', btnAddCard);
  console.log('Botão nova conta encontrado:', btnAddAccount);
  console.log('Botão nova categoria encontrado:', btnAddManagedCategory);

  if (!btnAddTransaction) {
    console.warn('Botão Adicionar transação não encontrado no dashboard.');
  }

  if (!btnAddTransactionModule) {
    console.warn('Botão Adicionar transação do módulo não encontrado.');
  }

  if (!btnAddRecurrence) {
    console.warn('Botão Nova recorrência não encontrado.');
  }

  if (!btnAddCard) {
    console.warn('Botão Novo cartão não encontrado.');
  }

  if (!btnAddAccount) {
    console.warn('Botão Nova conta não encontrado.');
  }

  if (!btnAddManagedCategory) {
    console.warn('Botão Nova categoria não encontrado.');
  }

  if (
    !authService ||
    !financeDataService ||
    !data ||
    !components ||
    !userLabel ||
    !dashboardView ||
    !userAvatar ||
    !userAvatarImage ||
    !userAvatarFallback ||
    !profileMenuButton ||
    !profileDropdown ||
    !profileDropdownOpen ||
    !profileDropdownSettings ||
    !transactionsView ||
    !recurrencesView ||
    !cardsView ||
    !reportsView ||
    !categoriesView ||
    !kpiGrid ||
    !transactionList ||
    !logoutButton ||
    !btnAddTransaction ||
    !btnAddTransactionModule ||
    !btnAddRecurrence ||
    !btnAddCard ||
    !btnAddManagedCategory ||
    !btnCreateFirstManagedCategory ||
    dashboardNavButtons.length === 0 ||
    !dashboardNavFeedback ||
    !transactionsSection ||
    filterButtons.length === 0 ||
    !transactionsSummaryGrid ||
    moduleTypeFilterButtons.length === 0 ||
    !transactionsPeriodFilter ||
    !transactionsCategoryFilter ||
    !transactionsSearchFilter ||
    !transactionsTableWrap ||
    !transactionsTableBody ||
    !transactionsEmptyState ||
    !cardsList ||
    !cardsEmptyState ||
    !currentCardTitle ||
    !currentInvoiceStatus ||
    !currentInvoiceHighlight ||
    !currentInvoiceList ||
    !currentInvoiceEmptyState ||
    !markInvoicePaidButton ||
    !invoiceMonthFilter ||
    !invoiceDetailSummary ||
    !invoiceMonths ||
    !invoiceDetailWrap ||
    !invoiceDetailBody ||
    !invoiceDetailEmptyState ||
    !btnExportReport ||
    !btnReportsEmptyAction ||
    !reportsPeriodFilter ||
    !reportsTypeFilter ||
    !reportsAccountFilter ||
    !reportsCategoryFilter ||
    !reportsSummaryGrid ||
    !reportsContentGrid ||
    !reportsEmptyState ||
    !reportsChartBars ||
    !reportsChartEmptyState ||
    !reportsCategoryBreakdown ||
    !reportsAccountBreakdown ||
    !reportsCreditBreakdown ||
    !reportsInsightsList ||
    !reportsTableWrap ||
    !reportsTableBody ||
    managedCategoryFilterButtons.length === 0 ||
    !categoriesSummaryGrid ||
    !categoriesGrid ||
    !categoriesEmptyState ||
    recurrenceFilterButtons.length === 0 ||
    !recurrencesSummaryGrid ||
    !recurrencesTableWrap ||
    !recurrencesTableBody ||
    !recurrencesEmptyState ||
    !transactionModal ||
    !transactionForm ||
    !transactionModalTitle ||
    !transactionModalDescription ||
    !transactionSubmitButton ||
    !transactionDescriptionInput ||
    !transactionDescriptionCounter ||
    !transactionAmountInput ||
    !transactionPaymentMethodInput ||
    !transactionCreditFields ||
    !transactionCardInput ||
    !transactionInstallmentsInput ||
    !transactionCreditNote ||
    !transactionFirstInvoiceMonthInput ||
    !transactionDueDayInput ||
    !transactionTypeInput ||
    transactionTypeButtons.length === 0 ||
    !transactionCategoryInput ||
    !btnShowCategoryInput ||
    !categoryCreatePanel ||
    !newCategoryInput ||
    !btnConfirmCategory ||
    !btnCancelCategory ||
    !categoryCreateFeedback ||
    !transactionDateInput ||
    !transactionFeedback ||
    closeModalButtons.length === 0 ||
    !recurrenceModal ||
    !recurrenceForm ||
    !recurrenceModalTitle ||
    !recurrenceModalDescription ||
    !recurrenceSubmitButton ||
    !recurrenceTypeInput ||
    !recurrenceStatusInput ||
    recurrenceTypeButtons.length === 0 ||
    !recurrenceDescriptionInput ||
    !recurrenceAmountInput ||
    !recurrenceCategoryInput ||
    !recurrenceDayInput ||
    !recurrenceFrequencyInput ||
    !recurrenceFeedback ||
    closeRecurrenceModalButtons.length === 0 ||
    !cardModal ||
    !cardForm ||
    !cardModalTitle ||
    !cardModalDescription ||
    !cardSubmitButton ||
    !cardNameInput ||
    !cardLimitInput ||
    !cardClosingDayInput ||
    !cardDueDayInput ||
    !cardFeedback ||
    closeCardModalButtons.length === 0 ||
    !accountModal ||
    !accountForm ||
    !accountModalTitle ||
    !accountModalDescription ||
    !accountSubmitButton ||
    !accountNameInput ||
    !accountTypeInput ||
    !accountBalanceInput ||
    !accountInstitutionInput ||
    !accountColorInput ||
    !accountIconInput ||
    !accountStatusInput ||
    !accountCreditFields ||
    !accountCreditLimitInput ||
    !accountClosingDayInput ||
    !accountDueDayInput ||
    !accountLinkedPaymentInput ||
    !accountFeedback ||
    closeAccountModalButtons.length === 0 ||
    !accountDetailModal ||
    !accountDetailBody ||
    !accountDetailTitle ||
    !accountDetailDescription ||
    closeAccountDetailModalButtons.length === 0 ||
    !categoryManagerModal ||
    !categoryManagerForm ||
    !categoryManagerModalTitle ||
    !categoryManagerModalDescription ||
    !categoryManagerSubmitButton ||
    !managedCategoryNameInput ||
    !managedCategoryTypeInput ||
    !managedCategoryIconInput ||
    !managedCategoryColorInput ||
    !managedCategoryStatusInput ||
    !managedCategoryDescriptionInput ||
    !categoryManagerFeedback ||
    closeCategoryManagerModalButtons.length === 0 ||
    !categoryDetailModal ||
    !categoryDetailTitle ||
    !categoryDetailDescription ||
    !categoryDetailBody ||
    closeCategoryDetailModalButtons.length === 0 ||
    !profileModal ||
    !profileForm ||
    !profileModalTitle ||
    !profileModalDescription ||
    !profileNameInput ||
    !profileEmailInput ||
    !profilePhotoInput ||
    !profileUploadTrigger ||
    !profileAvatarPreview ||
    !profileAvatarImage ||
    !profileAvatarFallback ||
    !profileFormFeedback ||
    closeProfileModalButtons.length === 0 ||
    !profilePasswordForm ||
    !profileCurrentPasswordInput ||
    !profileNewPasswordInput ||
    !profileConfirmPasswordInput ||
    !profilePasswordFeedback
  ) {
    console.error('Estrutura do dashboard nao encontrada.');
    return;
  }

  if (transactionCardField) {
    transactionCardField.hidden = true;
  }

  if (transactionLegacyCreditGrid) {
    transactionLegacyCreditGrid.hidden = true;
  }

  function getUserDisplayName(user) {
    const metadata = user && user.user_metadata ? user.user_metadata : {};
    const profileName = String(metadata.name || metadata.full_name || '').trim();

    if (profileName) {
      return profileName;
    }

    return String((user && user.email) || data.userName || 'Usuário').trim();
  }

  function getUserInitials(displayName) {
    const parts = String(displayName || '')
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return 'US';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }

  function updateAvatarPresentation(imageElement, fallbackElement, value, displayName) {
    const safeInitials = getUserInitials(displayName);

    if (value) {
      imageElement.src = value;
      imageElement.hidden = false;
      fallbackElement.hidden = true;
      fallbackElement.textContent = safeInitials;
      return;
    }

    imageElement.removeAttribute('src');
    imageElement.hidden = true;
    fallbackElement.hidden = false;
    fallbackElement.textContent = safeInitials;
  }

  function renderProfileIdentity() {
    const displayName = profileState.name || 'Usuário';
    userLabel.textContent = `Olá, ${displayName}`;

    updateAvatarPresentation(
      userAvatarImage,
      userAvatarFallback,
      profileState.photo,
      displayName,
    );

    updateAvatarPresentation(
      profileAvatarImage,
      profileAvatarFallback,
      profileState.pendingPhoto || profileState.photo,
      displayName,
    );
  }

  function initializeProfileState(user) {
    const metadata = user && user.user_metadata ? user.user_metadata : {};

    profileState = {
      name: getUserDisplayName(user),
      email: String((user && user.email) || data.userName || 'usuario@email.com').trim(),
      photo: String(metadata.avatar_url || metadata.picture || '').trim(),
      pendingPhoto: '',
    };

    renderProfileIdentity();
  }

  function openProfileDropdown() {
    profileDropdown.hidden = false;
    profileMenuButton.setAttribute('aria-expanded', 'true');
  }

  function closeProfileDropdown() {
    profileDropdown.hidden = true;
    profileMenuButton.setAttribute('aria-expanded', 'false');
  }

  function toggleProfileDropdown() {
    if (profileDropdown.hidden) {
      openProfileDropdown();
      return;
    }

    closeProfileDropdown();
  }

  function setProfileFormFeedback(message, tone) {
    profileFormFeedback.textContent = message;
    profileFormFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      profileFormFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      profileFormFeedback.classList.add('is-success');
    }
  }

  function setProfilePasswordFeedback(message, tone) {
    profilePasswordFeedback.textContent = message;
    profilePasswordFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      profilePasswordFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      profilePasswordFeedback.classList.add('is-success');
    }
  }

  function resetProfilePasswordForm() {
    profilePasswordForm.reset();
    setProfilePasswordFeedback('', 'info');
  }

  function syncProfileForm() {
    profileNameInput.value = profileState.name || '';
    profileEmailInput.value = profileState.email || '';
    profileState.pendingPhoto = '';
    setProfileFormFeedback('', 'info');
    resetProfilePasswordForm();
    renderProfileIdentity();
  }

  function showProfileModal(focusTarget) {
    const safeFocusTarget = focusTarget && typeof focusTarget.focus === 'function'
      ? focusTarget
      : profileNameInput;

    profileModal.hidden = false;
    document.body.classList.add('modal-open');

    window.requestAnimationFrame(() => {
      safeFocusTarget.focus();
    });
  }

  function closeProfileModal(options = {}) {
    const { restoreFocus = true } = options;

    profileModal.hidden = true;
    document.body.classList.remove('modal-open');
    profilePhotoInput.value = '';
    profileState.pendingPhoto = '';
    renderProfileIdentity();
    resetProfilePasswordForm();
    setProfileFormFeedback('', 'info');

    if (restoreFocus && lastProfileModalTrigger && document.contains(lastProfileModalTrigger)) {
      lastProfileModalTrigger.focus();
    }

    lastProfileModalTrigger = null;
  }

  function openProfileModal(triggerButton = profileMenuButton) {
    lastProfileModalTrigger = triggerButton || profileMenuButton;
    closeProfileDropdown();
    syncProfileForm();
    showProfileModal(profileNameInput);
  }

  function handleProfilePhotoSelection(file) {
    if (!file) {
      profileState.pendingPhoto = '';
      renderProfileIdentity();
      return;
    }

    const supportedTypes = ['image/jpeg', 'image/png'];

    if (!supportedTypes.includes(file.type)) {
      setProfileFormFeedback('Selecione uma imagem JPG ou PNG.', 'error');
      profilePhotoInput.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      profileState.pendingPhoto = typeof reader.result === 'string' ? reader.result : '';
      renderProfileIdentity();
      setProfileFormFeedback('Preview da foto carregado. Salve para confirmar a alteração.', 'success');
    };

    reader.onerror = () => {
      setProfileFormFeedback('Não foi possível carregar a imagem selecionada.', 'error');
    };

    reader.readAsDataURL(file);
  }

  async function handleLogout() {
    try {
      await authService.logoutUser();
    } catch (error) {
      console.error('Não foi possível encerrar a sessão.', error);
    }

    window.location.href = './login.html';
  }

  function formatDate(isoDate) {
    if (!isoDate || typeof isoDate !== 'string') {
      return '';
    }

    const parts = isoDate.split('-');

    if (parts.length !== 3) {
      return isoDate;
    }

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  function parseISODate(isoDate) {
    if (!isoDate || typeof isoDate !== 'string') {
      return null;
    }

    const [year, month, day] = isoDate.split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  function getTodayDate() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
  }

  function createTransactionId() {
    transactionIdCounter += 1;
    return `tx-${Date.now()}-${transactionIdCounter}`;
  }

  function createInstallmentId() {
    return `inst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function createRecurrenceId() {
    recurrenceIdCounter += 1;
    return `rc-${Date.now()}-${recurrenceIdCounter}`;
  }

  function createCardId() {
    cardIdCounter += 1;
    return `card-${Date.now()}-${cardIdCounter}`;
  }

  function createAccountId() {
    accountIdCounter += 1;
    return `acc-${Date.now()}-${accountIdCounter}`;
  }

  function normalizeTransactionType(type) {
    const normalizedType = String(type || '').toLowerCase();

    if (normalizedType === 'receita' || normalizedType === 'income') {
      return 'receita';
    }

    if (normalizedType === 'despesa' || normalizedType === 'expense') {
      return 'despesa';
    }

    return normalizedType;
  }

  function normalizeCategoryName(categoryName) {
    return String(categoryName || '').trim().replace(/\s+/g, ' ');
  }

  function normalizeSearchTerm(value) {
    return String(value || '').trim().toLocaleLowerCase('pt-BR');
  }

  function formatMonthLabel(monthValue) {
    if (!monthValue) {
      return '';
    }

    const [year, month] = String(monthValue).split('-').map(Number);

    if (!year || !month) {
      return monthValue;
    }

    return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function getCurrentMonthValue() {
    return getTodayDate().slice(0, 7);
  }

  function addMonthsToMonthValue(monthValue, offset) {
    const [year, month] = String(monthValue).split('-').map(Number);

    if (!year || !month) {
      return monthValue;
    }

    const nextDate = new Date(year, month - 1 + offset, 1);
    const normalizedMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    return `${nextDate.getFullYear()}-${normalizedMonth}`;
  }

  function normalizeRecurrenceStatus(status) {
    const normalizedStatus = String(status || '').toLowerCase();

    if (normalizedStatus === 'active' || normalizedStatus === 'ativa') {
      return 'active';
    }

    if (normalizedStatus === 'paused' || normalizedStatus === 'pausada') {
      return 'paused';
    }

    return normalizedStatus;
  }

  function normalizeAccountType(type) {
    const normalizedType = String(type || '').toLowerCase();
    const allowedTypes = ['checking', 'savings', 'wallet', 'digital_account', 'credit_card'];
    return allowedTypes.includes(normalizedType) ? normalizedType : 'checking';
  }

  function normalizeAccountStatus(status) {
    return String(status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active';
  }

  function normalizeManagedCategoryStatus(status) {
    return String(status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active';
  }

  function getManagedCategoryTypeLabel(type) {
    return String(type || '').toLowerCase() === 'income' ? 'Receita' : 'Despesa';
  }

  function isCreditAccount(account) {
    return normalizeAccountType(account && account.type) === 'credit_card';
  }

  function getAccountTypeLabel(type) {
    const typeMap = {
      checking: 'Conta corrente',
      savings: 'Poupanca',
      wallet: 'Carteira',
      digital_account: 'Conta digital',
      credit_card: 'Cartao de credito',
    };

    return typeMap[normalizeAccountType(type)] || 'Conta';
  }

  function getAccountById(accountId) {
    return accounts.find((account) => account.id === accountId) || null;
  }

  function getNonCreditAccounts() {
    return accounts.filter((account) => !isCreditAccount(account));
  }

  function getAccountActivitiesById(accountId) {
    return accountActivities
      .filter((activity) => activity.accountId === accountId)
      .sort((first, second) => String(second.date || '').localeCompare(String(first.date || '')));
  }

  function getAccountAvailableLimit(account) {
    const creditLimit = Number(account.creditLimit || 0);
    const creditUsed = Number(account.creditUsed || 0);
    return Math.max(creditLimit - creditUsed, 0);
  }

  function getCategoryTypeFromTransactionType(transactionType) {
    return normalizeTransactionType(transactionType) === 'receita' ? 'income' : 'expense';
  }

  function getTransactionTypeFromCategoryType(categoryType) {
    return String(categoryType || '').toLowerCase() === 'income' ? 'receita' : 'despesa';
  }

  function createCategoryId(categoryName, categoryType) {
    const normalizedName = normalizeCategoryName(categoryName)
      .toLocaleLowerCase('pt-BR')
      .replace(/\s+/g, '-');

    return `${categoryType}-${normalizedName}`;
  }

  function compareCategoryEntries(first, second) {
    return first.name.localeCompare(second.name, 'pt-BR');
  }

  function createCategoryEntry(categoryName, categoryType) {
    const normalizedName = normalizeCategoryName(categoryName);
    const normalizedType = String(categoryType || '').toLowerCase();
    const defaultIcon = normalizedName.slice(0, 2).toUpperCase() || 'CT';
    const defaultColor = normalizedType === 'income' ? '#157F42' : '#B42318';

    return {
      id: createCategoryId(normalizedName, normalizedType),
      name: normalizedName,
      type: normalizedType,
      icon: defaultIcon,
      color: defaultColor,
      status: 'active',
      description: '',
    };
  }

  function getCategoriesByTransactionType(transactionType) {
    const categoryType = getCategoryTypeFromTransactionType(transactionType);

    return categories.filter((category) =>
      category.type === categoryType && normalizeManagedCategoryStatus(category.status) !== 'inactive'
    );
  }

  function getCategoryFilterValue(category) {
    return `${category.type}::${category.name}`;
  }

  function getTransactionAmount(transaction) {
    const amount = Number(transaction.amount);
    return Number.isFinite(amount) ? amount : 0;
  }

  function getTransactionAccountById(accountId) {
    const directAccount = accounts.find((account) => account.id === accountId);

    if (directAccount) {
      return directAccount;
    }

    const fallbackCard = cards.find((card) => card.id === accountId);

    if (!fallbackCard) {
      return null;
    }

    return {
      id: fallbackCard.id,
      name: fallbackCard.name,
      type: 'credit_card',
      dueDay: fallbackCard.dueDay,
      closingDay: fallbackCard.closingDay,
      creditLimit: fallbackCard.limit,
      creditUsed: 0,
      institution: fallbackCard.name,
      status: 'active',
    };
  }

  function getTransactionPaymentMethod(transaction) {
    if (normalizeTransactionType(transaction.type) === 'receita') {
      return '';
    }

    if (String(transaction.paymentMethod || '').trim()) {
      return String(transaction.paymentMethod || 'debit').toLowerCase();
    }

    const transactionAccount = getTransactionAccountById(transaction.accountId || transaction.cardId);
    return transactionAccount && isCreditAccount(transactionAccount) ? 'credit' : 'debit';
  }

  function getPaymentMethodLabel(paymentMethod) {
    if (!String(paymentMethod || '').trim()) {
      return '';
    }

    return String(paymentMethod).toLowerCase() === 'credit' ? 'Crédito' : 'Débito';
  }

  function getTransactionReportAmount(transaction) {
    const normalizedType = normalizeTransactionType(transaction.type);
    const paymentMethod = getTransactionPaymentMethod(transaction);
    const totalAmount = Number(transaction.totalAmount || transaction.amount || 0);

    if (normalizedType === 'despesa' && paymentMethod === 'credit') {
      const installmentsCount = Math.max(1, Number(transaction.installments || 1));
      const installmentValue = Number(transaction.installmentValue || 0);

      if (Number.isFinite(installmentValue) && installmentValue > 0) {
        return installmentValue;
      }

      return installmentsCount > 0 ? totalAmount / installmentsCount : totalAmount;
    }

    return totalAmount;
  }

  function getReportTransactionSyncKey(transaction) {
    const normalizedType = normalizeTransactionType(transaction.type);
    const paymentMethod = normalizedType === 'receita'
      ? ''
      : String(transaction.paymentMethod || getTransactionPaymentMethod(transaction) || '').toLowerCase();
    const accountId = String(transaction.accountId || transaction.cardId || '').trim();
    const linkedCard = getCardById(transaction.cardId || transaction.accountId);
    const accountName = String(transaction.accountName || transaction.cardName || (linkedCard && linkedCard.name) || '').trim().toLowerCase();
    const accountType = String(transaction.accountType || (linkedCard && linkedCard.type) || '').trim().toLowerCase();
    const amount = Number(getTransactionReportAmount(transaction) || 0).toFixed(2);

    return [
      normalizedType,
      String(transaction.date || '').trim(),
      String(transaction.description || '').trim().toLowerCase(),
      String(transaction.category || '').trim().toLowerCase(),
      accountId,
      accountName,
      accountType,
      paymentMethod,
      amount,
    ].join('|');
  }

  function buildReportTransactionEntry(transaction) {
    const normalizedType = normalizeTransactionType(transaction.type);
    const paymentMethod = getTransactionPaymentMethod(transaction);
    const amount = getTransactionReportAmount(transaction);
    const isCredit = normalizedType === 'despesa' && paymentMethod === 'credit';
    const linkedCard = getCardById(transaction.cardId || transaction.accountId);
    const accountName = String(transaction.accountName || transaction.cardName || (linkedCard && linkedCard.name) || '').trim()
      || (normalizedType === 'receita' ? 'Receita' : 'À vista');
    const accountId = String(transaction.accountId || transaction.cardId || '').trim();
    const accountType = String(transaction.accountType || (linkedCard && linkedCard.type) || '').trim()
      || (isCredit ? 'credit_card' : normalizedType === 'receita' ? 'income' : 'debit');
    const installmentCount = Math.max(1, Number(transaction.installments || 1));

    return {
      ...transaction,
      sourceTransactionId: String(transaction.id || ''),
      amount,
      totalAmount: amount,
      type: normalizedType,
      accountId,
      accountName,
      accountType,
      paymentMethod,
      cardId: isCredit ? String(transaction.cardId || accountId || '').trim() : '',
      cardName: isCredit ? accountName : '',
      installmentLabel: isCredit && installmentCount > 1 ? `1/${installmentCount}` : '',
      source: String(transaction.source || '').trim() || 'manual',
    };
  }

  function removeReportTransactionsForTransaction(transaction) {
    const syncKey = getReportTransactionSyncKey(transaction);
    const sourceTransactionId = String(transaction.id || '');

    reportTransactions = reportTransactions.filter((reportTransaction) =>
      getReportTransactionSyncKey(reportTransaction) !== syncKey &&
      String(reportTransaction.sourceTransactionId || '') !== sourceTransactionId,
    );
  }

  function syncReportTransactionsForTransaction(transaction) {
    removeReportTransactionsForTransaction(transaction);
    reportTransactions = [
      buildReportTransactionEntry(transaction),
      ...reportTransactions,
    ];
  }

  function getInstallmentLabel(transaction) {
    const totalInstallments = Number(transaction.installments || 1);

    if (getTransactionPaymentMethod(transaction) !== 'credit' || totalInstallments <= 1) {
      return totalInstallments === 1 && getTransactionPaymentMethod(transaction) === 'credit'
        ? '1/1 parcela'
        : '';
    }

    return `1/${totalInstallments} parcelas`;
  }

  function splitInstallmentAmounts(totalAmount, installmentsCount) {
    const totalInCents = Math.round(Number(totalAmount || 0) * 100);
    const baseValue = Math.floor(totalInCents / installmentsCount);
    const remainder = totalInCents % installmentsCount;

    return Array.from({ length: installmentsCount }, (_, index) => {
      const amountInCents = baseValue + (index < remainder ? 1 : 0);
      return amountInCents / 100;
    });
  }

  function buildInstallmentsForTransaction(transaction) {
    const totalInstallments = Number(transaction.installments || 1);
    const firstInvoiceMonth = transaction.firstInvoiceMonth || getCurrentMonthValue();
    const installmentAmounts = splitInstallmentAmounts(transaction.totalAmount, totalInstallments);
    const dueDay = Number(transaction.dueDay || 1);

    return installmentAmounts.map((amount, index) => ({
      id: createInstallmentId(),
      transactionId: transaction.id,
      cardId: transaction.cardId,
      description: transaction.description,
      category: transaction.category,
      transactionType: transaction.type,
      installmentNumber: index + 1,
      totalInstallments,
      amount,
      month: addMonthsToMonthValue(firstInvoiceMonth, index),
      dueDay,
      status: 'pending',
      createdAt: getTodayDate(),
      paidAt: '',
    }));
  }

  function getCardById(cardId) {
    const directCard = cards.find((card) => card.id === cardId);

    if (directCard) {
      return directCard;
    }

    const creditAccount = getTransactionAccountById(cardId);
    return creditAccount && isCreditAccount(creditAccount) ? creditAccount : null;
  }

  function renderTransactionAccountOptions(selectedValue = '') {
    transactionCardInput.innerHTML = '<option value="">Selecione um cartão...</option>';

    cards.forEach((card) => {
      transactionCardInput.appendChild(new Option(card.name, card.id));
    });

    accounts
      .filter((account) => isCreditAccount(account))
      .forEach((account) => {
        const alreadyExists = Array.from(transactionCardInput.options).some((option) => option.value === account.id);

        if (!alreadyExists) {
          transactionCardInput.appendChild(new Option(account.name, account.id));
        }
      });

    transactionCardInput.value = selectedValue;
  }

  function updateTransactionCreditFields() {
    const transactionType = normalizeTransactionType(transactionTypeInput.value);
    const isExpense = transactionType === 'despesa';
    const paymentMethod = String(transactionPaymentMethodInput.value || '').toLowerCase();
    const isCredit = isExpense && paymentMethod === 'credit';
    const selectedCard = isCredit ? getCardById(transactionCardInput.value) : null;

    if (transactionPaymentMethodField) {
      transactionPaymentMethodField.hidden = !isExpense;
    }

    transactionPaymentMethodInput.required = isExpense;
    transactionPaymentMethodInput.disabled = !isExpense;

    if (transactionCardField) {
      transactionCardField.hidden = !isCredit;
    }

    transactionCreditFields.hidden = !isCredit;
    if (transactionLegacyCreditGrid) {
      transactionLegacyCreditGrid.hidden = true;
    }

    transactionInstallmentsInput.required = isCredit;
    transactionInstallmentsInput.disabled = !isCredit;
    transactionFirstInvoiceMonthInput.required = false;
    transactionFirstInvoiceMonthInput.disabled = true;
    transactionDueDayInput.required = false;
    transactionDueDayInput.disabled = true;
    transactionCardInput.required = isCredit;
    transactionCardInput.disabled = !isCredit;

    if (!isCredit) {
      if (!isExpense) {
        clearTransactionCreditFields();
      } else {
        transactionCardInput.value = '';
        transactionInstallmentsInput.value = '1';
        transactionFirstInvoiceMonthInput.value = '';
        transactionDueDayInput.value = '';
        transactionCreditNote.textContent = '';
      }
      return;
    }

    if (!transactionInstallmentsInput.value) {
      transactionInstallmentsInput.value = '1';
    }

    if (!selectedCard) {
      transactionCreditNote.textContent = 'Selecione um cartão para lançar a compra no crédito.';
      return;
    }

    if (!transactionFirstInvoiceMonthInput.value) {
      transactionFirstInvoiceMonthInput.value = getCurrentMonthValue();
    }

    if (!transactionDueDayInput.value) {
      transactionDueDayInput.value = String(selectedCard.dueDay || '');
    }

    transactionCreditNote.textContent = `Esta compra será lançada na fatura de ${selectedCard.name}. As parcelas futuras serão previstas automaticamente.`;
  }

  function getCardInvoiceStatus(monthValue, invoiceInstallments) {
    if (!invoiceInstallments || invoiceInstallments.length === 0) {
      return 'open';
    }

    const isPaid = invoiceInstallments.every((installment) => installment.status === 'paid');

    if (isPaid) {
      return 'paid';
    }

    const currentMonth = getCurrentMonthValue();

    if (monthValue < currentMonth) {
      return 'closed';
    }

    return 'open';
  }

  function buildCardInvoices(cardId) {
    const relatedInstallments = installments
      .filter((installment) => installment.cardId === cardId)
      .sort((first, second) => {
        if (first.month !== second.month) {
          return first.month.localeCompare(second.month);
        }

        return first.installmentNumber - second.installmentNumber;
      });

    const groupedByMonth = relatedInstallments.reduce((accumulator, installment) => {
      const key = installment.month;

      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push(installment);
      return accumulator;
    }, {});

    return Object.keys(groupedByMonth)
      .sort()
      .map((monthKey) => {
        const invoiceInstallments = groupedByMonth[monthKey];
        const total = calculateInvoiceTotal(invoiceInstallments);

        return {
          id: `${cardId}-${monthKey}`,
          cardId,
          month: monthKey,
          monthLabel: formatMonthLabel(monthKey),
          total,
          installments: invoiceInstallments,
          status: getCardInvoiceStatus(monthKey, invoiceInstallments),
        };
      });
  }

  function getInstallmentsByMonth(monthKey, cardId) {
    return installments
      .filter((installment) => installment.cardId === cardId && installment.month === monthKey)
      .sort((first, second) => first.installmentNumber - second.installmentNumber);
  }

  function calculateInvoiceTotal(invoiceInstallments) {
    return invoiceInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
  }

  function generateMonthOptions(invoices) {
    if (invoices.length === 0) {
      return '<option value="">Selecione um mês...</option>';
    }

    return invoices
      .map((invoice) => `
        <option value="${invoice.month}">
          ${invoice.monthLabel.charAt(0).toUpperCase() + invoice.monthLabel.slice(1)}
        </option>
      `)
      .join('');
  }

  function getRecurrenceAmount(recurrence) {
    const amount = Number(recurrence.amount);
    return Number.isFinite(amount) ? amount : 0;
  }

  function formatRecurrenceFrequency(dayOfMonth) {
    return `Mensal • dia ${dayOfMonth}`;
  }

  function buildSyntheticRecurrenceDate(dayOfMonth) {
    const monthValue = getCurrentMonthValue();
    const normalizedDay = Math.min(Math.max(Number(dayOfMonth) || 1, 1), 31);

    return `${monthValue}-${String(normalizedDay).padStart(2, '0')}`;
  }

  function calculateKpiValues(sourceTransactions = transactions) {
    const currentMonth = getTodayDate().slice(0, 7);
    let currentBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    sourceTransactions.forEach((transaction) => {
      if (getTransactionPaymentMethod(transaction) === 'credit') {
        return;
      }

      const amount = getTransactionAmount(transaction);
      const type = normalizeTransactionType(transaction.type);
      const isCurrentMonth = String(transaction.date || '').startsWith(currentMonth);

      if (type === 'receita') {
        currentBalance += amount;

        if (isCurrentMonth) {
          monthlyIncome += amount;
        }
      }

      if (type === 'despesa') {
        currentBalance -= amount;

        if (isCurrentMonth) {
          monthlyExpenses += amount;
        }
      }
    });

    installments.forEach((installment) => {
      if (installment.status !== 'paid') {
        return;
      }

      const amount = Number(installment.amount || 0);
      const type = normalizeTransactionType(installment.transactionType);
      const isCurrentMonth = String(installment.paidAt || '').startsWith(currentMonth);

      if (type === 'receita') {
        currentBalance += amount;

        if (isCurrentMonth) {
          monthlyIncome += amount;
        }
      }

      if (type === 'despesa') {
        currentBalance -= amount;

        if (isCurrentMonth) {
          monthlyExpenses += amount;
        }
      }
    });

    return [currentBalance, monthlyIncome, monthlyExpenses, monthlyIncome - monthlyExpenses];
  }

  function renderKpis() {
    const kpiValues = calculateKpiValues();

    kpiGrid.innerHTML = data.kpis
      .map((kpi, index) => components.renderKpiCard({
        ...kpi,
        value: kpiValues[index] || 0,
      }))
      .join('');
  }

  function getTransactionsViewSummaryCards(sourceTransactions) {
    let totalIncome = 0;
    let totalExpenses = 0;

    sourceTransactions.forEach((transaction) => {
      const amount = getTransactionAmount(transaction);
      const type = normalizeTransactionType(transaction.type);

      if (type === 'receita') {
        totalIncome += amount;
      }

      if (type === 'despesa') {
        totalExpenses += amount;
      }
    });

    return [
      {
        label: 'Total de receitas',
        value: totalIncome,
        note: 'Entradas no recorte atual',
        tone: 'green',
      },
      {
        label: 'Total de despesas',
        value: totalExpenses,
        note: 'Saídas no recorte atual',
        tone: 'red',
      },
      {
        label: 'Saldo do período',
        value: totalIncome - totalExpenses,
        note: 'Receitas menos despesas',
        tone: 'navy',
      },
      {
        label: 'Quantidade de transações',
        value: String(sourceTransactions.length),
        note: 'Movimentações encontradas',
        tone: 'gold',
      },
    ];
  }

  function renderTransactionsSummary(sourceTransactions) {
    const summaryCards = getTransactionsViewSummaryCards(sourceTransactions);

    transactionsSummaryGrid.innerHTML = summaryCards
      .map((card) => components.renderKpiCard(card))
      .join('');
  }

  function formatCommitmentPercentage(percentage) {
    return Number(percentage).toLocaleString('pt-BR', {
      minimumFractionDigits: percentage % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    });
  }

  function getCommitmentLabel(fixedIncome, fixedExpenses) {
    if (fixedIncome <= 0) {
      return 'Sem receitas fixas para calcular o comprometimento.';
    }

    const commitmentPercentage = (fixedExpenses / fixedIncome) * 100;
    return `${formatCommitmentPercentage(commitmentPercentage)}% da renda fixa comprometida`;
  }

  function getNextRecurrenceSummary(sourceRecurrences) {
    const today = new Date();
    const currentDay = today.getDate();
    const activeRecurrences = sourceRecurrences.filter(
      (recurrence) => normalizeRecurrenceStatus(recurrence.status) === 'active',
    );

    if (activeRecurrences.length === 0) {
      return {
        title: 'Nenhuma',
        note: 'Cadastre uma recorrência ativa para ver a próxima previsão.',
      };
    }

    const [nextRecurrence] = [...activeRecurrences].sort((first, second) => {
      const firstDay = Number(first.dayOfMonth) || 1;
      const secondDay = Number(second.dayOfMonth) || 1;
      const firstDistance = firstDay >= currentDay ? firstDay - currentDay : 31 - currentDay + firstDay;
      const secondDistance = secondDay >= currentDay ? secondDay - currentDay : 31 - currentDay + secondDay;

      if (firstDistance !== secondDistance) {
        return firstDistance - secondDistance;
      }

      return firstDay - secondDay;
    });

    return {
      title: `Próxima: ${nextRecurrence.description}`,
      note: `Dia ${nextRecurrence.dayOfMonth} • ${Number(nextRecurrence.amount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}`,
    };
  }

  function getRecurrencesSummaryCards(sourceRecurrences) {
    let fixedIncome = 0;
    let fixedExpenses = 0;

    sourceRecurrences.forEach((recurrence) => {
      const amount = getRecurrenceAmount(recurrence);
      const type = normalizeTransactionType(recurrence.type);
      const status = normalizeRecurrenceStatus(recurrence.status);

      if (status === 'active') {
        if (type === 'receita') {
          fixedIncome += amount;
        }

        if (type === 'despesa') {
          fixedExpenses += amount;
        }
      }
    });

    const monthlyBalance = fixedIncome - fixedExpenses;
    const nextRecurrence = getNextRecurrenceSummary(sourceRecurrences);
    const commitmentLabel = getCommitmentLabel(fixedIncome, fixedExpenses);

    return [
      {
        label: 'Saldo fixo mensal',
        value: monthlyBalance,
        note: 'Receitas fixas menos despesas fixas ativas',
        tone: 'navy',
      },
      {
        label: 'Receitas fixas mensais',
        value: fixedIncome,
        note: 'Entradas recorrentes ativas',
        tone: 'green',
      },
      {
        label: 'Despesas fixas mensais',
        value: fixedExpenses,
        note: commitmentLabel,
        tone: 'red',
      },
      {
        label: 'Próxima recorrência',
        value: nextRecurrence.title,
        note: nextRecurrence.note,
        tone: 'gold',
      },
    ];
  }

  function renderRecurrencesSummary(sourceRecurrences) {
    const summaryCards = getRecurrencesSummaryCards(sourceRecurrences);

    recurrencesSummaryGrid.innerHTML = summaryCards
      .map((card) => components.renderKpiCard(card))
      .join('');
  }

  function setActiveFilter(filter) {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.transactionFilter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function setActiveModuleTypeFilter(filter) {
    moduleTypeFilterButtons.forEach((button) => {
      const isActive = button.dataset.moduleTypeFilter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function setActiveRecurrenceFilter(filter) {
    recurrenceFilterButtons.forEach((button) => {
      const isActive = button.dataset.recurrenceFilter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function setActiveDashboardNav(section) {
    dashboardNavButtons.forEach((button) => {
      const isActive = button.dataset.dashboardNav === section;
      button.classList.toggle('is-active', isActive);

      if (isActive) {
        button.setAttribute('aria-current', 'page');
        return;
      }

      button.removeAttribute('aria-current');
    });
  }

  function setVisibleDashboardView(section) {
    const allowedSections = ['dashboard', 'transactions', 'recurrences', 'cards', 'reports', 'categories'];
    const normalizedSection = allowedSections.includes(section) ? section : 'dashboard';

    currentDashboardView = normalizedSection;
    dashboardView.hidden = normalizedSection !== 'dashboard';
    transactionsView.hidden = normalizedSection !== 'transactions';
    recurrencesView.hidden = normalizedSection !== 'recurrences';
    cardsView.hidden = normalizedSection !== 'cards';
    reportsView.hidden = normalizedSection !== 'reports';
    categoriesView.hidden = normalizedSection !== 'categories';
    dashboardView.classList.toggle('is-active', normalizedSection === 'dashboard');
    transactionsView.classList.toggle('is-active', normalizedSection === 'transactions');
    recurrencesView.classList.toggle('is-active', normalizedSection === 'recurrences');
    cardsView.classList.toggle('is-active', normalizedSection === 'cards');
    reportsView.classList.toggle('is-active', normalizedSection === 'reports');
    categoriesView.classList.toggle('is-active', normalizedSection === 'categories');
  }

  function showDashboardNavFeedback(message) {
    dashboardNavFeedback.textContent = message;
  }

  function handleDashboardNav(section) {
    if (
      section === 'dashboard' ||
      section === 'transactions' ||
      section === 'recurrences' ||
      section === 'cards' ||
      section === 'reports' ||
      section === 'accounts' ||
      section === 'categories'
    ) {
      setActiveDashboardNav(section);
      setVisibleDashboardView(section);
      showDashboardNavFeedback('');

      if (section === 'transactions') {
        renderTransactionsView();
      }

      if (section === 'recurrences') {
        renderRecurrencesView();
      }

      if (section === 'cards') {
        renderCardsView();
      }

      if (section === 'reports') {
        renderReportsView();
      }

      if (section === 'accounts') {
        renderAccountsView();
      }

      if (section === 'categories') {
        renderCategoriesView();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const pendingLabels = {};

    console.log('Funcionalidade em desenvolvimento');
    showDashboardNavFeedback(pendingLabels[section] || 'Funcionalidade em desenvolvimento.');
  }

  function setFormFeedback(message, tone) {
    transactionFeedback.textContent = message;
    transactionFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      transactionFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      transactionFeedback.classList.add('is-success');
    }
  }

  function setCategoryFeedback(message, tone) {
    categoryCreateFeedback.textContent = message;
    categoryCreateFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      categoryCreateFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      categoryCreateFeedback.classList.add('is-success');
    }
  }

  function getInitialCategories() {
    if (categoryCatalogSource.length > 0) {
      return categoryCatalogSource
        .map((category) => ({
          ...createCategoryEntry(category.name, category.type),
          ...category,
          status: normalizeManagedCategoryStatus(category.status),
        }))
        .sort(compareCategoryEntries);
    }

    return [];
  }

  function findCategoryByName(categoryName, categoryType = '') {
    const normalizedCategoryName = normalizeCategoryName(categoryName).toLocaleLowerCase('pt-BR');
    const normalizedCategoryType = String(categoryType || '').toLowerCase();

    return categories.find((category) =>
      category.name.toLocaleLowerCase('pt-BR') === normalizedCategoryName &&
      (!normalizedCategoryType || category.type === normalizedCategoryType),
    );
  }

  function renderCategoryOptions(selectedValue = '', transactionType = transactionTypeInput.value) {
    const filteredCategories = getCategoriesByTransactionType(transactionType);

    transactionCategoryInput.innerHTML = '<option value="">Selecione uma categoria...</option>';

    filteredCategories.forEach((category) => {
      transactionCategoryInput.appendChild(new Option(category.name, category.name));
    });

    transactionCategoryInput.value = selectedValue;
  }

  function renderTransactionsCategoryFilterOptions() {
    const currentValue = transactionsViewFilters.category || 'all';
    const categoryNameCount = categories.reduce((accumulator, category) => {
      const key = category.name;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    transactionsCategoryFilter.innerHTML = '<option value="all">Todas</option>';

    categories.forEach((category) => {
      const shouldShowType = categoryNameCount[category.name] > 1;
      const label = shouldShowType
        ? `${category.name} (${getTransactionTypeFromCategoryType(category.type) === 'receita' ? 'Receita' : 'Despesa'})`
        : category.name;
      transactionsCategoryFilter.appendChild(new Option(label, getCategoryFilterValue(category)));
    });

    const categoryValues = categories.map((category) => getCategoryFilterValue(category));
    const selectedValue = currentValue === 'all' || categoryValues.includes(currentValue)
      ? currentValue
      : 'all';

    transactionsCategoryFilter.value = selectedValue;
    transactionsViewFilters.category = selectedValue;
  }

  function renderRecurrenceCategoryOptions(selectedValue = '', recurrenceType = recurrenceTypeInput.value) {
    const filteredCategories = getCategoriesByTransactionType(recurrenceType);

    recurrenceCategoryInput.innerHTML = '<option value="">Selecione uma categoria...</option>';

    filteredCategories.forEach((category) => {
      recurrenceCategoryInput.appendChild(new Option(category.name, category.name));
    });

    recurrenceCategoryInput.value = selectedValue;
  }

  function showCategoryCreatePanel() {
    categoryCreatePanel.hidden = false;
    btnShowCategoryInput.hidden = true;
    setCategoryFeedback('', 'info');

    window.requestAnimationFrame(() => {
      newCategoryInput.focus();
    });
  }

  function hideCategoryCreatePanel() {
    categoryCreatePanel.hidden = true;
    btnShowCategoryInput.hidden = false;
    newCategoryInput.value = '';
    setCategoryFeedback('', 'info');
  }

  async function handleCreateCategory() {
    const categoryName = normalizeCategoryName(newCategoryInput.value);
    const currentCategoryType = getCategoryTypeFromTransactionType(transactionTypeInput.value || 'receita');

    if (!categoryName) {
      setCategoryFeedback('Digite um nome para a nova categoria.', 'error');
      newCategoryInput.focus();
      return;
    }

    const existingCategory = findCategoryByName(categoryName, currentCategoryType);

    if (existingCategory) {
      renderCategoryOptions(existingCategory.name, transactionTypeInput.value);
      hideCategoryCreatePanel();
      renderTransactionsCategoryFilterOptions();
      renderTransactionsView();
      renderRecurrencesView();
      renderCategoriesView();
      setFormFeedback('Categoria já existente selecionada.', 'success');
      return;
    }

    try {
      const createdCategory = await financeDataService.createCategory(
        authenticatedUser.id,
        createCategoryEntry(categoryName, currentCategoryType),
      );
      categories = [...categories, createdCategory].sort(compareCategoryEntries);
    } catch (error) {
      console.error('Não foi possível salvar a categoria.', error);
      setCategoryFeedback('Não foi possível salvar a categoria. Tente novamente.', 'error');
      return;
    }

    renderCategoryOptions(categoryName, transactionTypeInput.value);
    hideCategoryCreatePanel();
    renderTransactionsCategoryFilterOptions();
    renderTransactionsView();
    renderRecurrencesView();
    renderCategoriesView();
    setFormFeedback('Nova categoria adicionada e selecionada.', 'success');
  }

  function updateDescriptionCounter() {
    const maxLength = transactionDescriptionInput.maxLength;
    const currentLength = transactionDescriptionInput.value.length;
    transactionDescriptionCounter.textContent = `${currentLength}/${maxLength}`;
  }

  function clearTransactionCreditFields() {
    transactionPaymentMethodInput.value = '';
    transactionCardInput.value = '';
    transactionInstallmentsInput.value = '1';
    transactionFirstInvoiceMonthInput.value = '';
    transactionDueDayInput.value = '';
    transactionCreditNote.textContent = '';
  }

  function selectTransactionType(type) {
    const normalizedType = normalizeTransactionType(type);
    const previousType = transactionTypeInput.value;
    transactionTypeInput.value = normalizedType;

    transactionTypeButtons.forEach((button) => {
      const isSelected = button.dataset.transactionTypeOption === normalizedType;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });

    if (normalizedType) {
      if (previousType !== normalizedType) {
        hideCategoryCreatePanel();
        renderCategoryOptions('', normalizedType);
      } else {
        renderCategoryOptions(transactionCategoryInput.value, normalizedType);
      }
    } else {
      transactionCategoryInput.innerHTML = '<option value="">Selecione uma categoria...</option>';
    }

    updateTransactionCreditFields();
  }

  function ensureCategoryOption(category, transactionType = transactionTypeInput.value || 'receita') {
    const categoryName = normalizeCategoryName(category);
    const categoryType = getCategoryTypeFromTransactionType(transactionType);

    if (!categoryName) {
      return;
    }

    const existingCategory = findCategoryByName(categoryName, categoryType);

    if (!existingCategory) {
      categories = [...categories, createCategoryEntry(categoryName, categoryType)].sort(compareCategoryEntries);
    }

    renderCategoryOptions(existingCategory ? existingCategory.name : categoryName, transactionType);
    renderTransactionsCategoryFilterOptions();
  }

  function ensureRecurrenceCategoryOption(category, recurrenceType = recurrenceTypeInput.value || 'receita') {
    const categoryName = normalizeCategoryName(category);
    const categoryType = getCategoryTypeFromTransactionType(recurrenceType);

    if (!categoryName) {
      return;
    }

    const existingCategory = findCategoryByName(categoryName, categoryType);

    if (!existingCategory) {
      categories = [...categories, createCategoryEntry(categoryName, categoryType)].sort(compareCategoryEntries);
    }

    renderRecurrenceCategoryOptions(existingCategory ? existingCategory.name : categoryName, recurrenceType);
    renderTransactionsCategoryFilterOptions();
  }

  function findTransactionById(transactionId) {
    return transactions.find((transaction) => transaction.id === transactionId);
  }

  function renderTransactions(filter) {
    const filteredTransactions = filter === 'all'
      ? transactions
      : transactions.filter((transaction) => normalizeTransactionType(transaction.type) === filter);

    if (filteredTransactions.length === 0) {
      transactionList.innerHTML = transactions.length === 0
        ? `
          <li class="empty-state">
            <strong>Você ainda não possui lançamentos cadastrados.</strong>
            <span>Clique em Adicionar transação para registrar sua primeira movimentação.</span>
          </li>
        `
        : '<li class="empty-state">Nenhuma transação encontrada para este filtro.</li>';
      return;
    }

    transactionList.innerHTML = filteredTransactions
      .map((transaction) =>
        components.renderTransactionItem({
          ...transaction,
          date: formatDate(transaction.date),
          paymentMethodLabel: getPaymentMethodLabel(getTransactionPaymentMethod(transaction)),
          installmentLabel: getInstallmentLabel(transaction),
        }))
      .join('');
  }

  function applyFilter(filter) {
    currentFilter = filter;
    setActiveFilter(currentFilter);
    renderTransactions(currentFilter);
  }

  function isTransactionInsidePeriod(transaction, period) {
    const transactionDate = parseISODate(transaction.date);

    if (!transactionDate) {
      return false;
    }

    const todayIso = getTodayDate();
    const today = parseISODate(todayIso);

    if (!today) {
      return true;
    }

    if (period === 'month') {
      return String(transaction.date || '').startsWith(todayIso.slice(0, 7));
    }

    if (period === 'year') {
      return String(transaction.date || '').startsWith(todayIso.slice(0, 4));
    }

    if (period === 'last30') {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      return transactionDate >= startDate && transactionDate <= today;
    }

    return true;
  }

  function getFilteredTransactionsForModule() {
    const searchTerm = normalizeSearchTerm(transactionsViewFilters.search);

    return transactions
      .filter((transaction) => {
        const type = normalizeTransactionType(transaction.type);

        if (transactionsViewFilters.type !== 'all' && type !== transactionsViewFilters.type) {
          return false;
        }

        if (
          transactionsViewFilters.category !== 'all' &&
          `${getCategoryTypeFromTransactionType(transaction.type)}::${normalizeCategoryName(transaction.category)}`
            !== transactionsViewFilters.category
        ) {
          return false;
        }

        if (searchTerm) {
          const description = normalizeSearchTerm(transaction.description);

          if (!description.includes(searchTerm)) {
            return false;
          }
        }

        if (!isTransactionInsidePeriod(transaction, transactionsViewFilters.period)) {
          return false;
        }

        return true;
      })
      .sort((first, second) => String(second.date || '').localeCompare(String(first.date || '')));
  }

  function renderTransactionsTable(sourceTransactions) {
    if (sourceTransactions.length === 0) {
      transactionsTableBody.innerHTML = '';
      transactionsTableWrap.hidden = true;
      transactionsEmptyState.hidden = false;

      if (transactions.length === 0) {
        transactionsEmptyState.innerHTML = `
          <strong>Nenhuma transação cadastrada ainda.</strong>
          <span>Clique em "Adicionar transação" para registrar sua primeira movimentação.</span>
        `;
        return;
      }

      transactionsEmptyState.innerHTML = `
        <strong>Nenhuma transação encontrada.</strong>
        <span>Ajuste os filtros ou cadastre uma nova movimentação.</span>
      `;
      return;
    }

    transactionsTableBody.innerHTML = sourceTransactions
      .map((transaction) =>
        components.renderTransactionTableRow({
          ...transaction,
          date: formatDate(transaction.date),
          paymentMethodLabel: getPaymentMethodLabel(getTransactionPaymentMethod(transaction)),
          installmentLabel: getInstallmentLabel(transaction),
        }))
      .join('');

    transactionsTableWrap.hidden = false;
    transactionsEmptyState.hidden = true;
  }

  function renderTransactionsView() {
    renderTransactionsCategoryFilterOptions();
    setActiveModuleTypeFilter(transactionsViewFilters.type);

    const filteredTransactions = getFilteredTransactionsForModule();
    renderTransactionsSummary(filteredTransactions);
    renderTransactionsTable(filteredTransactions);
  }

  function setRecurrenceFormFeedback(message, tone) {
    recurrenceFeedback.textContent = message;
    recurrenceFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      recurrenceFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      recurrenceFeedback.classList.add('is-success');
    }
  }

  function selectRecurrenceType(type) {
    const normalizedType = normalizeTransactionType(type);
    const previousType = recurrenceTypeInput.value;
    recurrenceTypeInput.value = normalizedType;

    recurrenceTypeButtons.forEach((button) => {
      const isSelected = button.dataset.recurrenceTypeOption === normalizedType;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });

    if (normalizedType) {
      if (previousType !== normalizedType) {
        renderRecurrenceCategoryOptions('', normalizedType);
      } else {
        renderRecurrenceCategoryOptions(recurrenceCategoryInput.value, normalizedType);
      }
    } else {
      recurrenceCategoryInput.innerHTML = '<option value="">Selecione uma categoria...</option>';
    }
  }

  function resetRecurrenceForm() {
    recurrenceForm.reset();
    recurrenceStatusInput.value = 'active';
    recurrenceFrequencyInput.value = 'monthly';
    recurrenceDayInput.value = String(new Date().getDate());
    selectRecurrenceType('receita');
    setRecurrenceFormFeedback('', 'info');
  }

  function showRecurrenceModal(focusTarget) {
    const safeFocusTarget = focusTarget && typeof focusTarget.focus === 'function'
      ? focusTarget
      : recurrenceDescriptionInput;

    recurrenceModal.hidden = false;
    document.body.classList.add('modal-open');

    window.requestAnimationFrame(() => {
      safeFocusTarget.focus();
    });
  }

  function closeRecurrenceModal(options = {}) {
    const { restoreFocus = true } = options;

    recurrenceModal.hidden = true;
    document.body.classList.remove('modal-open');
    resetRecurrenceForm();
    recurrenceModalMode = 'create';
    editingRecurrenceId = null;

    if (restoreFocus && lastRecurrenceModalTrigger && document.contains(lastRecurrenceModalTrigger)) {
      lastRecurrenceModalTrigger.focus();
    }

    lastRecurrenceModalTrigger = null;
  }

  function openCreateRecurrenceModal(triggerButton = btnAddRecurrence) {
    recurrenceModalMode = 'create';
    editingRecurrenceId = null;
    lastRecurrenceModalTrigger = triggerButton || btnAddRecurrence;

    recurrenceModalTitle.textContent = 'Nova recorrência';
    recurrenceModalDescription.textContent =
      'Cadastre uma receita ou despesa fixa para acompanhar seu mês com mais previsibilidade.';
    recurrenceSubmitButton.textContent = 'Salvar recorrência';

    resetRecurrenceForm();
    showRecurrenceModal(recurrenceTypeButtons[0]);
  }

  function openEditRecurrenceModal(recurrence, triggerButton) {
    recurrenceModalMode = 'edit';
    editingRecurrenceId = recurrence.id;
    lastRecurrenceModalTrigger = triggerButton || null;

    recurrenceModalTitle.textContent = 'Editar recorrência';
    recurrenceModalDescription.textContent =
      'Atualize uma recorrência fixa sem sair do dashboard.';
    recurrenceSubmitButton.textContent = 'Salvar alterações';

    const normalizedType = normalizeTransactionType(recurrence.type);

    resetRecurrenceForm();
    ensureRecurrenceCategoryOption(recurrence.category, normalizedType);

    recurrenceDescriptionInput.value = recurrence.description || '';
    recurrenceAmountInput.value = Number(recurrence.amount || 0).toFixed(2);
    recurrenceDayInput.value = String(recurrence.dayOfMonth || 1);
    recurrenceFrequencyInput.value = recurrence.frequency || 'monthly';
    recurrenceStatusInput.value = normalizeRecurrenceStatus(recurrence.status) || 'active';
    selectRecurrenceType(normalizedType === 'despesa' ? 'despesa' : 'receita');
    recurrenceCategoryInput.value = recurrence.category || '';

    showRecurrenceModal(recurrenceDescriptionInput);
  }

  function updateRecurrence(recurrenceId, updatedFields) {
    recurrences = recurrences.map((recurrence) => {
      if (recurrence.id !== recurrenceId) {
        return recurrence;
      }

      return {
        ...recurrence,
        ...updatedFields,
      };
    });
  }

  function buildRecurrenceFromForm() {
    return {
      description: recurrenceDescriptionInput.value.trim(),
      amount: Number(recurrenceAmountInput.value),
      type: normalizeTransactionType(recurrenceTypeInput.value),
      category: recurrenceCategoryInput.value.trim(),
      frequency: recurrenceFrequencyInput.value || 'monthly',
      dayOfMonth: Number(recurrenceDayInput.value),
      status: normalizeRecurrenceStatus(recurrenceStatusInput.value) || 'active',
    };
  }

  function getFilteredRecurrences() {
    return recurrences
      .filter((recurrence) => {
        const type = normalizeTransactionType(recurrence.type);
        const status = normalizeRecurrenceStatus(recurrence.status);

        if (currentRecurrenceFilter === 'receita' || currentRecurrenceFilter === 'despesa') {
          return type === currentRecurrenceFilter;
        }

        if (currentRecurrenceFilter === 'active' || currentRecurrenceFilter === 'paused') {
          return status === currentRecurrenceFilter;
        }

        return true;
      })
      .sort((first, second) => {
        const firstStatus = normalizeRecurrenceStatus(first.status);
        const secondStatus = normalizeRecurrenceStatus(second.status);

        if (firstStatus !== secondStatus) {
          return firstStatus === 'active' ? -1 : 1;
        }

        return (Number(first.dayOfMonth) || 0) - (Number(second.dayOfMonth) || 0);
      });
  }

  function renderRecurrencesTable(sourceRecurrences) {
    if (sourceRecurrences.length === 0) {
      recurrencesTableBody.innerHTML = '';
      recurrencesTableWrap.hidden = true;
      recurrencesEmptyState.hidden = false;

      if (recurrences.length === 0) {
        recurrencesEmptyState.innerHTML = `
          <strong>Nenhuma recorrência cadastrada ainda.</strong>
          <span>Clique em "Nova recorrência" para automatizar uma receita ou despesa fixa.</span>
        `;
        return;
      }

      recurrencesEmptyState.innerHTML = `
        <strong>Nenhuma recorrência encontrada.</strong>
        <span>Altere o filtro atual ou cadastre uma nova recorrência.</span>
      `;
      return;
    }

    recurrencesTableBody.innerHTML = sourceRecurrences
      .map((recurrence) =>
        components.renderRecurrenceTableRow({
          ...recurrence,
          frequencyLabel: formatRecurrenceFrequency(recurrence.dayOfMonth),
          status: normalizeRecurrenceStatus(recurrence.status),
        }))
      .join('');

    recurrencesTableWrap.hidden = false;
    recurrencesEmptyState.hidden = true;
  }

  function renderRecurrencesView() {
    setActiveRecurrenceFilter(currentRecurrenceFilter);
    renderRecurrenceCategoryOptions(recurrenceCategoryInput.value, recurrenceTypeInput.value || 'receita');

    const filteredRecurrences = getFilteredRecurrences();
    renderRecurrencesSummary(recurrences);
    renderRecurrencesTable(filteredRecurrences);
  }

  function handleDeleteRecurrence(recurrenceId) {
    const recurrence = recurrences.find((item) => item.id === recurrenceId);

    if (!recurrence) {
      return;
    }

    const shouldDelete = window.confirm('Tem certeza que deseja excluir esta recorrência?');

    if (!shouldDelete) {
      return;
    }

    if (editingRecurrenceId === recurrenceId) {
      closeRecurrenceModal({ restoreFocus: false });
    }

    recurrences = recurrences.filter((item) => item.id !== recurrenceId);
    syncRecurrenceDependentViews();
  }

  function handleToggleRecurrenceStatus(recurrenceId) {
    recurrences = recurrences.map((recurrence) => {
      if (recurrence.id !== recurrenceId) {
        return recurrence;
      }

      return {
        ...recurrence,
        status: normalizeRecurrenceStatus(recurrence.status) === 'active' ? 'paused' : 'active',
      };
    });

    syncRecurrenceDependentViews();
  }

  function handleRecurrenceActionClick(event) {
    const actionButton = event.target instanceof Element
      ? event.target.closest('[data-recurrence-action]')
      : null;

    if (!actionButton) {
      return;
    }

    const recurrenceId = actionButton.dataset.recurrenceId;
    const action = actionButton.dataset.recurrenceAction;
    const recurrence = recurrences.find((item) => item.id === recurrenceId);

    if (!recurrence) {
      return;
    }

    if (action === 'edit') {
      openEditRecurrenceModal(recurrence, actionButton);
      return;
    }

    if (action === 'toggle') {
      handleToggleRecurrenceStatus(recurrenceId);
      return;
    }

    if (action === 'delete') {
      handleDeleteRecurrence(recurrenceId);
    }
  }

  function setCardFormFeedback(message, tone) {
    cardFeedback.textContent = message;
    cardFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      cardFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      cardFeedback.classList.add('is-success');
    }
  }

  function resetCardForm() {
    cardForm.reset();
    setCardFormFeedback('', 'info');
  }

  function showCardModal(focusTarget) {
    const safeFocusTarget = focusTarget && typeof focusTarget.focus === 'function'
      ? focusTarget
      : cardNameInput;

    cardModal.hidden = false;
    document.body.classList.add('modal-open');

    window.requestAnimationFrame(() => {
      safeFocusTarget.focus();
    });
  }

  function closeCardModal(options = {}) {
    const { restoreFocus = true } = options;

    cardModal.hidden = true;
    document.body.classList.remove('modal-open');
    resetCardForm();
    cardModalMode = 'create';
    editingCardId = null;

    if (restoreFocus && lastCardModalTrigger && document.contains(lastCardModalTrigger)) {
      lastCardModalTrigger.focus();
    }

    lastCardModalTrigger = null;
  }

  function openCreateCardModal(triggerButton = btnAddCard) {
    cardModalMode = 'create';
    editingCardId = null;
    lastCardModalTrigger = triggerButton || btnAddCard;

    cardModalTitle.textContent = 'Novo cartão';
    cardModalDescription.textContent =
      'Cadastre um cartão para organizar compras no crédito e acompanhar suas faturas.';
    cardSubmitButton.textContent = 'Salvar cartão';

    resetCardForm();
    showCardModal(cardNameInput);
  }

  function openEditCardModal(card, triggerButton) {
    cardModalMode = 'edit';
    editingCardId = card.id;
    lastCardModalTrigger = triggerButton || null;

    cardModalTitle.textContent = 'Editar cartão';
    cardModalDescription.textContent =
      'Atualize os dados do cartão sem perder o histórico das parcelas já criadas.';
    cardSubmitButton.textContent = 'Salvar alterações';

    resetCardForm();
    cardNameInput.value = card.name || '';
    cardLimitInput.value = Number(card.limit || 0).toFixed(2);
    cardClosingDayInput.value = String(card.closingDay || '');
    cardDueDayInput.value = String(card.dueDay || '');

    showCardModal(cardNameInput);
  }

  function buildCardFromForm() {
    return {
      name: String(cardNameInput.value || '').trim(),
      limit: Number(cardLimitInput.value),
      closingDay: Number(cardClosingDayInput.value),
      dueDay: Number(cardDueDayInput.value),
    };
  }

  function updateCard(cardId, updatedFields) {
    cards = cards.map((card) => {
      if (card.id !== cardId) {
        return card;
      }

      return {
        ...card,
        ...updatedFields,
      };
    });
  }

  function updateCardDependentInstallments(cardId, dueDay) {
    installments = installments.map((installment) => {
      if (installment.cardId !== cardId) {
        return installment;
      }

      return {
        ...installment,
        dueDay,
      };
    });
  }

  function deleteCard(cardId) {
    cards = cards.filter((card) => card.id !== cardId);
    transactions = transactions.map((transaction) => {
      if (transaction.cardId !== cardId) {
        return transaction;
      }

      return {
        ...transaction,
        cardId: '',
        paymentMethod: 'debit',
        installments: 1,
        installmentValue: transaction.totalAmount || transaction.amount,
        firstInvoiceMonth: '',
        dueDay: 0,
      };
    });
    installments = installments.filter((installment) => installment.cardId !== cardId);
    selectedCardId = cards[0] ? cards[0].id : null;
    selectedInvoiceMonth = null;
  }

  function getSelectedCard() {
    return selectedCardId ? getCardById(selectedCardId) : null;
  }

  function getInvoiceStatusLabel(status) {
    if (status === 'paid') {
      return 'Paga';
    }

    if (status === 'closed') {
      return 'Fechada';
    }

    return 'Aberta';
  }

  function renderCardsList() {
    if (cards.length === 0) {
      cardsList.innerHTML = '';
      cardsEmptyState.hidden = false;
      return;
    }

    cardsEmptyState.hidden = true;
    cardsList.innerHTML = cards
      .map((card) => {
        const isSelected = selectedCardId === card.id;

        return `
          <article class="card-entry ${isSelected ? 'is-selected' : ''}" data-card-id="${card.id}">
            <div class="card-entry__header">
              <div>
                <h3 class="card-entry__title">${card.name}</h3>
                <div class="card-entry__details">
                  <span>Limite: ${Number(card.limit || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}</span>
                  <span>Fecha dia ${card.closingDay} • Vence dia ${card.dueDay}</span>
                </div>
              </div>
              <button class="card-select-button" type="button" data-select-card="${card.id}">
                ${isSelected ? 'Selecionado' : 'Ver faturas'}
              </button>
            </div>
            <div class="card-entry__footer">
              <span class="transaction-secondary">Compras parceladas usam este cartão nas faturas.</span>
              <div class="card-entry__actions">
                <button
                  class="transaction-action transaction-action--edit"
                  type="button"
                  data-card-action="edit"
                  data-card-id="${card.id}"
                  aria-label="Editar cartão ${card.name}"
                  title="Editar cartão"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 16.5V20h3.5L18.7 8.8a1.8 1.8 0 0 0 0-2.5l-1-1a1.8 1.8 0 0 0-2.5 0L4 16.5Zm11.7-11.7 3.5 3.5"></path>
                  </svg>
                </button>
                <button
                  class="transaction-action transaction-action--delete"
                  type="button"
                  data-card-action="delete"
                  data-card-id="${card.id}"
                  aria-label="Excluir cartão ${card.name}"
                  title="Excluir cartão"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h16"></path>
                    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"></path>
                    <path d="M7 7l1 13h8l1-13"></path>
                    <path d="M10 11v5"></path>
                    <path d="M14 11v5"></path>
                  </svg>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderCurrentInvoice(card) {
    const currentMonth = getCurrentMonthValue();
    const currentInvoice = buildCardInvoices(card.id).find((invoice) => invoice.month === currentMonth);

    currentCardTitle.textContent = card.name;
    currentInvoiceStatus.className = 'card-chip invoice-status-chip';

    if (!currentInvoice) {
      currentInvoiceStatus.textContent = 'Sem fatura';
      currentInvoiceHighlight.innerHTML = `
        <span>Total da fatura</span>
        <strong>R$ 0,00</strong>
        <small>As compras no crédito entram aqui mês a mês.</small>
      `;
      currentInvoiceList.innerHTML = '';
      currentInvoiceEmptyState.hidden = false;
      markInvoicePaidButton.disabled = true;
      markInvoicePaidButton.dataset.invoiceCardId = '';
      markInvoicePaidButton.dataset.invoiceMonth = '';
      return;
    }

    const statusLabel = getInvoiceStatusLabel(currentInvoice.status);
    currentInvoiceStatus.textContent = statusLabel;
    currentInvoiceStatus.classList.add(`status-${currentInvoice.status}`);
    currentInvoiceHighlight.innerHTML = `
      <span>Total da fatura</span>
      <strong>${currentInvoice.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
      <small>${currentInvoice.monthLabel} • vencimento previsto dia ${card.dueDay}</small>
    `;
    currentInvoiceList.innerHTML = currentInvoice.installments
      .map((installment) => `
        <article class="invoice-entry">
          <div class="invoice-entry__header">
            <h3 class="invoice-entry__title">${installment.description}</h3>
            <strong class="transaction-amount expense">
              -${Number(installment.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </div>
          <div class="invoice-entry__details">
            <span>${installment.installmentNumber}/${installment.totalInstallments} parcelas</span>
            <span>${installment.category}</span>
          </div>
        </article>
      `)
      .join('');
    currentInvoiceEmptyState.hidden = true;
    markInvoicePaidButton.disabled = currentInvoice.status === 'paid';
    markInvoicePaidButton.dataset.invoiceCardId = card.id;
    markInvoicePaidButton.dataset.invoiceMonth = currentInvoice.month;
  }

  function renderInvoiceMonths(card) {
    const currentMonth = getCurrentMonthValue();
    const invoices = buildCardInvoices(card.id).filter((invoice) => invoice.month >= currentMonth);

    if (invoices.length === 0) {
      invoiceMonthFilter.innerHTML = '<option value="">Selecione um mês...</option>';
      invoiceDetailSummary.innerHTML = `
        <span>Fatura selecionada</span>
        <strong>Sem parcelas</strong>
        <small>Total previsto: R$ 0,00</small>
      `;
      invoiceMonths.innerHTML = '';
      invoiceDetailWrap.hidden = true;
      invoiceDetailEmptyState.hidden = false;
      invoiceDetailEmptyState.innerHTML = `
        <strong>Nenhuma parcela prevista para este mês.</strong>
        <span>Compras parceladas futuras aparecerão aqui automaticamente.</span>
      `;
      selectedInvoiceMonth = null;
      return;
    }

    if (!selectedInvoiceMonth || !invoices.some((invoice) => invoice.month === selectedInvoiceMonth)) {
      const hasCurrentMonth = invoices.some((invoice) => invoice.month === currentMonth);
      selectedInvoiceMonth = hasCurrentMonth ? currentMonth : invoices[0].month;
    }

    invoiceMonthFilter.innerHTML = `<option value="">Selecione um mês...</option>${generateMonthOptions(invoices)}`;
    invoiceMonthFilter.value = selectedInvoiceMonth;

    invoiceMonths.innerHTML = invoices
      .map((invoice) => `
        <button
          class="invoice-month-button ${invoice.month === selectedInvoiceMonth ? 'is-selected' : ''}"
          type="button"
          data-invoice-month="${invoice.month}"
        >
          <strong>${invoice.monthLabel}</strong>
          <span>${invoice.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </button>
      `)
      .join('');

    renderInvoiceByMonth(selectedInvoiceMonth, card);
  }

  function renderInvoiceByMonth(monthKey, card) {
    if (!monthKey) {
      invoiceDetailSummary.innerHTML = `
        <span>Fatura selecionada</span>
        <strong>Selecione um mês</strong>
        <small>Total previsto: R$ 0,00</small>
      `;
      invoiceDetailWrap.hidden = true;
      invoiceDetailEmptyState.hidden = false;
      invoiceDetailEmptyState.innerHTML = `
        <strong>Nenhuma parcela prevista para este mês.</strong>
        <span>Compras parceladas futuras aparecerão aqui automaticamente.</span>
      `;
      return;
    }

    const invoiceInstallments = getInstallmentsByMonth(monthKey, card.id);
    const total = calculateInvoiceTotal(invoiceInstallments);
    const monthLabel = formatMonthLabel(monthKey);
    const displayLabel = monthLabel ? monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1) : monthKey;

    invoiceDetailSummary.innerHTML = `
      <span>Fatura selecionada</span>
      <strong>${displayLabel}</strong>
      <small>Total previsto: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</small>
    `;

    if (invoiceInstallments.length === 0) {
      invoiceDetailBody.innerHTML = '';
      invoiceDetailWrap.hidden = true;
      invoiceDetailEmptyState.hidden = false;
      invoiceDetailEmptyState.innerHTML = `
        <strong>Nenhuma parcela prevista para este mês.</strong>
        <span>Compras parceladas futuras aparecerão aqui automaticamente.</span>
      `;
      return;
    }

    invoiceDetailBody.innerHTML = invoiceInstallments
      .map((installment) => `
        <tr>
          <td data-label="Origem">${installment.description}</td>
          <td data-label="Cartão">${card.name}</td>
          <td data-label="Categoria">${installment.category}</td>
          <td data-label="Parcela">${installment.installmentNumber}/${installment.totalInstallments}</td>
          <td data-label="Valor">
            <strong class="transaction-amount expense">
              -${Number(installment.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </td>
          <td data-label="Status">
            <span class="recurrence-status ${installment.status === 'paid' ? 'status-active' : 'status-paused'}">
              ${installment.status === 'paid' ? 'Paga' : 'Pendente'}
            </span>
          </td>
        </tr>
      `)
      .join('');
    invoiceDetailWrap.hidden = false;
    invoiceDetailEmptyState.hidden = true;
  }

  function renderCardsView() {
    renderTransactionAccountOptions(transactionCardInput.value);
    if (selectedCardId && !getCardById(selectedCardId)) {
      selectedCardId = cards[0] ? cards[0].id : null;
      selectedInvoiceMonth = null;
    }
    renderCardsList();

    const selectedCard = getSelectedCard();

    if (!selectedCard) {
      currentCardTitle.textContent = 'Selecione um cartão';
      currentInvoiceStatus.textContent = 'Sem fatura';
      currentInvoiceStatus.className = 'card-chip invoice-status-chip';
      currentInvoiceHighlight.innerHTML = `
        <span>Total da fatura</span>
        <strong>R$ 0,00</strong>
        <small>As compras no crédito entram aqui mês a mês.</small>
      `;
      currentInvoiceList.innerHTML = '';
      currentInvoiceEmptyState.hidden = false;
      invoiceMonthFilter.innerHTML = '<option value="">Selecione um mês...</option>';
      invoiceDetailSummary.innerHTML = `
        <span>Fatura selecionada</span>
        <strong>Selecione um cartão</strong>
        <small>Total previsto: R$ 0,00</small>
      `;
      invoiceMonths.innerHTML = '';
      invoiceDetailWrap.hidden = true;
      invoiceDetailEmptyState.hidden = false;
      invoiceDetailEmptyState.innerHTML = `
        <strong>Nenhum cartão selecionado.</strong>
        <span>Cadastre um cartão para visualizar faturas e parcelas futuras.</span>
      `;
      markInvoicePaidButton.disabled = true;
      return;
    }

    renderCurrentInvoice(selectedCard);
    renderInvoiceMonths(selectedCard);
  }

  function handleCardListClick(event) {
    const actionButton = event.target instanceof Element
      ? event.target.closest('[data-card-action], [data-select-card]')
      : null;

    if (!actionButton) {
      return;
    }

    const selectedCardActionId = actionButton.dataset.cardId || actionButton.dataset.selectCard;
    const card = getCardById(selectedCardActionId);

    if (!card) {
      return;
    }

    if (actionButton.dataset.selectCard) {
      selectedCardId = card.id;
      selectedInvoiceMonth = null;
      renderCardsView();
      return;
    }

    if (actionButton.dataset.cardAction === 'edit') {
      openEditCardModal(card, actionButton);
      return;
    }

    if (actionButton.dataset.cardAction === 'delete') {
      const shouldDelete = window.confirm('Tem certeza que deseja excluir este cartão?');

      if (!shouldDelete) {
        return;
      }

      if (editingCardId === card.id) {
        closeCardModal({ restoreFocus: false });
      }

      deleteCard(card.id);
      renderCardsView();
      renderKpis();
      applyFilter(currentFilter);
      renderTransactionsView();
    }
  }

  function markInvoiceAsPaid(cardId, invoiceMonth) {
    const invoice = buildCardInvoices(cardId).find((item) => item.month === invoiceMonth);

    if (!invoice || invoice.status === 'paid') {
      return;
    }

    const paidAt = getTodayDate();

    installments = installments.map((installment) => {
      if (installment.cardId !== cardId || installment.month !== invoiceMonth) {
        return installment;
      }

      return {
        ...installment,
        status: 'paid',
        paidAt,
      };
    });

    renderKpis();
    renderCardsView();
  }

  function getAccountMonthSummary(accountId) {
    const currentMonth = getCurrentMonthValue();
    const activities = getAccountActivitiesById(accountId).filter((activity) =>
      String(activity.date || '').startsWith(currentMonth)
    );

    return activities.reduce((summary, activity) => {
      const amount = Number(activity.amount || 0);

      if (normalizeTransactionType(activity.type) === 'receita') {
        summary.income += amount;
      } else {
        summary.expense += amount;
      }

      return summary;
    }, { income: 0, expense: 0 });
  }

  function getAccountsSummaryCards() {
    const activeAccounts = accounts.filter((account) => normalizeAccountStatus(account.status) === 'active');
    const cashAccounts = activeAccounts.filter((account) => !isCreditAccount(account));
    const creditAccounts = activeAccounts.filter((account) => isCreditAccount(account));

    const totalCash = cashAccounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const totalCreditUsed = creditAccounts.reduce((sum, account) => sum + Number(account.creditUsed || 0), 0);
    const totalCreditAvailable = creditAccounts.reduce((sum, account) => sum + getAccountAvailableLimit(account), 0);
    const futureInvoices = creditAccounts.reduce((sum, account) => sum + Number(account.invoiceNext || 0), 0);

    return [
      {
        label: 'Saldo total disponivel',
        value: totalCash + totalCreditAvailable,
        note: 'Caixa somado ao limite livre no credito',
        tone: 'navy',
      },
      {
        label: 'Total em contas e carteiras',
        value: totalCash,
        note: 'Saldos de contas correntes, poupancas e carteira',
        tone: 'green',
      },
      {
        label: 'Total usado em credito',
        value: totalCreditUsed,
        note: 'Valor comprometido nos cartoes ativos',
        tone: 'red',
      },
      {
        label: 'Faturas futuras previstas',
        value: futureInvoices,
        note: 'Soma da proxima fatura dos cartoes ativos',
        tone: 'gold',
      },
    ];
  }

  function renderAccountsSummary() {
    accountsSummaryGrid.innerHTML = getAccountsSummaryCards()
      .map((kpi) => components.renderKpiCard(kpi))
      .join('');
  }

  function renderLinkedPaymentAccountOptions(selectedValue = '') {
    accountLinkedPaymentInput.innerHTML = '<option value="">Selecione uma conta...</option>';

    getNonCreditAccounts().forEach((account) => {
      accountLinkedPaymentInput.appendChild(new Option(account.name, account.id));
    });

    accountLinkedPaymentInput.value = selectedValue;
  }

  function updateAccountCreditFields() {
    const isCredit = normalizeAccountType(accountTypeInput.value) === 'credit_card';

    accountCreditFields.hidden = !isCredit;
    accountCreditLimitInput.required = isCredit;
    accountClosingDayInput.required = isCredit;
    accountDueDayInput.required = isCredit;
    accountLinkedPaymentInput.required = isCredit;

    if (!isCredit) {
      accountCreditLimitInput.value = '';
      accountClosingDayInput.value = '';
      accountDueDayInput.value = '';
      accountLinkedPaymentInput.value = '';
    }
  }

  function setAccountFormFeedback(message, tone) {
    accountFeedback.textContent = message;
    accountFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      accountFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      accountFeedback.classList.add('is-success');
    }
  }

  function resetAccountForm() {
    accountForm.reset();
    accountTypeInput.value = 'checking';
    accountStatusInput.value = 'active';
    accountColorInput.value = '#1a365d';
    accountIconInput.value = 'bank';
    renderLinkedPaymentAccountOptions();
    updateAccountCreditFields();
    setAccountFormFeedback('', 'info');
  }

  function showAccountModal(focusTarget) {
    const safeFocusTarget = focusTarget && typeof focusTarget.focus === 'function'
      ? focusTarget
      : accountNameInput;

    accountModal.hidden = false;
    document.body.classList.add('modal-open');

    window.requestAnimationFrame(() => {
      safeFocusTarget.focus();
    });
  }

  function closeAccountModal(options = {}) {
    const { restoreFocus = true } = options;

    accountModal.hidden = true;
    document.body.classList.remove('modal-open');
    resetAccountForm();
    accountModalMode = 'create';
    editingAccountId = null;

    if (restoreFocus && lastAccountModalTrigger && document.contains(lastAccountModalTrigger)) {
      lastAccountModalTrigger.focus();
    }

    lastAccountModalTrigger = null;
  }

  function openCreateAccountModal(triggerButton = btnAddAccount) {
    accountModalMode = 'create';
    editingAccountId = null;
    lastAccountModalTrigger = triggerButton || btnAddAccount;

    accountModalTitle.textContent = 'Nova conta';
    accountModalDescription.textContent =
      'Cadastre uma conta bancaria, carteira ou cartao de credito sem sair do dashboard.';
    accountSubmitButton.textContent = 'Salvar conta';

    resetAccountForm();
    showAccountModal(accountNameInput);
  }

  function openEditAccountModal(account, triggerButton) {
    accountModalMode = 'edit';
    editingAccountId = account.id;
    lastAccountModalTrigger = triggerButton || null;

    accountModalTitle.textContent = 'Editar conta';
    accountModalDescription.textContent =
      'Atualize os dados da conta mantendo a estrutura preparada para evolucao futura.';
    accountSubmitButton.textContent = 'Salvar alteracoes';

    resetAccountForm();
    accountNameInput.value = account.name || '';
    accountTypeInput.value = normalizeAccountType(account.type);
    accountBalanceInput.value = Number(account.balance || 0).toFixed(2);
    accountInstitutionInput.value = account.institution || '';
    accountColorInput.value = account.color || '#1a365d';
    accountIconInput.value = account.icon || 'bank';
    accountStatusInput.value = normalizeAccountStatus(account.status);
    renderLinkedPaymentAccountOptions(account.linkedPaymentAccountId || '');
    updateAccountCreditFields();

    if (isCreditAccount(account)) {
      accountCreditLimitInput.value = Number(account.creditLimit || 0).toFixed(2);
      accountClosingDayInput.value = String(account.closingDay || '');
      accountDueDayInput.value = String(account.dueDay || '');
    }

    showAccountModal(accountNameInput);
  }

  function buildAccountFromForm() {
    const accountType = normalizeAccountType(accountTypeInput.value);
    const isCredit = accountType === 'credit_card';

    return {
      name: String(accountNameInput.value || '').trim(),
      type: accountType,
      balance: Number(accountBalanceInput.value || 0),
      institution: String(accountInstitutionInput.value || '').trim(),
      color: accountColorInput.value || '#1a365d',
      icon: String(accountIconInput.value || 'bank').trim(),
      status: normalizeAccountStatus(accountStatusInput.value),
      creditLimit: isCredit ? Number(accountCreditLimitInput.value || 0) : 0,
      creditUsed: isCredit ? Number((getAccountById(editingAccountId) || {}).creditUsed || 0) : 0,
      invoiceCurrent: isCredit ? Number((getAccountById(editingAccountId) || {}).invoiceCurrent || 0) : 0,
      invoiceNext: isCredit ? Number((getAccountById(editingAccountId) || {}).invoiceNext || 0) : 0,
      closingDay: isCredit ? Number(accountClosingDayInput.value || 0) : 0,
      dueDay: isCredit ? Number(accountDueDayInput.value || 0) : 0,
      linkedPaymentAccountId: isCredit ? String(accountLinkedPaymentInput.value || '') : '',
    };
  }

  function updateAccount(accountId, updatedFields) {
    accounts = accounts.map((account) => {
      if (account.id !== accountId) {
        return account;
      }

      const currentAccount = getAccountById(accountId) || {};

      return {
        ...currentAccount,
        ...account,
        ...updatedFields,
        currentInvoiceItems: updatedFields.type === 'credit_card'
          ? (currentAccount.currentInvoiceItems || [])
          : [],
        upcomingInstallments: updatedFields.type === 'credit_card'
          ? (currentAccount.upcomingInstallments || [])
          : [],
      };
    });
  }

  function deleteAccount(accountId) {
    accounts = accounts.filter((account) => account.id !== accountId);
    accountActivities = accountActivities.filter((activity) => activity.accountId !== accountId);

    if (viewingAccountId === accountId) {
      viewingAccountId = null;
    }

    accounts = accounts.map((account) => {
      if (account.linkedPaymentAccountId !== accountId) {
        return account;
      }

      return {
        ...account,
        linkedPaymentAccountId: '',
      };
    });
  }

  function renderAccountsList() {
    if (accounts.length === 0) {
      accountsList.innerHTML = '';
      accountsEmptyState.hidden = false;
      return;
    }

    accountsEmptyState.hidden = true;
    accountsList.innerHTML = accounts
      .map((account) => components.renderAccountCard(account))
      .join('');
  }

  function renderAccountActivitiesTable(activities) {
    if (activities.length === 0) {
      return `
        <div class="empty-state">
          <strong>Nenhuma movimentacao vinculada a esta conta.</strong>
          <span>Quando o fluxo for conectado a transacoes reais, o historico aparecera aqui.</span>
        </div>
      `;
    }

    return `
      <div class="transactions-table-wrap">
        <table class="transactions-table" aria-label="Historico recente da conta">
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Descricao</th>
              <th scope="col">Categoria</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${activities.map((activity) => `
              <tr>
                <td data-label="Data">${formatDate(activity.date)}</td>
                <td data-label="Descricao">
                  <div class="transactions-table__description">
                    <strong>${activity.description}</strong>
                    <div class="transaction-meta">
                      <span class="transaction-badge ${normalizeTransactionType(activity.type) === 'receita' ? 'income' : 'expense'}">
                        ${normalizeTransactionType(activity.type) === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                      ${activity.installmentLabel ? `<span class="transaction-secondary">${activity.installmentLabel}</span>` : ''}
                    </div>
                  </div>
                </td>
                <td data-label="Categoria"><span class="transaction-secondary">${activity.category || 'Sem categoria'}</span></td>
                <td data-label="Valor">
                  <strong class="transaction-amount ${normalizeTransactionType(activity.type) === 'receita' ? 'income' : 'expense'}">
                    ${normalizeTransactionType(activity.type) === 'receita' ? '+' : '-'}${Number(activity.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function openAccountDetailModal(account, triggerButton) {
    const monthSummary = getAccountMonthSummary(account.id);
    const recentActivities = getAccountActivitiesById(account.id).slice(0, 6);
    const isCredit = isCreditAccount(account);
    const linkedAccount = account.linkedPaymentAccountId ? getAccountById(account.linkedPaymentAccountId) : null;
    const availableLimit = getAccountAvailableLimit(account);

    viewingAccountId = account.id;
    lastAccountModalTrigger = triggerButton || null;
    accountDetailTitle.textContent = account.name;
    accountDetailDescription.textContent = isCredit
      ? 'Resumo do cartao, limite utilizado e previsao de faturas.'
      : 'Resumo da conta, saldo atual e historico recente de movimentacoes.';

    accountDetailBody.innerHTML = `
      <section class="account-detail-hero">
        <h3>${account.name}</h3>
        <p>${isCredit ? 'Cartao preparado para acompanhar limite, fatura atual e proximas parcelas.' : 'Conta preparada para mostrar saldo, entradas e saidas do mes.'}</p>
      </section>

      <section class="account-detail-grid">
        <div class="account-detail-section">
          <div class="account-detail-kpis">
            <article class="account-detail-box">
              <span>Tipo</span>
              <strong>${getAccountTypeLabel(account.type)}</strong>
              <small>${account.institution || 'Sem instituicao'}</small>
            </article>
            <article class="account-detail-box">
              <span>Status</span>
              <strong>${normalizeAccountStatus(account.status) === 'inactive' ? 'Inativa' : 'Ativa'}</strong>
              <small>${normalizeAccountStatus(account.status) === 'inactive' ? 'A conta nao entra nos totais principais.' : 'A conta participa dos indicadores de resumo.'}</small>
            </article>
            <article class="account-detail-box">
              <span>Entradas do mes</span>
              <strong>${monthSummary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              <small>Receitas registradas neste mes para esta conta.</small>
            </article>
            <article class="account-detail-box">
              <span>Saidas do mes</span>
              <strong>${monthSummary.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              <small>Despesas registradas neste mes para esta conta.</small>
            </article>
          </div>

          <div class="dashboard-card">
            <div class="card-head">
              <div class="card-head-copy">
                <p class="section-label">Historico recente</p>
                <h2>Movimentacoes vinculadas</h2>
              </div>
            </div>
            ${renderAccountActivitiesTable(recentActivities)}
          </div>
        </div>

        <div class="account-detail-section">
          ${isCredit ? `
            <div class="dashboard-card">
              <div class="card-head">
                <div class="card-head-copy">
                  <p class="section-label">Credito</p>
                  <h2>Resumo da fatura</h2>
                </div>
              </div>

              <div class="account-detail-kpis">
                <article class="account-detail-box">
                  <span>Limite total</span>
                  <strong>${Number(account.creditLimit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small>Dia de fechamento: ${account.closingDay || '-'}</small>
                </article>
                <article class="account-detail-box">
                  <span>Disponivel</span>
                  <strong>${availableLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small>Dia de vencimento: ${account.dueDay || '-'}</small>
                </article>
                <article class="account-detail-box">
                  <span>Fatura atual</span>
                  <strong>${Number(account.invoiceCurrent || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small>${linkedAccount ? `Pagamento sugerido por ${linkedAccount.name}.` : 'Sem conta vinculada para pagamento.'}</small>
                </article>
                <article class="account-detail-box">
                  <span>Proxima fatura</span>
                  <strong>${Number(account.invoiceNext || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small>Previsao baseada no uso atual do credito.</small>
                </article>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-head">
                <div class="card-head-copy">
                  <p class="section-label">Parcelas</p>
                  <h2>Fatura atual e proximas compras</h2>
                </div>
              </div>

              <div class="account-detail-list">
                ${(account.currentInvoiceItems || []).length > 0 ? account.currentInvoiceItems.map((item) => `
                  <article class="account-detail-list-item">
                    <div class="account-detail-list-item__head">
                      <strong>${item.description}</strong>
                      <strong class="transaction-amount expense">-${Number(item.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </div>
                    <div class="account-detail-list-item__meta">
                      <span>${item.category || 'Sem categoria'}</span>
                      <span>${item.installmentLabel || 'Parcela unica'}</span>
                    </div>
                  </article>
                `).join('') : `
                  <div class="empty-state">
                    <strong>Nenhuma compra na fatura atual.</strong>
                    <span>As compras no credito aparecerao aqui conforme o uso do cartao.</span>
                  </div>
                `}
              </div>

              <div class="account-detail-list">
                ${(account.upcomingInstallments || []).length > 0 ? account.upcomingInstallments.map((item) => `
                  <article class="account-detail-list-item">
                    <div class="account-detail-list-item__head">
                      <strong>${item.description}</strong>
                      <strong class="transaction-amount expense">-${Number(item.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </div>
                    <div class="account-detail-list-item__meta">
                      <span>${formatMonthLabel(item.month)}</span>
                      <span>${item.installmentLabel || 'Parcela futura'}</span>
                    </div>
                  </article>
                `).join('') : ''}
              </div>
            </div>
          ` : `
            <div class="dashboard-card">
              <div class="card-head">
                <div class="card-head-copy">
                  <p class="section-label">Conta</p>
                  <h2>Informacoes principais</h2>
                </div>
              </div>

              <div class="account-detail-kpis">
                <article class="account-detail-box">
                  <span>Saldo atual</span>
                  <strong>${Number(account.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small>Saldo disponivel para movimentacao imediata.</small>
                </article>
                <article class="account-detail-box">
                  <span>Instituicao</span>
                  <strong>${account.institution || 'Sem instituicao'}</strong>
                  <small>Informacao visual para identificar a conta.</small>
                </article>
              </div>
            </div>
          `}
        </div>
      </section>
    `;

    accountDetailModal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeAccountDetailModal(options = {}) {
    const { restoreFocus = true } = options;

    accountDetailModal.hidden = true;
    document.body.classList.remove('modal-open');
    accountDetailBody.innerHTML = '';
    viewingAccountId = null;

    if (restoreFocus && lastAccountModalTrigger && document.contains(lastAccountModalTrigger)) {
      lastAccountModalTrigger.focus();
    }

    lastAccountModalTrigger = null;
  }

  async function handleDeleteAccount(accountId) {
    const account = getAccountById(accountId);

    if (!account) {
      return;
    }

    const shouldDelete = window.confirm('Tem certeza que deseja excluir esta conta?');

    if (!shouldDelete) {
      return;
    }

    if (editingAccountId === accountId) {
      closeAccountModal({ restoreFocus: false });
    }

    if (viewingAccountId === accountId) {
      closeAccountDetailModal({ restoreFocus: false });
    }

    try {
      await financeDataService.deleteAccount(authenticatedUser.id, accountId);
      deleteAccount(accountId);
      renderAccountsView();
    } catch (error) {
      console.error('Não foi possível excluir a conta.', error);
      window.alert('Não foi possível excluir esta conta. Remova primeiro os registros vinculados a ela.');
    }
  }

  function handleAccountActionClick(event) {
    const actionButton = event.target instanceof Element
      ? event.target.closest('[data-account-action], [data-account-id]')
      : null;

    if (!actionButton) {
      return;
    }

    const accountId = actionButton.dataset.accountId;
    const account = getAccountById(accountId);

    if (!account) {
      return;
    }

    const action = actionButton.dataset.accountAction;

    if (!action) {
      openAccountDetailModal(account, actionButton);
      return;
    }

    if (action === 'view') {
      openAccountDetailModal(account, actionButton);
      return;
    }

    if (action === 'edit') {
      openEditAccountModal(account, actionButton);
      return;
    }

    if (action === 'delete') {
      handleDeleteAccount(accountId);
    }
  }

  function renderAccountsView() {
    if (!accountsSummaryGrid || !accountsList || !accountsEmptyState) {
      renderTransactionAccountOptions(transactionCardInput.value);
      return;
    }

    renderAccountsSummary();
    renderLinkedPaymentAccountOptions(accountLinkedPaymentInput.value);
    renderAccountsList();
    renderTransactionAccountOptions(transactionCardInput.value);
  }

  function getManagedCategoryById(categoryId) {
    return categories.find((category) => category.id === categoryId) || null;
  }

  function getRecurringActivitiesByCategory(categoryId) {
    const category = getManagedCategoryById(categoryId);

    if (!category) {
      return [];
    }

    const categoryName = normalizeCategoryName(category.name).toLocaleLowerCase('pt-BR');
    const expectedRecurrenceType = category.type === 'income' ? 'receita' : 'despesa';

    return recurrences
      .filter((recurrence) => normalizeRecurrenceStatus(recurrence.status) === 'active')
      .filter((recurrence) => {
        const recurrenceType = normalizeTransactionType(recurrence.type);
        const recurrenceCategoryName = normalizeCategoryName(recurrence.category).toLocaleLowerCase('pt-BR');

        return recurrenceType === expectedRecurrenceType && recurrenceCategoryName === categoryName;
      })
      .map((recurrence) => ({
        id: `recurrence-${recurrence.id}`,
        categoryId,
        date: buildSyntheticRecurrenceDate(recurrence.dayOfMonth),
        description: recurrence.description,
        amount: getRecurrenceAmount(recurrence),
        type: normalizeTransactionType(recurrence.type),
        source: 'recorrencia',
        dayOfMonth: Number(recurrence.dayOfMonth) || 1,
        frequency: recurrence.frequency || 'monthly',
        displayDate: formatRecurrenceFrequency(recurrence.dayOfMonth),
      }));
  }

  function getCategoryActivitiesById(categoryId) {
    const recurringActivities = getRecurringActivitiesByCategory(categoryId);

    return [
      ...categoryActivities
      .filter((activity) => activity.categoryId === categoryId)
      .map((activity) => ({ ...activity })),
      ...recurringActivities,
    ].sort((first, second) => String(second.date || '').localeCompare(String(first.date || '')));
  }

  function getCategoryMonthlyTotal(categoryId) {
    const currentMonth = getCurrentMonthValue();

    return getCategoryActivitiesById(categoryId)
      .filter((activity) => String(activity.date || '').startsWith(currentMonth))
      .reduce((sum, activity) => sum + Number(activity.amount || 0), 0);
  }

  function getCategoryTransactionCount(categoryId) {
    return getCategoryActivitiesById(categoryId).length;
  }

  function getFilteredManagedCategories() {
    if (currentManagedCategoryFilter === 'inactive') {
      return categories.filter((category) => normalizeManagedCategoryStatus(category.status) === 'inactive');
    }

    if (currentManagedCategoryFilter === 'income' || currentManagedCategoryFilter === 'expense') {
      return categories.filter((category) => category.type === currentManagedCategoryFilter);
    }

    return [...categories];
  }

  function setManagedCategoryFilter(filter) {
    currentManagedCategoryFilter = filter;

    managedCategoryFilterButtons.forEach((button) => {
      const isActive = button.dataset.managedCategoryFilter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function getCategoriesSummaryCards() {
    const totalCategories = categories.length;
    const expenseCategories = categories.filter((category) => category.type === 'expense').length;
    const incomeCategories = categories.filter((category) => category.type === 'income').length;
    const inactiveCategories = categories.filter((category) => normalizeManagedCategoryStatus(category.status) === 'inactive').length;

    return [
      {
        label: 'Total de categorias',
        value: String(totalCategories),
        note: totalCategories === 1 ? 'Uma categoria pronta para classificar lancamentos.' : 'Categorias disponiveis para organizar o sistema.',
        tone: 'navy',
      },
      {
        label: 'Categorias de despesas',
        value: String(expenseCategories),
        note: 'Estrutura para classificar saidas e custos do dia a dia.',
        tone: 'red',
      },
      {
        label: 'Categorias de receitas',
        value: String(incomeCategories),
        note: 'Base para entradas como salario, vendas e investimentos.',
        tone: 'green',
      },
      {
        label: 'Categorias inativas',
        value: String(inactiveCategories),
        note: 'Itens pausados que nao devem aparecer nos novos cadastros.',
        tone: 'gold',
      },
    ];
  }

  function renderCategoriesSummary() {
    categoriesSummaryGrid.innerHTML = getCategoriesSummaryCards()
      .map((kpi) => components.renderKpiCard(kpi))
      .join('');
  }

  function renderManagedCategoriesGrid() {
    const filteredCategories = getFilteredManagedCategories();

    if (filteredCategories.length === 0) {
      categoriesGrid.innerHTML = '';
      categoriesGrid.hidden = true;
      categoriesEmptyState.hidden = false;

      if (categories.length === 0) {
        categoriesEmptyState.innerHTML = `
          <strong>Nenhuma categoria cadastrada ainda.</strong>
          <span>Crie sua primeira categoria para organizar receitas, despesas e relatorios futuros.</span>
          <button class="modal-button modal-button--primary empty-state__action" id="btnCreateFirstManagedCategory" type="button">
            Criar primeira categoria
          </button>
        `;

        const firstButton = document.getElementById('btnCreateFirstManagedCategory');

        if (firstButton) {
          firstButton.addEventListener('click', (event) => {
            event.preventDefault();
            openCreateManagedCategoryModal(firstButton);
          });
        }

        return;
      }

      categoriesEmptyState.innerHTML = `
        <strong>Nenhuma categoria encontrada.</strong>
        <span>Ajuste o filtro atual ou crie uma nova categoria para esta visao.</span>
      `;
      return;
    }

    categoriesGrid.innerHTML = filteredCategories
      .map((category) => components.renderCategoryCard({
        ...category,
        transactionCount: getCategoryTransactionCount(category.id),
        monthlyTotal: getCategoryMonthlyTotal(category.id),
      }))
      .join('');

    categoriesGrid.hidden = false;
    categoriesEmptyState.hidden = true;
  }

  function renderCategoriesView() {
    renderCategoriesSummary();
    setManagedCategoryFilter(currentManagedCategoryFilter);
    renderManagedCategoriesGrid();
  }

  function getReportSourceLabel(source) {
    const sourceMap = {
      manual: 'Manual',
      recorrencia: 'Recorrencia',
      whatsapp: 'WhatsApp',
      bancaria: 'Bancaria',
    };

    return sourceMap[String(source || '').toLowerCase()] || 'Manual';
  }

  function getReportsUniqueAccounts() {
    const accountMap = new Map();

    reportTransactions.forEach((transaction) => {
      if (!transaction.accountId) {
        return;
      }

      if (!accountMap.has(transaction.accountId)) {
        accountMap.set(transaction.accountId, {
          id: transaction.accountId,
          name: transaction.accountName || 'Conta',
          type: transaction.accountType || 'checking',
        });
      }
    });

    return Array.from(accountMap.values()).sort((first, second) =>
      String(first.name || '').localeCompare(String(second.name || ''), 'pt-BR'),
    );
  }

  function getReportsUniqueCategories() {
    return Array.from(new Set(
      reportTransactions
        .map((transaction) => String(transaction.category || '').trim())
        .filter(Boolean),
    )).sort((first, second) => first.localeCompare(second, 'pt-BR'));
  }

  function renderReportsFilterOptions() {
    const currentAccountValue = reportsViewFilters.account || 'all';
    const currentCategoryValue = reportsViewFilters.category || 'all';
    const accountsForReports = getReportsUniqueAccounts();
    const categoriesForReports = getReportsUniqueCategories();

    reportsPeriodFilter.value = reportsViewFilters.period;
    reportsTypeFilter.value = reportsViewFilters.type;

    reportsAccountFilter.innerHTML = '<option value="all">Todas</option>';
    accountsForReports.forEach((account) => {
      reportsAccountFilter.appendChild(new Option(account.name, account.id));
    });

    reportsCategoryFilter.innerHTML = '<option value="all">Todas</option>';
    categoriesForReports.forEach((category) => {
      reportsCategoryFilter.appendChild(new Option(category, category));
    });

    reportsAccountFilter.value = accountsForReports.some((account) => account.id === currentAccountValue)
      ? currentAccountValue
      : 'all';
    reportsCategoryFilter.value = categoriesForReports.includes(currentCategoryValue)
      ? currentCategoryValue
      : 'all';
    reportsViewFilters.account = reportsAccountFilter.value;
    reportsViewFilters.category = reportsCategoryFilter.value;
  }

  function isReportTransactionInsidePeriod(transaction, period) {
    const transactionDate = parseISODate(transaction.date);

    if (!transactionDate) {
      return false;
    }

    const todayIso = getTodayDate();
    const today = parseISODate(todayIso);

    if (!today) {
      return true;
    }

    if (period === 'month') {
      return String(transaction.date || '').startsWith(todayIso.slice(0, 7));
    }

    if (period === 'year') {
      return String(transaction.date || '').startsWith(todayIso.slice(0, 4));
    }

    if (period === 'last3' || period === 'last6') {
      const startDate = new Date(today);
      startDate.setDate(1);
      startDate.setMonth(startDate.getMonth() - (period === 'last3' ? 2 : 5));
      startDate.setHours(0, 0, 0, 0);
      return transactionDate >= startDate && transactionDate <= today;
    }

    return true;
  }

  function getFilteredReportTransactions() {
    return reportTransactions
      .filter((transaction) => {
        const normalizedType = normalizeTransactionType(transaction.type);

        if (reportsViewFilters.type !== 'all' && normalizedType !== reportsViewFilters.type) {
          return false;
        }

        if (reportsViewFilters.account !== 'all' && transaction.accountId !== reportsViewFilters.account) {
          return false;
        }

        if (reportsViewFilters.category !== 'all' && transaction.category !== reportsViewFilters.category) {
          return false;
        }

        if (!isReportTransactionInsidePeriod(transaction, reportsViewFilters.period)) {
          return false;
        }

        return true;
      })
      .sort((first, second) => String(second.date || '').localeCompare(String(first.date || '')));
  }

  function getReportsSummaryCards(sourceTransactions) {
    const totalReceived = sourceTransactions
      .filter((transaction) => normalizeTransactionType(transaction.type) === 'receita')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const totalSpent = sourceTransactions
      .filter((transaction) => normalizeTransactionType(transaction.type) === 'despesa')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const totalCredit = sourceTransactions
      .filter((transaction) =>
        normalizeTransactionType(transaction.type) === 'despesa' &&
        String(transaction.paymentMethod || '').toLowerCase() === 'credit',
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const expenseByCategory = sourceTransactions
      .filter((transaction) => normalizeTransactionType(transaction.type) === 'despesa')
      .reduce((accumulator, transaction) => {
        const key = transaction.category || 'Sem categoria';
        accumulator[key] = (accumulator[key] || 0) + Number(transaction.amount || 0);
        return accumulator;
      }, {});
    const biggestExpenseCategoryEntry = Object.entries(expenseByCategory)
      .sort((first, second) => second[1] - first[1])[0];
    const biggestExpenseCategory = biggestExpenseCategoryEntry ? biggestExpenseCategoryEntry[0] : 'Nenhuma';

    return [
      {
        label: 'Total recebido',
        value: totalReceived,
        note: 'Entradas filtradas para o periodo atual.',
        tone: 'green',
      },
      {
        label: 'Total gasto',
        value: totalSpent,
        note: 'Despesas consolidadas no recorte selecionado.',
        tone: 'red',
      },
      {
        label: 'Saldo do periodo',
        value: totalReceived - totalSpent,
        note: 'Receitas menos despesas dentro dos filtros ativos.',
        tone: 'navy',
      },
      {
        label: 'Maior categoria de despesa',
        value: biggestExpenseCategory,
        note: biggestExpenseCategoryEntry
          ? `${formatCurrency(biggestExpenseCategoryEntry[1])} concentrados nesta categoria.`
          : 'Ainda nao ha gastos para comparar.',
        tone: 'gold',
      },
      {
        label: 'Total no credito/cartoes',
        value: totalCredit,
        note: 'Compras no credito identificadas no periodo.',
        tone: 'navy',
      },
    ];
  }

  function renderReportsSummary(sourceTransactions) {
    reportsSummaryGrid.innerHTML = getReportsSummaryCards(sourceTransactions)
      .map((kpi) => components.renderKpiCard(kpi))
      .join('');
  }

  function buildReportsMonthlySeries(sourceTransactions) {
    const groupedByMonth = sourceTransactions.reduce((accumulator, transaction) => {
      const monthKey = String(transaction.date || '').slice(0, 7);

      if (!monthKey) {
        return accumulator;
      }

      if (!accumulator[monthKey]) {
        accumulator[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
        };
      }

      if (normalizeTransactionType(transaction.type) === 'receita') {
        accumulator[monthKey].income += Number(transaction.amount || 0);
      } else {
        accumulator[monthKey].expense += Number(transaction.amount || 0);
      }

      return accumulator;
    }, {});

    return Object.values(groupedByMonth).sort((first, second) => first.month.localeCompare(second.month));
  }

  function renderReportsChart(sourceTransactions) {
    const monthlySeries = buildReportsMonthlySeries(sourceTransactions);

    if (monthlySeries.length === 0) {
      reportsChartBars.innerHTML = '';
      reportsChartEmptyState.hidden = false;
      return;
    }

    const maxValue = monthlySeries.reduce((currentMax, item) =>
      Math.max(currentMax, item.income, item.expense), 0) || 1;

    reportsChartBars.innerHTML = monthlySeries.map((item) => {
      const incomeHeight = Math.max((item.income / maxValue) * 100, item.income > 0 ? 12 : 0);
      const expenseHeight = Math.max((item.expense / maxValue) * 100, item.expense > 0 ? 12 : 0);

      return `
        <article class="reports-chart__month">
          <div class="reports-chart__legend">
            <span>${formatMonthLabel(item.month)}</span>
            <span>Saldo: ${formatCurrency(item.income - item.expense)}</span>
          </div>
          <div class="reports-chart__bars-group">
            <div class="reports-chart__bar-track">
              <span
                class="reports-chart__bar reports-chart__bar--income"
                style="height: ${incomeHeight.toFixed(2)}%;"
                title="Receitas: ${formatCurrency(item.income)}"
              ></span>
            </div>
            <div class="reports-chart__bar-track">
              <span
                class="reports-chart__bar reports-chart__bar--expense"
                style="height: ${expenseHeight.toFixed(2)}%;"
                title="Despesas: ${formatCurrency(item.expense)}"
              ></span>
            </div>
          </div>
          <div class="reports-chart__month-footer">
            <strong>Receitas ${formatCurrency(item.income)}</strong>
            <strong>Despesas ${formatCurrency(item.expense)}</strong>
          </div>
        </article>
      `;
    }).join('');

    reportsChartEmptyState.hidden = true;
  }

  function renderReportsCategoryBreakdown(sourceTransactions) {
    const categoryMap = sourceTransactions.reduce((accumulator, transaction) => {
      const key = transaction.category || 'Sem categoria';

      if (!accumulator[key]) {
        accumulator[key] = {
          name: key,
          type: normalizeTransactionType(transaction.type),
          total: 0,
          count: 0,
        };
      }

      accumulator[key].total += Number(transaction.amount || 0);
      accumulator[key].count += 1;
      return accumulator;
    }, {});
    const categoryItems = Object.values(categoryMap).sort((first, second) => second.total - first.total);
    const totalAmount = categoryItems.reduce((sum, item) => sum + item.total, 0) || 1;

    reportsCategoryBreakdown.innerHTML = categoryItems.length > 0
      ? categoryItems.map((item) => {
        const percentage = (item.total / totalAmount) * 100;
        return `
          <article class="reports-breakdown-item">
            <div class="reports-breakdown-item__head">
              <div>
                <strong>${item.name}</strong>
                <div class="reports-breakdown-item__meta">
                  <span>${item.type === 'receita' ? 'Receita' : 'Despesa'}</span>
                  <span>${item.count} transacoes</span>
                </div>
              </div>
              <strong class="transaction-amount ${item.type === 'receita' ? 'income' : 'expense'}">
                ${item.type === 'receita' ? '+' : '-'}${formatCurrency(item.total)}
              </strong>
            </div>
            <div class="reports-breakdown-item__progress">
              <span style="width: ${percentage.toFixed(2)}%;"></span>
            </div>
            <div class="reports-breakdown-item__footer">
              <span>${percentage.toFixed(0)}% de participacao no periodo.</span>
              <span>${item.type === 'receita' ? 'Entrada consolidada.' : 'Saida consolidada.'}</span>
            </div>
          </article>
        `;
      }).join('')
      : `
        <div class="empty-state">
          <strong>Sem categorias no periodo.</strong>
          <span>Os agrupamentos por categoria aparecerao aqui conforme houver movimentacoes.</span>
        </div>
      `;
  }

  function renderReportsAccountBreakdown(sourceTransactions) {
    const accountMap = sourceTransactions.reduce((accumulator, transaction) => {
      const key = transaction.accountId || transaction.accountName || 'sem-conta';

      if (!accumulator[key]) {
        accumulator[key] = {
          id: transaction.accountId || '',
          name: transaction.accountName || 'Conta nao informada',
          type: transaction.accountType || 'checking',
          income: 0,
          expense: 0,
          count: 0,
        };
      }

      if (normalizeTransactionType(transaction.type) === 'receita') {
        accumulator[key].income += Number(transaction.amount || 0);
      } else {
        accumulator[key].expense += Number(transaction.amount || 0);
      }

      accumulator[key].count += 1;
      return accumulator;
    }, {});
    const accountItems = Object.values(accountMap).sort((first, second) =>
      Math.max(second.income, second.expense) - Math.max(first.income, first.expense),
    );
    const highestMovement = accountItems.reduce((maxValue, item) =>
      Math.max(maxValue, item.income + item.expense), 0) || 1;

    reportsAccountBreakdown.innerHTML = accountItems.length > 0
      ? accountItems.map((item) => {
        const linkedAccount = item.id ? getAccountById(item.id) : null;
        const isCredit = normalizeAccountType(item.type) === 'credit_card';
        const totalMovement = item.income + item.expense;
        const percentage = (totalMovement / highestMovement) * 100;

        return `
          <article class="reports-account-item">
            <div class="reports-account-item__head">
              <div>
                <strong>${item.name}</strong>
                <div class="reports-account-item__meta">
                  <span>${getAccountTypeLabel(item.type)}</span>
                  <span>${item.count} transacoes</span>
                </div>
              </div>
              <strong>${formatCurrency(totalMovement)}</strong>
            </div>
            <div class="reports-account-item__progress">
              <span style="width: ${percentage.toFixed(2)}%;"></span>
            </div>
            <div class="reports-account-item__footer">
              <span>Entradas ${formatCurrency(item.income)} | Saidas ${formatCurrency(item.expense)}</span>
              <span>
                ${isCredit && linkedAccount
                  ? `Fatura atual ${formatCurrency(linkedAccount.invoiceCurrent || 0)}.`
                  : 'Conta comum usada no periodo selecionado.'}
              </span>
            </div>
          </article>
        `;
      }).join('')
      : `
        <div class="empty-state">
          <strong>Nenhuma conta movimentada.</strong>
          <span>As contas e cartoes usados no periodo aparecerao aqui automaticamente.</span>
        </div>
      `;
  }

  function renderReportsCreditBreakdown(sourceTransactions) {
    const totalCreditSpent = sourceTransactions
      .filter((transaction) =>
        normalizeTransactionType(transaction.type) === 'despesa' &&
        String(transaction.paymentMethod || '').toLowerCase() === 'credit',
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const creditTransactions = sourceTransactions.filter((transaction) =>
      String(transaction.paymentMethod || '').toLowerCase() === 'credit',
    );
    const creditCards = accounts.filter((account) => isCreditAccount(account) && normalizeAccountStatus(account.status) === 'active');
    const currentInvoice = creditCards.reduce((sum, card) => sum + Number(card.invoiceCurrent || 0), 0);
    const futureInvoice = creditCards.reduce((sum, card) => sum + Number(card.invoiceNext || 0), 0);
    const cardUsage = creditTransactions.reduce((accumulator, transaction) => {
      const key = transaction.cardName || transaction.accountName || 'Cartao';
      accumulator[key] = (accumulator[key] || 0) + Number(transaction.amount || 0);
      return accumulator;
    }, {});
    const topCardEntry = Object.entries(cardUsage).sort((first, second) => second[1] - first[1])[0];

    reportsCreditBreakdown.innerHTML = `
      <article class="reports-credit-item">
        <div class="reports-credit-item__head">
          <strong>Total gasto no credito</strong>
          <strong class="transaction-amount expense">-${formatCurrency(totalCreditSpent)}</strong>
        </div>
        <p>Compras no credito identificadas pelo filtro atual.</p>
      </article>
      <article class="reports-credit-item">
        <div class="reports-credit-item__head">
          <strong>Fatura atual prevista</strong>
          <strong>${formatCurrency(currentInvoice)}</strong>
        </div>
        <small>Soma das faturas atuais dos cartoes ativos da interface.</small>
      </article>
      <article class="reports-credit-item">
        <div class="reports-credit-item__head">
          <strong>Parcelas futuras previstas</strong>
          <strong>${formatCurrency(futureInvoice)}</strong>
        </div>
        <small>Baseado nas proximas faturas dos cartoes cadastrados.</small>
      </article>
      <article class="reports-credit-item">
        <div class="reports-credit-item__head">
          <strong>Cartao mais utilizado</strong>
          <strong>${topCardEntry ? topCardEntry[0] : 'Nenhum'}</strong>
        </div>
        <small>${topCardEntry ? `${formatCurrency(topCardEntry[1])} concentrados neste cartao.` : 'Sem compras no credito para comparar.'}</small>
      </article>
    `;
  }

  function renderReportsTable(sourceTransactions) {
    if (sourceTransactions.length === 0) {
      reportsTableBody.innerHTML = '';
      reportsTableWrap.hidden = true;
      return;
    }

    reportsTableBody.innerHTML = sourceTransactions.map((transaction) => {
      const normalizedType = normalizeTransactionType(transaction.type);
      const installmentHint = transaction.installmentLabel
        ? `<div class="transaction-meta"><span class="transaction-secondary">${transaction.installmentLabel}</span></div>`
        : '';

      return `
        <tr>
          <td data-label="Data">${formatDate(transaction.date)}</td>
          <td data-label="Descricao">
            <div class="transactions-table__description">
              <strong>${transaction.description}</strong>
              ${installmentHint}
            </div>
          </td>
          <td data-label="Tipo">
            <span class="transaction-badge ${normalizedType === 'receita' ? 'income' : 'expense'}">
              ${normalizedType === 'receita' ? 'Receita' : 'Despesa'}
            </span>
          </td>
          <td data-label="Categoria">
            <span class="transaction-secondary">${transaction.category || 'Sem categoria'}</span>
          </td>
          <td data-label="Conta">
            <span class="transaction-secondary">${transaction.accountName || 'Conta nao informada'}</span>
          </td>
          <td data-label="Valor">
            <strong class="transaction-amount ${normalizedType === 'receita' ? 'income' : 'expense'}">
              ${normalizedType === 'receita' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </strong>
          </td>
          <td data-label="Origem">
            <span class="transaction-secondary">${getReportSourceLabel(transaction.source)}</span>
          </td>
        </tr>
      `;
    }).join('');

    reportsTableWrap.hidden = false;
  }

  function getCategoryExpenseForMonth(sourceTransactions, monthKey, categoryName) {
    return sourceTransactions
      .filter((transaction) =>
        normalizeTransactionType(transaction.type) === 'despesa' &&
        String(transaction.date || '').startsWith(monthKey) &&
        transaction.category === categoryName,
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  }

  function buildReportsInsights(sourceTransactions) {
    const insights = [];
    const currentMonth = getCurrentMonthValue();
    const previousMonth = addMonthsToMonthValue(currentMonth, -1);
    const currentFoodExpense = getCategoryExpenseForMonth(sourceTransactions, currentMonth, 'Alimentacao');
    const previousFoodExpense = getCategoryExpenseForMonth(sourceTransactions, previousMonth, 'Alimentacao');

    if (currentFoodExpense > 0 && previousFoodExpense > 0) {
      const delta = ((currentFoodExpense - previousFoodExpense) / previousFoodExpense) * 100;
      insights.push({
        badge: 'AL',
        title: `Voce ${delta >= 0 ? 'gastou' : 'reduziu'} ${Math.abs(delta).toFixed(0)}% em Alimentacao.`,
        text: `Comparativo entre ${formatMonthLabel(previousMonth)} e ${formatMonthLabel(currentMonth)} usando os dados do periodo.`,
      });
    }

    const creditTotals = sourceTransactions
      .filter((transaction) => String(transaction.paymentMethod || '').toLowerCase() === 'credit')
      .reduce((accumulator, transaction) => {
        const key = transaction.cardName || transaction.accountName || 'Cartao';
        accumulator[key] = (accumulator[key] || 0) + Number(transaction.amount || 0);
        return accumulator;
      }, {});
    const topCreditEntry = Object.entries(creditTotals).sort((first, second) => second[1] - first[1])[0];
    const totalCredit = Object.values(creditTotals).reduce((sum, value) => sum + Number(value || 0), 0);

    if (topCreditEntry && totalCredit > 0) {
      insights.push({
        badge: 'CR',
        title: `${topCreditEntry[0]} concentrou ${((topCreditEntry[1] / totalCredit) * 100).toFixed(0)}% dos gastos no credito.`,
        text: `Bom indicador para acompanhar limite usado, fatura atual e concentracao de despesas parceladas.`,
      });
    }

    const expenseByCategory = sourceTransactions
      .filter((transaction) => normalizeTransactionType(transaction.type) === 'despesa')
      .reduce((accumulator, transaction) => {
        const key = transaction.category || 'Sem categoria';
        accumulator[key] = (accumulator[key] || 0) + Number(transaction.amount || 0);
        return accumulator;
      }, {});
    const biggestExpenseEntry = Object.entries(expenseByCategory).sort((first, second) => second[1] - first[1])[0];

    if (biggestExpenseEntry) {
      insights.push({
        badge: 'DP',
        title: `Sua maior despesa no periodo foi ${biggestExpenseEntry[0]}.`,
        text: `A categoria somou ${formatCurrency(biggestExpenseEntry[1])} dentro do recorte analisado.`,
      });
    }

    if (insights.length === 0) {
      insights.push({
        badge: 'OK',
        title: 'Ainda nao ha massa critica suficiente para gerar insights mais profundos.',
        text: 'Cadastre mais movimentacoes para enriquecer comparativos e tendencias.',
      });
    }

    return insights.slice(0, 3);
  }

  function renderReportsInsights(sourceTransactions) {
    const insights = buildReportsInsights(sourceTransactions);

    reportsInsightsList.innerHTML = insights.map((insight) => `
      <article class="reports-insight-item">
        <span class="reports-insight-item__badge">${insight.badge}</span>
        <div>
          <strong>${insight.title}</strong>
          <p>${insight.text}</p>
        </div>
      </article>
    `).join('');
  }

  function renderReportsView() {
    renderReportsFilterOptions();

    const filteredTransactions = getFilteredReportTransactions();
    renderReportsSummary(filteredTransactions);

    const hasData = filteredTransactions.length > 0;
    reportsEmptyState.hidden = hasData;
    reportsContentGrid.hidden = !hasData;

    if (!hasData) {
      reportsChartBars.innerHTML = '';
      reportsChartEmptyState.hidden = false;
      reportsCategoryBreakdown.innerHTML = '';
      reportsAccountBreakdown.innerHTML = '';
      reportsCreditBreakdown.innerHTML = '';
      reportsInsightsList.innerHTML = '';
      reportsTableBody.innerHTML = '';
      reportsTableWrap.hidden = true;
      return;
    }

    renderReportsChart(filteredTransactions);
    renderReportsCategoryBreakdown(filteredTransactions);
    renderReportsAccountBreakdown(filteredTransactions);
    renderReportsCreditBreakdown(filteredTransactions);
    renderReportsTable(filteredTransactions);
    renderReportsInsights(filteredTransactions);
  }

  function setCategoryManagerFormFeedback(message, tone) {
    categoryManagerFeedback.textContent = message;
    categoryManagerFeedback.classList.remove('is-error', 'is-success');

    if (tone === 'error') {
      categoryManagerFeedback.classList.add('is-error');
    }

    if (tone === 'success') {
      categoryManagerFeedback.classList.add('is-success');
    }
  }

  function syncCategoryDependentViews() {
    renderTransactionsCategoryFilterOptions();
    renderTransactionsView();
    renderRecurrencesView();
    renderCategoriesView();
  }

  function syncRecurrenceDependentViews() {
    renderRecurrencesView();
    renderCategoriesView();
  }

  function resetCategoryManagerForm() {
    categoryManagerForm.reset();
    managedCategoryTypeInput.value = 'expense';
    managedCategoryColorInput.value = '#b42318';
    managedCategoryStatusInput.value = 'active';
    managedCategoryIconInput.value = 'CT';
    managedCategoryDescriptionInput.value = '';
    setCategoryManagerFormFeedback('', 'info');
  }

  function showCategoryManagerModal(focusTarget) {
    const safeFocusTarget = focusTarget && typeof focusTarget.focus === 'function'
      ? focusTarget
      : managedCategoryNameInput;

    categoryManagerModal.hidden = false;
    document.body.classList.add('modal-open');

    window.requestAnimationFrame(() => {
      safeFocusTarget.focus();
    });
  }

  function closeCategoryManagerModal(options = {}) {
    const { restoreFocus = true } = options;

    categoryManagerModal.hidden = true;
    document.body.classList.remove('modal-open');
    resetCategoryManagerForm();
    categoryManagerModalMode = 'create';
    editingManagedCategoryId = null;

    if (restoreFocus && lastCategoryManagerModalTrigger && document.contains(lastCategoryManagerModalTrigger)) {
      lastCategoryManagerModalTrigger.focus();
    }

    lastCategoryManagerModalTrigger = null;
  }

  function openCreateManagedCategoryModal(triggerButton = btnAddManagedCategory) {
    categoryManagerModalMode = 'create';
    editingManagedCategoryId = null;
    lastCategoryManagerModalTrigger = triggerButton || btnAddManagedCategory;

    categoryManagerModalTitle.textContent = 'Nova categoria';
    categoryManagerModalDescription.textContent =
      'Defina nome, tipo, cor e contexto visual para futuras transacoes e relatorios.';
    categoryManagerSubmitButton.textContent = 'Salvar categoria';

    resetCategoryManagerForm();
    showCategoryManagerModal(managedCategoryNameInput);
  }

  function openEditManagedCategoryModal(category, triggerButton) {
    categoryManagerModalMode = 'edit';
    editingManagedCategoryId = category.id;
    lastCategoryManagerModalTrigger = triggerButton || null;

    categoryManagerModalTitle.textContent = 'Editar categoria';
    categoryManagerModalDescription.textContent =
      'Atualize nome, tipo, cor e status sem sair do dashboard.';
    categoryManagerSubmitButton.textContent = 'Salvar alteracoes';

    resetCategoryManagerForm();
    managedCategoryNameInput.value = category.name || '';
    managedCategoryTypeInput.value = category.type || 'expense';
    managedCategoryIconInput.value = category.icon || 'CT';
    managedCategoryColorInput.value = category.color || (category.type === 'income' ? '#157f42' : '#b42318');
    managedCategoryStatusInput.value = normalizeManagedCategoryStatus(category.status);
    managedCategoryDescriptionInput.value = category.description || '';

    showCategoryManagerModal(managedCategoryNameInput);
  }

  function buildManagedCategoryFromForm() {
    const categoryType = String(managedCategoryTypeInput.value || 'expense').toLowerCase();
    const categoryName = normalizeCategoryName(managedCategoryNameInput.value);
    const iconValue = String(managedCategoryIconInput.value || '')
      .trim()
      .slice(0, 3)
      .toUpperCase();
    const fallbackIcon = categoryName.slice(0, 2).toUpperCase() || 'CT';

    return {
      name: categoryName,
      type: categoryType === 'income' ? 'income' : 'expense',
      icon: iconValue || fallbackIcon,
      color: managedCategoryColorInput.value || (categoryType === 'income' ? '#157f42' : '#b42318'),
      status: normalizeManagedCategoryStatus(managedCategoryStatusInput.value),
      description: normalizeCategoryName(managedCategoryDescriptionInput.value),
    };
  }

  function openCategoryDetailModal(category, triggerButton) {
    const activities = getCategoryActivitiesById(category.id).slice(0, 6);
    const monthlyTotal = getCategoryMonthlyTotal(category.id);
    const transactionCount = getCategoryTransactionCount(category.id);

    viewingManagedCategoryId = category.id;
    lastCategoryManagerModalTrigger = triggerButton || null;
    categoryDetailTitle.textContent = category.name;
    categoryDetailDescription.textContent =
      'Veja o desempenho da categoria, incluindo movimentacoes recorrentes vinculadas.';

    categoryDetailBody.innerHTML = `
      <section class="category-detail-hero">
        <span class="category-card__icon" style="--category-color: ${category.color || '#1a365d'};">${category.icon || 'CT'}</span>
        <div>
          <h3>${category.name}</h3>
          <p>${category.description || 'Categoria pronta para apoiar a organizacao de receitas, despesas e relatorios futuros.'}</p>
        </div>
      </section>

      <section class="category-detail-grid">
        <div class="category-detail-kpis">
          <article class="category-detail-box">
            <span>Tipo</span>
            <strong>${getManagedCategoryTypeLabel(category.type)}</strong>
            <small>${category.type === 'income' ? 'Usada para entradas e ganhos.' : 'Usada para custos, contas e despesas.'}</small>
          </article>
          <article class="category-detail-box">
            <span>Status</span>
            <strong>${normalizeManagedCategoryStatus(category.status) === 'inactive' ? 'Inativa' : 'Ativa'}</strong>
            <small>${normalizeManagedCategoryStatus(category.status) === 'inactive' ? 'Nao aparece em novos cadastros.' : 'Disponivel para novos lancamentos.'}</small>
          </article>
          <article class="category-detail-box">
            <span>Total movimentado no mes</span>
            <strong>${formatCurrency(monthlyTotal)}</strong>
            <small>Total calculado a partir das movimentacoes vinculadas.</small>
          </article>
          <article class="category-detail-box">
            <span>Transacoes vinculadas</span>
            <strong>${String(transactionCount)}</strong>
            <small>Quantidade de registros ligados a esta categoria.</small>
          </article>
        </div>

        <div class="category-detail-list">
          ${activities.length > 0 ? activities.map((activity) => `
            <article class="category-detail-list-item">
              <div class="category-detail-list-item__head">
                <strong>${activity.description}</strong>
                <strong class="transaction-amount ${String(activity.type || '').toLowerCase() === 'income' ? 'income' : 'expense'}">
                  ${String(activity.type || '').toLowerCase() === 'income' ? '+' : '-'}${formatCurrency(activity.amount)}
                </strong>
              </div>
              <div class="category-detail-list-item__meta">
                <span>${activity.displayDate || formatDate(activity.date)}</span>
                <span>${getManagedCategoryTypeLabel(activity.type)}</span>
              </div>
            </article>
          `).join('') : `
            <div class="empty-state">
              <strong>Nenhuma movimentacao vinculada nesta categoria.</strong>
              <span>Novas movimentacoes e recorrencias vinculadas aparecerao aqui conforme o sistema evoluir.</span>
            </div>
          `}
        </div>
      </section>
    `;

    categoryDetailModal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeCategoryDetailModal(options = {}) {
    const { restoreFocus = true } = options;

    categoryDetailModal.hidden = true;
    document.body.classList.remove('modal-open');
    categoryDetailBody.innerHTML = '';
    viewingManagedCategoryId = null;

    if (restoreFocus && lastCategoryManagerModalTrigger && document.contains(lastCategoryManagerModalTrigger)) {
      lastCategoryManagerModalTrigger.focus();
    }

    lastCategoryManagerModalTrigger = null;
  }

  function deleteManagedCategory(categoryId) {
    categories = categories.filter((category) => category.id !== categoryId);
    categoryActivities = categoryActivities.filter((activity) => activity.categoryId !== categoryId);
  }

  async function handleDeleteManagedCategory(categoryId) {
    const category = getManagedCategoryById(categoryId);

    if (!category) {
      return;
    }

    const shouldDelete = window.confirm('Tem certeza que deseja excluir esta categoria?');

    if (!shouldDelete) {
      return;
    }

    if (editingManagedCategoryId === categoryId) {
      closeCategoryManagerModal({ restoreFocus: false });
    }

    if (viewingManagedCategoryId === categoryId) {
      closeCategoryDetailModal({ restoreFocus: false });
    }

    try {
      await financeDataService.deleteCategory(authenticatedUser.id, categoryId);
      deleteManagedCategory(categoryId);
      syncCategoryDependentViews();
    } catch (error) {
      console.error('Não foi possível excluir a categoria.', error);
      window.alert('Não foi possível excluir esta categoria. Remova primeiro os registros vinculados a ela.');
    }
  }

  async function toggleManagedCategoryStatus(categoryId) {
    const category = getManagedCategoryById(categoryId);

    if (!category) return;

    const nextCategory = {
      ...category,
      status: normalizeManagedCategoryStatus(category.status) === 'inactive' ? 'active' : 'inactive',
    };

    try {
      const savedCategory = await financeDataService.updateCategory(
        authenticatedUser.id,
        categoryId,
        nextCategory,
      );
      categories = categories
        .map((item) => item.id === categoryId ? savedCategory : item)
        .sort(compareCategoryEntries);
      syncCategoryDependentViews();
    } catch (error) {
      console.error('Não foi possível alterar a categoria.', error);
      window.alert('Não foi possível alterar o status da categoria.');
    }
  }

  function handleManagedCategoryActionClick(event) {
    const actionButton = event.target instanceof Element
      ? event.target.closest('[data-category-action], [data-category-id]')
      : null;

    if (!actionButton) {
      return;
    }

    const categoryId = actionButton.dataset.categoryId;
    const category = getManagedCategoryById(categoryId);

    if (!category) {
      return;
    }

    const action = actionButton.dataset.categoryAction;

    if (!action || action === 'view') {
      openCategoryDetailModal(category, actionButton);
      return;
    }

    if (action === 'edit') {
      openEditManagedCategoryModal(category, actionButton);
      return;
    }

    if (action === 'toggle') {
      toggleManagedCategoryStatus(categoryId);
      return;
    }

    if (action === 'delete') {
      handleDeleteManagedCategory(categoryId);
    }
  }

  function resetTransactionForm() {
    transactionForm.reset();
    transactionDateInput.value = getTodayDate();
    clearTransactionCreditFields();
    renderTransactionAccountOptions();
    selectTransactionType('receita');
    updateTransactionCreditFields();
    hideCategoryCreatePanel();
    setFormFeedback('', 'info');
    updateDescriptionCounter();
  }

  function showTransactionModal(focusTarget) {
    const safeFocusTarget = focusTarget && typeof focusTarget.focus === 'function'
      ? focusTarget
      : transactionAmountInput;

    transactionModal.hidden = false;
    document.body.classList.add('modal-open');

    window.requestAnimationFrame(() => {
      safeFocusTarget.focus();
    });
  }

  function closeTransactionModal(options = {}) {
    const { restoreFocus = true } = options;

    transactionModal.hidden = true;
    document.body.classList.remove('modal-open');
    resetTransactionForm();
    modalMode = 'create';
    editingTransactionId = null;

    if (restoreFocus && lastModalTrigger && document.contains(lastModalTrigger)) {
      lastModalTrigger.focus();
    }

    lastModalTrigger = null;
  }

  function openCreateTransactionModal(triggerButton = btnAddTransaction) {
    modalMode = 'create';
    editingTransactionId = null;
    lastModalTrigger = triggerButton || btnAddTransaction;

    transactionModalTitle.textContent = 'Nova Transação';
    transactionModalDescription.textContent =
      'Preencha os dados para registrar uma nova receita ou despesa.';
    transactionSubmitButton.textContent = 'Salvar transação';

    resetTransactionForm();
    showTransactionModal(transactionTypeButtons[0]);
  }

  function openEditModal(transaction, triggerButton) {
    modalMode = 'edit';
    editingTransactionId = transaction.id;
    lastModalTrigger = triggerButton || null;

    transactionModalTitle.textContent = 'Editar transação';
    transactionModalDescription.textContent =
      'Atualize os dados do lançamento sem sair do dashboard.';
    transactionSubmitButton.textContent = 'Salvar alterações';

    const normalizedType = normalizeTransactionType(transaction.type);

    resetTransactionForm();
    ensureCategoryOption(transaction.category, normalizedType);

    transactionDescriptionInput.value = transaction.description || '';
    transactionAmountInput.value = Number(transaction.totalAmount || transaction.amount || 0).toFixed(2);
    selectTransactionType(normalizedType === 'despesa' ? 'despesa' : 'receita');
    transactionCategoryInput.value = transaction.category || '';
    transactionDateInput.value = transaction.date || '';
    if (normalizedType === 'despesa') {
      transactionPaymentMethodInput.value = transaction.paymentMethod === 'credit' ? 'credit' : 'debit';
      transactionInstallmentsInput.value = String(transaction.installments || 1);
      transactionFirstInvoiceMonthInput.value = transaction.firstInvoiceMonth || getCurrentMonthValue();
      renderTransactionAccountOptions(transaction.cardId || '');
      transactionDueDayInput.value = transaction.dueDay ? String(transaction.dueDay) : '';
      transactionCardInput.value = transaction.cardId || '';
    }
    updateTransactionCreditFields();
    updateDescriptionCounter();

    showTransactionModal(transactionAmountInput);
  }

  function updateTransaction(transactionId, updatedFields) {
    transactions = transactions.map((transaction) => {
      if (transaction.id !== transactionId) {
        return transaction;
      }

      return {
        ...transaction,
        ...updatedFields,
      };
    });
  }

  function removeInstallmentsByTransactionId(transactionId) {
    installments = installments.filter((installment) => installment.transactionId !== transactionId);
  }

  function handleDeleteTransaction(transactionId) {
    const transaction = findTransactionById(transactionId);

    if (!transaction) {
      return;
    }

    const shouldDelete = window.confirm('Tem certeza que deseja excluir esta transação?');

    if (!shouldDelete) {
      return;
    }

    if (editingTransactionId === transactionId) {
      closeTransactionModal({ restoreFocus: false });
    }

    removeReportTransactionsForTransaction(transaction);
    removeInstallmentsByTransactionId(transactionId);
    transactions = transactions.filter((item) => item.id !== transactionId);
    renderKpis();
    applyFilter(currentFilter);
    renderTransactionsView();
    renderCardsView();
    renderReportsView();
  }

  function buildTransactionFromForm() {
    const category = transactionCategoryInput.value.trim();
    const description = transactionDescriptionInput.value.trim();
    const transactionType = normalizeTransactionType(transactionTypeInput.value);
    const isExpense = transactionType === 'despesa';
    const paymentMethod = isExpense ? String(transactionPaymentMethodInput.value || '').toLowerCase() : '';
    const isCredit = isExpense && paymentMethod === 'credit';
    const selectedCard = isCredit ? getCardById(transactionCardInput.value) : null;
    const totalAmount = Number(transactionAmountInput.value);
    const installmentsCount = isCredit
      ? Math.max(1, Number(transactionInstallmentsInput.value || 1))
      : 1;
    const transactionDate = transactionDateInput.value || getTodayDate();

    return {
      description: description || category,
      amount: totalAmount,
      totalAmount,
      type: transactionType,
      category,
      date: transactionDate,
      accountId: isCredit && selectedCard ? selectedCard.id : '',
      accountName: isCredit && selectedCard ? selectedCard.name : '',
      accountType: isCredit && selectedCard ? selectedCard.type : '',
      paymentMethod,
      installments: installmentsCount,
      installmentValue: installmentsCount > 0 ? totalAmount / installmentsCount : totalAmount,
      cardId: isCredit && selectedCard ? selectedCard.id : '',
      firstInvoiceMonth: isCredit
        ? String(transactionDate).slice(0, 7)
        : '',
      dueDay: isCredit
        ? Number((selectedCard && selectedCard.dueDay) || 0)
        : 0,
      createdAt: getTodayDate(),
    };
  }

  function handleTransactionActionClick(event) {
    const actionButton = event.target instanceof Element
      ? event.target.closest('[data-transaction-action]')
      : null;

    if (!actionButton) {
      return;
    }

    const transactionId = actionButton.dataset.transactionId;
    const action = actionButton.dataset.transactionAction;
    const transaction = findTransactionById(transactionId);

    if (!transaction) {
      return;
    }

    if (action === 'edit') {
      openEditModal(transaction, actionButton);
      return;
    }

    if (action === 'delete') {
      handleDeleteTransaction(transactionId);
    }
  }

  const authenticatedUser = await authService.requireAuth('./login.html');

  if (!authenticatedUser) {
    return;
  }

  try {
    const workspace = await financeDataService.loadWorkspace();
    categories = workspace.categories;
    accounts = workspace.accounts;
  } catch (workspaceError) {
    console.error('Não foi possível carregar os dados financeiros.', workspaceError);
    showDashboardNavFeedback('Não foi possível carregar suas categorias e contas. Atualize a página.');
    categories = getInitialCategories();
  }

  renderCategoryOptions('', 'receita');
  renderRecurrenceCategoryOptions('', 'receita');
  renderTransactionAccountOptions();
  renderTransactionsCategoryFilterOptions();

  const displayName = getUserDisplayName(authenticatedUser);

  try {
    await authService.ensureProfile(authenticatedUser.id, displayName);
  } catch (profileError) {
    console.warn('Não foi possível sincronizar o perfil do usuário.', profileError);
  }

  initializeProfileState(authenticatedUser);

  renderKpis();
  applyFilter(currentFilter);
  renderTransactionsView();
  renderRecurrencesView();
  renderCardsView();
  renderReportsView();
  renderAccountsView();
  renderCategoriesView();
  setVisibleDashboardView(currentDashboardView);
  setActiveDashboardNav(currentDashboardView);

  logoutButton.addEventListener('click', handleLogout);
  profileMenuButton.addEventListener('click', (event) => {
    event.preventDefault();
    toggleProfileDropdown();
  });
  profileDropdownOpen.addEventListener('click', () => {
    openProfileModal(profileMenuButton);
  });
  profileDropdownSettings.addEventListener('click', () => {
    closeProfileDropdown();
    console.log('Funcionalidade em desenvolvimento');
    showDashboardNavFeedback('Configurações em desenvolvimento.');
  });

  btnAddTransaction.addEventListener('click', (event) => {
    event.preventDefault();
    openCreateTransactionModal(btnAddTransaction);
  });

  btnAddTransactionModule.addEventListener('click', (event) => {
    event.preventDefault();
    openCreateTransactionModal(btnAddTransactionModule);
  });

  btnAddRecurrence.addEventListener('click', (event) => {
    event.preventDefault();
    openCreateRecurrenceModal(btnAddRecurrence);
  });
  btnExportReport.addEventListener('click', () => {
    console.log('Funcionalidade em desenvolvimento');
    showDashboardNavFeedback('Exportacao de relatorio em desenvolvimento.');
  });

  btnAddCard.addEventListener('click', (event) => {
    event.preventDefault();
    openCreateCardModal(btnAddCard);
  });
  if (btnAddAccount) {
    btnAddAccount.addEventListener('click', (event) => {
      event.preventDefault();
      openCreateAccountModal(btnAddAccount);
    });
  }
  if (btnCreateFirstAccount) {
    btnCreateFirstAccount.addEventListener('click', (event) => {
      event.preventDefault();
      openCreateAccountModal(btnCreateFirstAccount);
    });
  }
  btnAddManagedCategory.addEventListener('click', (event) => {
    event.preventDefault();
    openCreateManagedCategoryModal(btnAddManagedCategory);
  });
  btnCreateFirstManagedCategory.addEventListener('click', (event) => {
    event.preventDefault();
    openCreateManagedCategoryModal(btnCreateFirstManagedCategory);
  });
  btnReportsEmptyAction.addEventListener('click', (event) => {
    event.preventDefault();
    openCreateTransactionModal(btnReportsEmptyAction);
  });

  dashboardNavButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleDashboardNav(button.dataset.dashboardNav || 'dashboard');
    });
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }

    if (profileDropdown.hidden) {
      return;
    }

    if (!profileMenuButton.contains(event.target) && !profileDropdown.contains(event.target)) {
      closeProfileDropdown();
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.transactionFilter || 'all');
    });
  });

  moduleTypeFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      transactionsViewFilters.type = button.dataset.moduleTypeFilter || 'all';
      renderTransactionsView();
    });
  });

  recurrenceFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentRecurrenceFilter = button.dataset.recurrenceFilter || 'all';
      renderRecurrencesView();
    });
  });

  managedCategoryFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setManagedCategoryFilter(button.dataset.managedCategoryFilter || 'all');
      renderManagedCategoriesGrid();
    });
  });

  reportsPeriodFilter.addEventListener('change', () => {
    reportsViewFilters.period = reportsPeriodFilter.value || 'month';

    if (reportsViewFilters.period === 'custom') {
      console.log('Funcionalidade em desenvolvimento');
      showDashboardNavFeedback('Filtro personalizado de relatorios em desenvolvimento.');
    } else if (currentDashboardView === 'reports') {
      showDashboardNavFeedback('');
    }

    renderReportsView();
  });

  reportsTypeFilter.addEventListener('change', () => {
    reportsViewFilters.type = reportsTypeFilter.value || 'all';
    renderReportsView();
  });

  reportsAccountFilter.addEventListener('change', () => {
    reportsViewFilters.account = reportsAccountFilter.value || 'all';
    renderReportsView();
  });

  reportsCategoryFilter.addEventListener('change', () => {
    reportsViewFilters.category = reportsCategoryFilter.value || 'all';
    renderReportsView();
  });

  transactionsPeriodFilter.addEventListener('change', () => {
    transactionsViewFilters.period = transactionsPeriodFilter.value || 'month';

    if (transactionsViewFilters.period === 'custom') {
      console.log('Funcionalidade em desenvolvimento');
      showDashboardNavFeedback('Filtro personalizado em desenvolvimento.');
    } else if (currentDashboardView === 'transactions') {
      showDashboardNavFeedback('');
    }

    renderTransactionsView();
  });

  transactionsCategoryFilter.addEventListener('change', () => {
    transactionsViewFilters.category = transactionsCategoryFilter.value || 'all';
    renderTransactionsView();
  });

  transactionsSearchFilter.addEventListener('input', () => {
    transactionsViewFilters.search = transactionsSearchFilter.value || '';
    renderTransactionsView();
  });

  transactionPaymentMethodInput.addEventListener('change', () => {
    updateTransactionCreditFields();
    setFormFeedback('', 'info');
  });

  transactionCardInput.addEventListener('change', () => {
    updateTransactionCreditFields();
    setFormFeedback('', 'info');
  });

  transactionDateInput.addEventListener('change', () => {
    updateTransactionCreditFields();
  });

  transactionTypeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectTransactionType(button.dataset.transactionTypeOption || '');
      setFormFeedback('', 'info');
    });
  });

  recurrenceTypeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectRecurrenceType(button.dataset.recurrenceTypeOption || '');
      setRecurrenceFormFeedback('', 'info');
    });
  });

  btnShowCategoryInput.addEventListener('click', () => {
    showCategoryCreatePanel();
  });

  btnConfirmCategory.addEventListener('click', () => {
    handleCreateCategory();
  });

  btnCancelCategory.addEventListener('click', () => {
    hideCategoryCreatePanel();
    transactionCategoryInput.focus();
  });

  newCategoryInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCreateCategory();
    }

    if (event.key === 'Escape') {
      hideCategoryCreatePanel();
      transactionCategoryInput.focus();
    }
  });

  transactionCategoryInput.addEventListener('change', () => {
    setFormFeedback('', 'info');
  });

  transactionDescriptionInput.addEventListener('input', updateDescriptionCounter);
  accountForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAccountFormFeedback('', 'info');

    if (!accountForm.checkValidity()) {
      setAccountFormFeedback('Preencha os campos obrigatorios antes de salvar.', 'error');
      accountForm.reportValidity();
      return;
    }

    const accountFromForm = buildAccountFromForm();

    if (!accountFromForm.name) {
      setAccountFormFeedback('Informe um nome valido para a conta.', 'error');
      accountNameInput.focus();
      return;
    }

    if (accountFromForm.type === 'credit_card') {
      if (!Number.isFinite(accountFromForm.creditLimit) || accountFromForm.creditLimit < 0) {
        setAccountFormFeedback('Informe um limite valido.', 'error');
        accountCreditLimitInput.focus();
        return;
      }

      if (!Number.isInteger(accountFromForm.closingDay) || accountFromForm.closingDay < 1 || accountFromForm.closingDay > 31) {
        setAccountFormFeedback('Informe um dia de fechamento entre 1 e 31.', 'error');
        accountClosingDayInput.focus();
        return;
      }

      if (!Number.isInteger(accountFromForm.dueDay) || accountFromForm.dueDay < 1 || accountFromForm.dueDay > 31) {
        setAccountFormFeedback('Informe um dia de vencimento entre 1 e 31.', 'error');
        accountDueDayInput.focus();
        return;
      }
    }

    accountSubmitButton.disabled = true;

    try {
      if (accountModalMode === 'create') {
        const createdAccount = await financeDataService.createAccount(authenticatedUser.id, accountFromForm);
        accounts = [...accounts, createdAccount];
      }

      if (accountModalMode === 'edit' && editingAccountId) {
        const updatedAccount = await financeDataService.updateAccount(
          authenticatedUser.id,
          editingAccountId,
          accountFromForm,
        );
        updateAccount(editingAccountId, updatedAccount);
      }

      closeAccountModal({ restoreFocus: false });
      renderAccountsView();
      updateTransactionCreditFields();
    } catch (error) {
      console.error('Nao foi possivel salvar a conta.', error);
      setAccountFormFeedback('Nao foi possivel salvar a conta. Tente novamente.', 'error');
    } finally {
      accountSubmitButton.disabled = false;
    }
  });
  accountTypeInput.addEventListener('change', () => {
    updateAccountCreditFields();
    setAccountFormFeedback('', 'info');
  });
  managedCategoryTypeInput.addEventListener('change', () => {
    const suggestedColor = managedCategoryTypeInput.value === 'income' ? '#157f42' : '#b42318';

    if (
      managedCategoryColorInput.value === '#157f42' ||
      managedCategoryColorInput.value === '#b42318' ||
      !managedCategoryColorInput.value
    ) {
      managedCategoryColorInput.value = suggestedColor;
    }

    setCategoryManagerFormFeedback('', 'info');
  });
  profileUploadTrigger.addEventListener('click', () => {
    profilePhotoInput.click();
  });
  profilePhotoInput.addEventListener('change', () => {
    const [file] = Array.from(profilePhotoInput.files || []);
    handleProfilePhotoSelection(file);
  });

  transactionList.addEventListener('click', handleTransactionActionClick);
  transactionsTableBody.addEventListener('click', handleTransactionActionClick);
  recurrencesTableBody.addEventListener('click', handleRecurrenceActionClick);
  cardsList.addEventListener('click', handleCardListClick);
  if (accountsList) {
    accountsList.addEventListener('click', handleAccountActionClick);
  }
  categoriesGrid.addEventListener('click', handleManagedCategoryActionClick);
  invoiceMonths.addEventListener('click', (event) => {
    const monthButton = event.target instanceof Element
      ? event.target.closest('[data-invoice-month]')
      : null;

    if (!monthButton) {
      return;
    }

    selectedInvoiceMonth = monthButton.dataset.invoiceMonth || null;
    renderCardsView();
  });
  invoiceMonthFilter.addEventListener('change', () => {
    selectedInvoiceMonth = invoiceMonthFilter.value || null;
    renderCardsView();
  });
  markInvoicePaidButton.addEventListener('click', () => {
    const cardId = markInvoicePaidButton.dataset.invoiceCardId;
    const invoiceMonth = markInvoicePaidButton.dataset.invoiceMonth;

    if (!cardId || !invoiceMonth) {
      return;
    }

    markInvoiceAsPaid(cardId, invoiceMonth);
  });

  closeModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeTransactionModal();
    });
  });

  transactionModal.addEventListener('click', (event) => {
    if (event.target === transactionModal) {
      closeTransactionModal();
    }
  });

  closeRecurrenceModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeRecurrenceModal();
    });
  });

  recurrenceModal.addEventListener('click', (event) => {
    if (event.target === recurrenceModal) {
      closeRecurrenceModal();
    }
  });

  closeCardModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeCardModal();
    });
  });

  cardModal.addEventListener('click', (event) => {
    if (event.target === cardModal) {
      closeCardModal();
    }
  });

  closeProfileModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeProfileModal();
    });
  });

  profileModal.addEventListener('click', (event) => {
    if (event.target === profileModal) {
      closeProfileModal();
    }
  });

  closeAccountModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeAccountModal();
    });
  });

  accountModal.addEventListener('click', (event) => {
    if (event.target === accountModal) {
      closeAccountModal();
    }
  });

  closeAccountDetailModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeAccountDetailModal();
    });
  });

  accountDetailModal.addEventListener('click', (event) => {
    if (event.target === accountDetailModal) {
      closeAccountDetailModal();
    }
  });

  closeCategoryManagerModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeCategoryManagerModal();
    });
  });

  categoryManagerModal.addEventListener('click', (event) => {
    if (event.target === categoryManagerModal) {
      closeCategoryManagerModal();
    }
  });

  closeCategoryDetailModalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeCategoryDetailModal();
    });
  });

  categoryDetailModal.addEventListener('click', (event) => {
    if (event.target === categoryDetailModal) {
      closeCategoryDetailModal();
    }
  });

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setProfileFormFeedback('', 'info');

    if (!profileForm.checkValidity()) {
      setProfileFormFeedback('Preencha seu nome antes de salvar as alterações.', 'error');
      profileForm.reportValidity();
      return;
    }

    const nextName = String(profileNameInput.value || '').trim();

    if (!nextName) {
      setProfileFormFeedback('Informe um nome válido para o perfil.', 'error');
      profileNameInput.focus();
      return;
    }

    profileState.name = nextName;

    if (profileState.pendingPhoto) {
      profileState.photo = profileState.pendingPhoto;
    }

    profileState.pendingPhoto = '';
    renderProfileIdentity();
    setProfileFormFeedback('Perfil atualizado com sucesso.', 'success');
  });

  profilePasswordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setProfilePasswordFeedback('', 'info');

    if (!profilePasswordForm.checkValidity()) {
      setProfilePasswordFeedback('Preencha todos os campos de senha antes de continuar.', 'error');
      profilePasswordForm.reportValidity();
      return;
    }

    const currentPassword = String(profileCurrentPasswordInput.value || '');
    const newPassword = String(profileNewPasswordInput.value || '');
    const confirmPassword = String(profileConfirmPasswordInput.value || '');

    if (!currentPassword.trim()) {
      setProfilePasswordFeedback('Informe sua senha atual para continuar.', 'error');
      profileCurrentPasswordInput.focus();
      return;
    }

    if (newPassword.length < 6) {
      setProfilePasswordFeedback('A nova senha precisa ter pelo menos 6 caracteres.', 'error');
      profileNewPasswordInput.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      setProfilePasswordFeedback('A confirmação da nova senha não confere.', 'error');
      profileConfirmPasswordInput.focus();
      return;
    }

    profilePasswordForm.reset();
    setProfilePasswordFeedback('Senha alterada com sucesso na simulação do frontend.', 'success');
  });

  transactionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!transactionTypeInput.value) {
      setFormFeedback('Escolha se a transação é uma receita ou uma despesa.', 'error');
      return;
    }

    const transactionFromForm = buildTransactionFromForm();
    const isExpense = normalizeTransactionType(transactionFromForm.type) === 'despesa';

    if (isExpense && !transactionPaymentMethodInput.value) {
      setFormFeedback('Escolha a forma de pagamento antes de salvar.', 'error');
      transactionPaymentMethodInput.focus();
      return;
    }

    if (transactionFromForm.paymentMethod === 'credit' && !transactionFromForm.cardId) {
      setFormFeedback('Selecione um cartão para compras no crédito.', 'error');
      transactionCardInput.focus();
      return;
    }

    if (!transactionForm.checkValidity()) {
      setFormFeedback('Preencha valor, data e categoria antes de salvar.', 'error');
      transactionForm.reportValidity();
      return;
    }

    if (!Number.isFinite(transactionFromForm.amount) || transactionFromForm.amount <= 0) {
      setFormFeedback('Informe um valor maior que zero.', 'error');
      transactionAmountInput.focus();
      return;
    }

    if (transactionFromForm.paymentMethod === 'credit') {
      if (!transactionFromForm.firstInvoiceMonth) {
        setFormFeedback('Informe o mês da primeira fatura.', 'error');
        transactionFirstInvoiceMonthInput.focus();
        return;
      }

      if (!Number.isInteger(transactionFromForm.installments) || transactionFromForm.installments < 1) {
        setFormFeedback('Informe um número de parcelas válido.', 'error');
        transactionInstallmentsInput.focus();
        return;
      }

      const cardDueDay = Number(transactionFromForm.dueDay || 0);

      if (!cardDueDay || cardDueDay < 1 || cardDueDay > 31) {
        setFormFeedback('O cartão selecionado precisa ter um dia de vencimento válido.', 'error');
        transactionCardInput.focus();
        return;
      }
    }

    if (modalMode === 'create') {
      const createdTransaction = {
        id: createTransactionId(),
        ...transactionFromForm,
      };

      transactions = [
        createdTransaction,
        ...transactions,
      ];

      syncReportTransactionsForTransaction(createdTransaction);

      if (createdTransaction.paymentMethod === 'credit') {
        installments = [
          ...buildInstallmentsForTransaction(createdTransaction),
          ...installments,
        ];
      }
    }

    if (modalMode === 'edit' && editingTransactionId) {
      const previousTransaction = findTransactionById(editingTransactionId);
      const updatedTransaction = {
        id: editingTransactionId,
        ...transactionFromForm,
      };

      if (previousTransaction) {
        removeReportTransactionsForTransaction(previousTransaction);
      }

      removeInstallmentsByTransactionId(editingTransactionId);
      updateTransaction(editingTransactionId, transactionFromForm);
      syncReportTransactionsForTransaction(updatedTransaction);

      if (updatedTransaction.paymentMethod === 'credit') {
        installments = [
          ...buildInstallmentsForTransaction(updatedTransaction),
          ...installments,
        ];
      }
    }

    closeTransactionModal({ restoreFocus: false });
    renderKpis();
    applyFilter(currentFilter);
    renderTransactionsView();
    renderCardsView();
    renderReportsView();
  });

  recurrenceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setRecurrenceFormFeedback('', 'info');

    if (!recurrenceTypeInput.value) {
      setRecurrenceFormFeedback('Escolha se a recorrência é uma receita ou uma despesa.', 'error');
      return;
    }

    if (!recurrenceForm.checkValidity()) {
      setRecurrenceFormFeedback('Preencha descrição, valor, categoria e dia do mês.', 'error');
      recurrenceForm.reportValidity();
      return;
    }

    const recurrenceFromForm = buildRecurrenceFromForm();

    if (!Number.isFinite(recurrenceFromForm.amount) || recurrenceFromForm.amount <= 0) {
      setRecurrenceFormFeedback('Informe um valor maior que zero.', 'error');
      recurrenceAmountInput.focus();
      return;
    }

    if (!Number.isInteger(recurrenceFromForm.dayOfMonth) || recurrenceFromForm.dayOfMonth < 1 || recurrenceFromForm.dayOfMonth > 31) {
      setRecurrenceFormFeedback('Informe um dia do mês entre 1 e 31.', 'error');
      recurrenceDayInput.focus();
      return;
    }

    if (recurrenceModalMode === 'create') {
      recurrences = [
        {
          id: createRecurrenceId(),
          ...recurrenceFromForm,
        },
        ...recurrences,
      ];
    }

    if (recurrenceModalMode === 'edit' && editingRecurrenceId) {
      updateRecurrence(editingRecurrenceId, recurrenceFromForm);
    }

    closeRecurrenceModal({ restoreFocus: false });
    syncRecurrenceDependentViews();
  });

  cardForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setCardFormFeedback('', 'info');

    if (!cardForm.checkValidity()) {
      setCardFormFeedback('Preencha nome, limite, fechamento e vencimento.', 'error');
      cardForm.reportValidity();
      return;
    }

    const cardFromForm = buildCardFromForm();

    if (!Number.isFinite(cardFromForm.limit) || cardFromForm.limit < 0) {
      setCardFormFeedback('Informe um limite válido.', 'error');
      cardLimitInput.focus();
      return;
    }

    if (!Number.isInteger(cardFromForm.closingDay) || cardFromForm.closingDay < 1 || cardFromForm.closingDay > 31) {
      setCardFormFeedback('Informe um dia de fechamento entre 1 e 31.', 'error');
      cardClosingDayInput.focus();
      return;
    }

    if (!Number.isInteger(cardFromForm.dueDay) || cardFromForm.dueDay < 1 || cardFromForm.dueDay > 31) {
      setCardFormFeedback('Informe um dia de vencimento entre 1 e 31.', 'error');
      cardDueDayInput.focus();
      return;
    }

    if (cardModalMode === 'create') {
      const createdCard = {
        id: createCardId(),
        ...cardFromForm,
      };

      cards = [createdCard, ...cards];
      selectedCardId = createdCard.id;
      selectedInvoiceMonth = null;
    }

    if (cardModalMode === 'edit' && editingCardId) {
      updateCard(editingCardId, cardFromForm);
      updateCardDependentInstallments(editingCardId, cardFromForm.dueDay);
      selectedCardId = editingCardId;
    }

    closeCardModal({ restoreFocus: false });
    renderCardsView();
    updateTransactionCreditFields();
  });

  categoryManagerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setCategoryManagerFormFeedback('', 'info');

    if (!categoryManagerForm.checkValidity()) {
      setCategoryManagerFormFeedback('Preencha nome, tipo, icone e status antes de salvar.', 'error');
      categoryManagerForm.reportValidity();
      return;
    }

    const categoryFromForm = buildManagedCategoryFromForm();

    if (!categoryFromForm.name) {
      setCategoryManagerFormFeedback('Informe um nome valido para a categoria.', 'error');
      managedCategoryNameInput.focus();
      return;
    }

    const existingCategory = findCategoryByName(categoryFromForm.name, categoryFromForm.type);
    const isSameEditingCategory = existingCategory && existingCategory.id === editingManagedCategoryId;

    if (existingCategory && !isSameEditingCategory) {
      setCategoryManagerFormFeedback('Ja existe uma categoria com este nome dentro do mesmo tipo.', 'error');
      managedCategoryNameInput.focus();
      return;
    }

    categoryManagerSubmitButton.disabled = true;

    try {
      if (categoryManagerModalMode === 'create') {
        const createdCategory = await financeDataService.createCategory(authenticatedUser.id, categoryFromForm);
        categories = [...categories, createdCategory].sort(compareCategoryEntries);
      }

      if (categoryManagerModalMode === 'edit' && editingManagedCategoryId) {
        const updatedCategory = await financeDataService.updateCategory(
          authenticatedUser.id,
          editingManagedCategoryId,
          categoryFromForm,
        );
        categories = categories
          .map((category) => category.id === editingManagedCategoryId ? updatedCategory : category)
          .sort(compareCategoryEntries);
      }

      closeCategoryManagerModal({ restoreFocus: false });
      syncCategoryDependentViews();
    } catch (error) {
      console.error('Nao foi possivel salvar a categoria.', error);
      setCategoryManagerFormFeedback('Nao foi possivel salvar a categoria. Tente novamente.', 'error');
    } finally {
      categoryManagerSubmitButton.disabled = false;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !profileDropdown.hidden) {
      closeProfileDropdown();
    }

    if (event.key === 'Escape' && !profileModal.hidden) {
      closeProfileModal();
    }

    if (event.key === 'Escape' && !transactionModal.hidden) {
      closeTransactionModal();
    }

    if (event.key === 'Escape' && !recurrenceModal.hidden) {
      closeRecurrenceModal();
    }

    if (event.key === 'Escape' && !cardModal.hidden) {
      closeCardModal();
    }

    if (event.key === 'Escape' && !accountModal.hidden) {
      closeAccountModal();
    }

    if (event.key === 'Escape' && !accountDetailModal.hidden) {
      closeAccountDetailModal();
    }

    if (event.key === 'Escape' && !categoryManagerModal.hidden) {
      closeCategoryManagerModal();
    }

    if (event.key === 'Escape' && !categoryDetailModal.hidden) {
      closeCategoryDetailModal();
    }
  });
});
