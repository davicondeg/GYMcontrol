(function () {
  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getTransactionMeta(type) {
    const normalizedType = String(type || '').toLowerCase();

    if (normalizedType === 'receita' || normalizedType === 'income') {
      return {
        label: 'Receita',
        className: 'income',
        sign: '+',
      };
    }

    if (normalizedType === 'despesa' || normalizedType === 'expense') {
      return {
        label: 'Despesa',
        className: 'expense',
        sign: '-',
      };
    }

    return {
      label: normalizedType
        ? normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)
        : 'Transação',
      className: 'neutral',
      sign: '',
    };
  }

  function renderKpiCard(kpi) {
    const value = typeof kpi.value === 'number'
      ? kpi.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : kpi.value;
    const tone = kpi.tone || 'navy';

    return `
      <article class="kpi-card kpi-card--${escapeHTML(tone)}">
        <p class="kpi-label">${escapeHTML(kpi.label)}</p>
        <strong class="kpi-value">${escapeHTML(value)}</strong>
        <span class="kpi-note">${escapeHTML(kpi.note || '')}</span>
      </article>
    `;
  }

  function renderTransactionActionButton(action, transaction) {
    const isEdit = action === 'edit';
    const label = isEdit ? 'Editar transação' : 'Excluir transação';
    const buttonClass = isEdit ? 'transaction-action--edit' : 'transaction-action--delete';
    const icon = isEdit
      ? `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 16.5V20h3.5L18.7 8.8a1.8 1.8 0 0 0 0-2.5l-1-1a1.8 1.8 0 0 0-2.5 0L4 16.5Zm11.7-11.7 3.5 3.5"></path>
        </svg>
      `
      : `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16"></path>
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"></path>
          <path d="M7 7l1 13h8l1-13"></path>
          <path d="M10 11v5"></path>
          <path d="M14 11v5"></path>
        </svg>
      `;

    return `
      <button
        class="transaction-action ${buttonClass}"
        type="button"
        data-transaction-action="${action}"
        data-transaction-id="${escapeHTML(transaction.id)}"
        aria-label="${label} ${escapeHTML(transaction.description)}"
        title="${label}"
      >
        ${icon}
      </button>
    `;
  }

  function renderTransactionActions(transaction) {
    return `
      <div class="transaction-actions" aria-label="Ações da transação">
        ${renderTransactionActionButton('edit', transaction)}
        ${renderTransactionActionButton('delete', transaction)}
      </div>
    `;
  }

  function renderTransactionItem(transaction) {
    const meta = getTransactionMeta(transaction.type);
    const amount = Number(transaction.amount).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const titleSuffix = transaction.installmentLabel
      ? ` <span class="transaction-title-hint">— ${escapeHTML(transaction.installmentLabel)}</span>`
      : '';
    const installmentLabel = transaction.installmentLabel
      ? `<span class="transaction-secondary">${escapeHTML(transaction.installmentLabel)}</span>`
      : '';
    const paymentMethodLabel = transaction.paymentMethodLabel
      ? `<span class="transaction-secondary">${escapeHTML(transaction.paymentMethodLabel)}</span>`
      : '';

    return `
      <li class="transaction-item" data-transaction-id="${escapeHTML(transaction.id)}">
        <div class="transaction-row">
          <div class="transaction-copy">
            <h3 class="transaction-title">${escapeHTML(transaction.description)}${titleSuffix}</h3>
            <div class="transaction-meta">
              <span class="transaction-badge ${meta.className}">${escapeHTML(meta.label)}</span>
              <span class="transaction-secondary">${escapeHTML(transaction.category)}</span>
              ${paymentMethodLabel}
              ${installmentLabel}
            </div>
          </div>
          <strong class="transaction-amount ${meta.className}">${meta.sign}${escapeHTML(amount)}</strong>
        </div>
        <div class="transaction-footer">
          <span class="transaction-date">${escapeHTML(transaction.date)}</span>
          ${renderTransactionActions(transaction)}
        </div>
      </li>
    `;
  }

  function renderTransactionTableRow(transaction) {
    const meta = getTransactionMeta(transaction.type);
    const amount = Number(transaction.amount).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const titleSuffix = transaction.installmentLabel
      ? ` <span class="transaction-title-hint">— ${escapeHTML(transaction.installmentLabel)}</span>`
      : '';
    const installmentLabel = transaction.installmentLabel
      ? `<span class="transaction-secondary">${escapeHTML(transaction.installmentLabel)}</span>`
      : '';
    const paymentMethodLabel = transaction.paymentMethodLabel
      ? `<span class="transaction-secondary">${escapeHTML(transaction.paymentMethodLabel)}</span>`
      : '';

    return `
      <tr data-transaction-id="${escapeHTML(transaction.id)}">
        <td data-label="Data">${escapeHTML(transaction.date)}</td>
        <td data-label="Descrição">
          <div class="transactions-table__description">
            <strong>${escapeHTML(transaction.description)}${titleSuffix}</strong>
            <div class="transaction-meta">
              ${paymentMethodLabel}
              ${installmentLabel}
            </div>
          </div>
        </td>
        <td data-label="Categoria">
          <span class="transaction-secondary">${escapeHTML(transaction.category)}</span>
        </td>
        <td data-label="Tipo">
          <span class="transaction-badge ${meta.className}">${escapeHTML(meta.label)}</span>
        </td>
        <td data-label="Valor">
          <strong class="transaction-amount ${meta.className}">${meta.sign}${escapeHTML(amount)}</strong>
        </td>
        <td data-label="Ações">
          ${renderTransactionActions(transaction)}
        </td>
      </tr>
    `;
  }

  function getRecurrenceStatusMeta(status) {
    const normalizedStatus = String(status || '').toLowerCase();

    if (normalizedStatus === 'active' || normalizedStatus === 'ativa') {
      return {
        label: 'Ativa',
        className: 'status-active',
      };
    }

    return {
      label: 'Pausada',
      className: 'status-paused',
    };
  }

  function renderRecurrenceActionButton(action, recurrence) {
    const actionMap = {
      edit: {
        label: 'Editar recorrência',
        className: 'transaction-action--edit',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 16.5V20h3.5L18.7 8.8a1.8 1.8 0 0 0 0-2.5l-1-1a1.8 1.8 0 0 0-2.5 0L4 16.5Zm11.7-11.7 3.5 3.5"></path>
          </svg>
        `,
      },
      toggle: {
        label: recurrence.status === 'active' ? 'Pausar recorrência' : 'Reativar recorrência',
        className: 'transaction-action--toggle',
        icon: recurrence.status === 'active'
          ? `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 6v12"></path>
              <path d="M14 6v12"></path>
            </svg>
          `
          : `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 6.5v11l8-5.5-8-5.5Z"></path>
            </svg>
          `,
      },
      delete: {
        label: 'Excluir recorrência',
        className: 'transaction-action--delete',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16"></path>
            <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"></path>
            <path d="M7 7l1 13h8l1-13"></path>
            <path d="M10 11v5"></path>
            <path d="M14 11v5"></path>
          </svg>
        `,
      },
    };
    const config = actionMap[action];

    return `
      <button
        class="transaction-action ${config.className}"
        type="button"
        data-recurrence-action="${action}"
        data-recurrence-id="${escapeHTML(recurrence.id)}"
        aria-label="${config.label} ${escapeHTML(recurrence.description)}"
        title="${config.label}"
      >
        ${config.icon}
      </button>
    `;
  }

  function renderRecurrenceActions(recurrence) {
    return `
      <div class="transaction-actions" aria-label="Ações da recorrência">
        ${renderRecurrenceActionButton('edit', recurrence)}
        ${renderRecurrenceActionButton('toggle', recurrence)}
        ${renderRecurrenceActionButton('delete', recurrence)}
      </div>
    `;
  }

  function renderRecurrenceTableRow(recurrence) {
    const typeMeta = getTransactionMeta(recurrence.type);
    const statusMeta = getRecurrenceStatusMeta(recurrence.status);
    const amount = Number(recurrence.amount).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return `
      <tr data-recurrence-id="${escapeHTML(recurrence.id)}">
        <td data-label="Descrição">
          <div class="transactions-table__description">
            <strong>${escapeHTML(recurrence.description)}</strong>
          </div>
        </td>
        <td data-label="Tipo">
          <span class="transaction-badge ${typeMeta.className}">${escapeHTML(typeMeta.label)}</span>
        </td>
        <td data-label="Categoria">
          <span class="transaction-secondary">${escapeHTML(recurrence.category)}</span>
        </td>
        <td data-label="Valor">
          <strong class="transaction-amount ${typeMeta.className}">${typeMeta.sign}${escapeHTML(amount)}</strong>
        </td>
        <td data-label="Frequência">
          <span class="transaction-secondary">${escapeHTML(recurrence.frequencyLabel)}</span>
        </td>
        <td data-label="Status">
          <span class="recurrence-status ${statusMeta.className}">${escapeHTML(statusMeta.label)}</span>
        </td>
        <td data-label="Ações">
          ${renderRecurrenceActions(recurrence)}
        </td>
      </tr>
    `;
  }

  function getAccountTypeMeta(type) {
    const normalizedType = String(type || '').toLowerCase();
    const typeMap = {
      checking: { label: 'Conta corrente', shortLabel: 'CC' },
      savings: { label: 'Poupanca', shortLabel: 'PO' },
      wallet: { label: 'Carteira', shortLabel: 'CA' },
      digital_account: { label: 'Conta digital', shortLabel: 'CD' },
      credit_card: { label: 'Cartao de credito', shortLabel: 'CR' },
    };

    return typeMap[normalizedType] || { label: 'Conta', shortLabel: 'CT' };
  }

  function getAccountStatusMeta(status) {
    return String(status || '').toLowerCase() === 'inactive'
      ? { label: 'Inativa', className: 'status-paused' }
      : { label: 'Ativa', className: 'status-active' };
  }

  function renderAccountActionButton(action, account) {
    const configMap = {
      view: {
        label: 'Visualizar conta',
        className: 'transaction-action--view',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `,
      },
      edit: {
        label: 'Editar conta',
        className: 'transaction-action--edit',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 16.5V20h3.5L18.7 8.8a1.8 1.8 0 0 0 0-2.5l-1-1a1.8 1.8 0 0 0-2.5 0L4 16.5Zm11.7-11.7 3.5 3.5"></path>
          </svg>
        `,
      },
      delete: {
        label: 'Excluir conta',
        className: 'transaction-action--delete',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16"></path>
            <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"></path>
            <path d="M7 7l1 13h8l1-13"></path>
            <path d="M10 11v5"></path>
            <path d="M14 11v5"></path>
          </svg>
        `,
      },
    };
    const config = configMap[action];

    return `
      <button
        class="transaction-action ${config.className}"
        type="button"
        data-account-action="${action}"
        data-account-id="${escapeHTML(account.id)}"
        aria-label="${config.label} ${escapeHTML(account.name)}"
        title="${config.label}"
      >
        ${config.icon}
      </button>
    `;
  }

  function renderAccountCard(account) {
    const typeMeta = getAccountTypeMeta(account.type);
    const statusMeta = getAccountStatusMeta(account.status);
    const isCreditCard = String(account.type || '').toLowerCase() === 'credit_card';
    const color = escapeHTML(account.color || '#1A365D');
    const balance = Number(account.balance || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const creditLimit = Number(account.creditLimit || 0);
    const creditUsed = Number(account.creditUsed || 0);
    const creditAvailable = Math.max(creditLimit - creditUsed, 0);
    const progressWidth = creditLimit > 0 ? Math.min((creditUsed / creditLimit) * 100, 100) : 0;

    return `
      <article class="account-card ${isCreditCard ? 'account-card--credit' : 'account-card--cash'}" data-account-id="${escapeHTML(account.id)}">
        <div class="account-card__header">
          <div class="account-card__brand">
            <span class="account-card__icon" style="--account-color: ${color};">${escapeHTML(typeMeta.shortLabel)}</span>
            <div class="account-card__copy">
              <h3 class="account-card__title">${escapeHTML(account.name)}</h3>
              <div class="account-card__meta">
                <span>${escapeHTML(typeMeta.label)}</span>
                <span>${escapeHTML(account.institution || 'Sem instituicao')}</span>
              </div>
            </div>
          </div>
          <span class="recurrence-status ${statusMeta.className}">${escapeHTML(statusMeta.label)}</span>
        </div>

        ${isCreditCard ? `
          <div class="account-card__metrics">
            <div class="account-card__metric">
              <span>Limite total</span>
              <strong>${creditLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div class="account-card__metric">
              <span>Limite usado</span>
              <strong>${creditUsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div class="account-card__metric">
              <span>Disponivel</span>
              <strong>${creditAvailable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div class="account-card__metric">
              <span>Fatura atual</span>
              <strong>${Number(account.invoiceCurrent || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div class="account-card__metric">
              <span>Proxima fatura</span>
              <strong>${Number(account.invoiceNext || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
          </div>
          <div class="account-card__progress">
            <div class="account-card__progress-bar">
              <span style="width: ${progressWidth.toFixed(2)}%;"></span>
            </div>
            <small>${progressWidth.toFixed(0)}% do limite utilizado</small>
          </div>
        ` : `
          <div class="account-card__balance">
            <span>Saldo disponivel</span>
            <strong>${balance}</strong>
          </div>
        `}

        <div class="account-card__footer">
          <span class="transaction-secondary">${isCreditCard ? 'Cartao pronto para acompanhar limite, fatura e parcelas.' : 'Conta pronta para receber transacoes e historico.'}</span>
          <div class="card-entry__actions">
            ${renderAccountActionButton('view', account)}
            ${renderAccountActionButton('edit', account)}
            ${renderAccountActionButton('delete', account)}
          </div>
        </div>
      </article>
    `;
  }

  function getCategoryTypeMeta(type) {
    return String(type || '').toLowerCase() === 'income'
      ? { label: 'Receita', className: 'income' }
      : { label: 'Despesa', className: 'expense' };
  }

  function getCategoryStatusMeta(status) {
    return String(status || '').toLowerCase() === 'inactive'
      ? { label: 'Inativa', className: 'status-paused' }
      : { label: 'Ativa', className: 'status-active' };
  }

  function renderCategoryActionButton(action, category) {
    const configMap = {
      view: {
        label: 'Visualizar categoria',
        className: 'transaction-action--view',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `,
      },
      edit: {
        label: 'Editar categoria',
        className: 'transaction-action--edit',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 16.5V20h3.5L18.7 8.8a1.8 1.8 0 0 0 0-2.5l-1-1a1.8 1.8 0 0 0-2.5 0L4 16.5Zm11.7-11.7 3.5 3.5"></path>
          </svg>
        `,
      },
      toggle: {
        label: String(category.status || '').toLowerCase() === 'inactive' ? 'Reativar categoria' : 'Desativar categoria',
        className: 'transaction-action--toggle',
        icon: String(category.status || '').toLowerCase() === 'inactive'
          ? `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 6.5v11l8-5.5-8-5.5Z"></path>
            </svg>
          `
          : `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 6v12"></path>
              <path d="M14 6v12"></path>
            </svg>
          `,
      },
      delete: {
        label: 'Excluir categoria',
        className: 'transaction-action--delete',
        icon: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16"></path>
            <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"></path>
            <path d="M7 7l1 13h8l1-13"></path>
            <path d="M10 11v5"></path>
            <path d="M14 11v5"></path>
          </svg>
        `,
      },
    };
    const config = configMap[action];

    return `
      <button
        class="transaction-action ${config.className}"
        type="button"
        data-category-action="${action}"
        data-category-id="${escapeHTML(category.id)}"
        aria-label="${config.label} ${escapeHTML(category.name)}"
        title="${config.label}"
      >
        ${config.icon}
      </button>
    `;
  }

  function renderCategoryCard(category) {
    const typeMeta = getCategoryTypeMeta(category.type);
    const statusMeta = getCategoryStatusMeta(category.status);
    const monthlyTotal = Number(category.monthlyTotal || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return `
      <article class="category-card" data-category-id="${escapeHTML(category.id)}">
        <div class="category-card__header">
          <div class="category-card__brand">
            <span class="category-card__icon" style="--category-color: ${escapeHTML(category.color || '#1A365D')};">
              ${escapeHTML(category.icon || 'CT')}
            </span>
            <div class="category-card__copy">
              <h3 class="category-card__title">${escapeHTML(category.name)}</h3>
              <div class="category-card__meta">
                <span class="transaction-badge ${typeMeta.className}">${escapeHTML(typeMeta.label)}</span>
                <span class="recurrence-status ${statusMeta.className}">${escapeHTML(statusMeta.label)}</span>
              </div>
            </div>
          </div>
          <span class="category-card__color" style="--category-color: ${escapeHTML(category.color || '#1A365D')};"></span>
        </div>

        <p class="transaction-secondary">${escapeHTML(category.description || 'Sem descricao adicional para esta categoria.')}</p>

        <div class="category-card__stats">
          <div class="category-card__stat">
            <span>Transacoes vinculadas</span>
            <strong>${escapeHTML(String(category.transactionCount || 0))}</strong>
          </div>
          <div class="category-card__stat">
            <span>Total do mes</span>
            <strong>${escapeHTML(monthlyTotal)}</strong>
          </div>
        </div>

        <div class="category-card__footer">
          <span class="transaction-secondary">${escapeHTML(typeMeta.label)} organizada para filtros, relatorios e dashboard.</span>
          <div class="card-entry__actions">
            ${renderCategoryActionButton('view', category)}
            ${renderCategoryActionButton('edit', category)}
            ${renderCategoryActionButton('toggle', category)}
            ${renderCategoryActionButton('delete', category)}
          </div>
        </div>
      </article>
    `;
  }

  window.GestorFinanceiroDashboardComponents = {
    renderKpiCard,
    renderTransactionItem,
    renderTransactionTableRow,
    renderRecurrenceTableRow,
    renderAccountCard,
    renderCategoryCard,
  };
})();
