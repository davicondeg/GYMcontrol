(function () {
  function getClient() {
    if (!window.supabaseClient) {
      throw new Error('Cliente Supabase não encontrado.');
    }

    return window.supabaseClient;
  }

  function mapCategory(row) {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      icon: row.icon || row.name.slice(0, 2).toUpperCase(),
      color: row.color || (row.type === 'income' ? '#157F42' : '#B42318'),
      status: row.is_active ? 'active' : 'inactive',
      description: row.description || '',
    };
  }

  function mapAccount(row) {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      balance: Number(row.initial_balance || 0),
      institution: row.institution || '',
      color: row.color || '#1a365d',
      icon: row.icon || 'bank',
      status: row.is_active ? 'active' : 'inactive',
      creditLimit: Number(row.credit_limit || 0),
      creditUsed: 0,
      invoiceCurrent: 0,
      invoiceNext: 0,
      closingDay: Number(row.closing_day || 0),
      dueDay: Number(row.due_day || 0),
      linkedPaymentAccountId: row.linked_payment_account_id || '',
      currentInvoiceItems: [],
      upcomingInstallments: [],
    };
  }

  function categoryPayload(userId, category) {
    return {
      user_id: userId,
      name: category.name,
      type: category.type,
      icon: category.icon || null,
      color: category.color || null,
      description: category.description || null,
      is_active: category.status !== 'inactive',
      updated_at: new Date().toISOString(),
    };
  }

  function accountPayload(userId, account) {
    const isCreditCard = account.type === 'credit_card';

    return {
      user_id: userId,
      name: account.name,
      type: account.type,
      initial_balance: Number(account.balance || 0),
      institution: account.institution || null,
      color: account.color || null,
      icon: account.icon || null,
      is_active: account.status !== 'inactive',
      credit_limit: isCreditCard ? Number(account.creditLimit || 0) : null,
      closing_day: isCreditCard ? Number(account.closingDay || 0) : null,
      due_day: isCreditCard ? Number(account.dueDay || 0) : null,
      linked_payment_account_id: isCreditCard && account.linkedPaymentAccountId
        ? account.linkedPaymentAccountId
        : null,
      updated_at: new Date().toISOString(),
    };
  }

  async function loadWorkspace() {
    const client = getClient();
    const [categoriesResult, accountsResult] = await Promise.all([
      client.from('finance_categories').select('*').order('name'),
      client.from('finance_accounts').select('*').order('created_at'),
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (accountsResult.error) throw accountsResult.error;

    return {
      categories: (categoriesResult.data || []).map(mapCategory),
      accounts: (accountsResult.data || []).map(mapAccount),
    };
  }

  async function createCategory(userId, category) {
    const { data, error } = await getClient()
      .from('finance_categories')
      .insert(categoryPayload(userId, category))
      .select('*')
      .single();

    if (error) throw error;
    return mapCategory(data);
  }

  async function updateCategory(userId, categoryId, category) {
    const { data, error } = await getClient()
      .from('finance_categories')
      .update(categoryPayload(userId, category))
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return mapCategory(data);
  }

  async function deleteCategory(userId, categoryId) {
    const { error } = await getClient()
      .from('finance_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async function createAccount(userId, account) {
    const { data, error } = await getClient()
      .from('finance_accounts')
      .insert(accountPayload(userId, account))
      .select('*')
      .single();

    if (error) throw error;
    return mapAccount(data);
  }

  async function updateAccount(userId, accountId, account) {
    const { data, error } = await getClient()
      .from('finance_accounts')
      .update(accountPayload(userId, account))
      .eq('id', accountId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return mapAccount(data);
  }

  async function deleteAccount(userId, accountId) {
    const { error } = await getClient()
      .from('finance_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  window.GestorFinanceiroDataService = {
    createAccount,
    createCategory,
    deleteAccount,
    deleteCategory,
    loadWorkspace,
    updateAccount,
    updateCategory,
  };
})();
