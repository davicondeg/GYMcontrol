import type { BotContext, ModuleResult, RoutedIntent } from '../types.ts';

type FinanceCategory = {
  id: string;
  name: string;
};

type FinanceAccount = {
  id: string;
  name: string;
  institution?: string | null;
};

type Conversation = {
  flow: string;
  step: string;
  state: Record<string, unknown>;
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveTargetDate(referenceDate: string, offsetValue: unknown) {
  const offset = Number(offsetValue ?? 0);
  const date = new Date(`${referenceDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + (Number.isInteger(offset) ? offset : 0));
  return date.toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseAmount(value: string) {
  const match = value.match(/(?:r\$\s*)?(\d+(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)(?![\d.,])/i);
  if (!match) return null;
  const raw = match[1];
  const normalized = raw.includes(',')
    ? raw.replaceAll('.', '').replace(',', '.')
    : /^\d{1,3}(?:\.\d{3})+$/.test(raw)
      ? raw.replaceAll('.', '')
      : raw;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function explicitAmount(value: string) {
  if (!/\b(valor|pre[cç]o|quantia)\b/i.test(value)) return null;
  return parseAmount(value);
}

function explicitDescription(value: string) {
  const patterns = [
    /(?:a\s+)?descri[cç][aã]o\s+(?:é|e|seria|fica|para)\s*[:=-]?\s*(.+?)(?:,?\s+corrigindo)?$/i,
    /corrigindo[,;:]?\s*(?:a\s+)?descri[cç][aã]o\s+(?:é|e|para)?\s*[:=-]?\s*(.+)$/i,
    /(?:mude|troque|altere)\s+(?:a\s+)?descri[cç][aã]o\s+(?:para|por)\s+(.+)$/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim().replace(/[.!?]+$/, '');
  }
  return null;
}

function explicitType(value: string) {
  const normalized = normalize(value);
  if (/\b(?:na verdade|corrigindo|correcao|mude|troque).*(?:despesa|saida|gasto)\b/.test(normalized)) return 'expense';
  if (/\b(?:na verdade|corrigindo|correcao|mude|troque).*(?:receita|entrada)\b/.test(normalized)) return 'income';
  if (/\bnao (?:e|seria) (?:uma )?receita\b/.test(normalized)) return 'expense';
  if (/\bnao (?:e|seria) (?:uma )?despesa\b/.test(normalized)) return 'income';
  return null;
}

function inferredTypeFromDescription(value: string) {
  const normalized = normalize(value);
  if (/\b(academia|aluguel|condominio|netflix|internet|energia|luz|agua|telefone|seguro|mensalidade)\b/.test(normalized)) {
    return 'expense';
  }
  if (/\b(salario|aposentadoria|freelance|dividendo|rendimento)\b/.test(normalized)) return 'income';
  return null;
}

function promptForStep(step: string, state: Record<string, unknown>) {
  const prompts: Record<string, string> = {
    type: 'Essa recorrência é uma receita ou uma despesa?',
    description: 'Qual é a descrição da recorrência?',
    amount: `Qual é o valor de “${state.description ?? 'essa recorrência'}”?`,
    category: 'Em qual categoria devo registrar?',
    day: 'Em qual dia do mês essa recorrência acontece?',
    payment_method: 'Como essa despesa é paga: cartão de crédito ou outra forma de pagamento?',
    card: 'Qual cartão será usado?',
    confirmation: `Confira: ${recurrenceSummary(state)}. Posso confirmar?`,
  };
  return prompts[step] ?? 'Como deseja continuar?';
}

async function saveConversation(context: BotContext, step: string, state: Record<string, unknown>) {
  const { error } = await context.admin.from('bot_conversations').upsert({
    user_id: context.userId,
    module_code: 'finance',
    flow: 'create_recurrence',
    step,
    state,
    status: 'active',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,module_code' });
  if (error) throw error;
}

async function finishConversation(context: BotContext, status: 'completed' | 'cancelled') {
  const { error } = await context.admin
    .from('bot_conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', context.userId)
    .eq('module_code', 'finance');
  if (error) throw error;
}

async function listCategories(context: BotContext, type: 'income' | 'expense') {
  const { data, error } = await context.admin
    .from('finance_categories')
    .select('id,name')
    .eq('user_id', context.userId)
    .eq('type', type)
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as FinanceCategory[];
}

async function listCreditCards(context: BotContext) {
  const { data, error } = await context.admin
    .from('finance_accounts')
    .select('id,name,institution')
    .eq('user_id', context.userId)
    .eq('type', 'credit_card')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as FinanceAccount[];
}

function findNamedItem<T extends { name: string }>(text: string, items: T[]) {
  const requested = normalize(text);
  return items.find(({ name }) => normalize(name) === requested)
    ?? items.find(({ name }) => requested.includes(normalize(name)) || normalize(name).includes(requested))
    ?? null;
}

function recurrenceSummary(state: Record<string, unknown>) {
  const type = state.type === 'income' ? 'receita' : 'despesa';
  const payment = state.type === 'expense'
    ? state.payment_method === 'credit'
      ? `, no cartão ${state.card_name}`
      : ', com pagamento fora do cartão de crédito'
    : '';
  return `${type} mensal de ${formatCurrency(Number(state.amount))}, “${state.description}”, categoria ${state.category_name}, todo dia ${state.day_of_month}${payment}`;
}

async function createRecurrence(context: BotContext, state: Record<string, unknown>): Promise<ModuleResult> {
  const { data: recurrence, error } = await context.admin
    .from('finance_recurring_transactions')
    .insert({
      user_id: context.userId,
      account_id: state.account_id ?? null,
      category_id: state.category_id,
      type: state.type,
      description: state.description,
      amount: state.amount,
      day_of_month: state.day_of_month,
      starts_on: context.date,
      frequency: 'monthly',
      payment_method: state.type === 'expense' ? state.payment_method : null,
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  await finishConversation(context, 'completed');
  return {
    reply: `Pronto. Cadastrei a ${recurrenceSummary(state)}.`,
    action: 'create_finance_recurrence',
    input: state,
    result: { recurrence_id: recurrence.id },
  };
}

export async function handleActiveFinanceConversation(context: BotContext): Promise<ModuleResult | null> {
  const { data, error } = await context.admin
    .from('bot_conversations')
    .select('flow,step,state')
    .eq('user_id', context.userId)
    .eq('module_code', 'finance')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const conversation = data as Conversation;
  if (conversation.flow !== 'create_recurrence') return null;
  const answer = context.text.trim();
  const normalizedAnswer = normalize(answer);
  const state = { ...(conversation.state ?? {}) };

  if (/^(cancelar|cancela|parar|sair|desistir)$/.test(normalizedAnswer)) {
    await finishConversation(context, 'cancelled');
    return { reply: 'Tudo bem. Cancelei o cadastro da recorrência.', action: 'cancel_finance_recurrence' };
  }

  if (/\b(voltar|volta|etapa anterior)\b/.test(normalizedAnswer)) {
    const previousSteps: Record<string, string> = {
      description: 'type',
      amount: 'description',
      category: 'amount',
      day: 'category',
      payment_method: 'day',
      card: 'payment_method',
      confirmation: state.type === 'expense'
        ? state.payment_method === 'credit' ? 'card' : 'payment_method'
        : 'day',
    };
    const previousStep = previousSteps[conversation.step];
    if (!previousStep) return { reply: 'Já estamos na primeira pergunta. A recorrência é uma receita ou uma despesa?' };
    await saveConversation(context, previousStep, state);
    return { reply: `Tudo bem, voltamos uma etapa. ${promptForStep(previousStep, state)}` };
  }

  const correctedType = explicitType(answer);
  if (correctedType && conversation.step !== 'type') {
    state.type = correctedType;
    delete state.category_id;
    delete state.category_name;
    if (correctedType === 'income') {
      delete state.payment_method;
      delete state.account_id;
      delete state.card_name;
    }
    await saveConversation(context, conversation.step, state);
    return {
      reply: `Entendi a correção: é uma ${correctedType === 'income' ? 'receita' : 'despesa'}. ${promptForStep(conversation.step, state)}`,
      action: 'correct_finance_recurrence',
      input: { field: 'type', value: correctedType },
    };
  }

  const correctedDescription = explicitDescription(answer);
  if (correctedDescription && conversation.step !== 'description') {
    if (correctedDescription.length > 160) return { reply: 'A nova descrição precisa ter até 160 caracteres.' };
    state.description = correctedDescription;
    await saveConversation(context, conversation.step, state);
    return {
      reply: `Certo, alterei a descrição para “${correctedDescription}”. ${promptForStep(conversation.step, state)}`,
      action: 'correct_finance_recurrence',
      input: { field: 'description', value: correctedDescription },
    };
  }

  const correctedAmount = explicitAmount(answer);
  if (correctedAmount && conversation.step !== 'amount') {
    state.amount = correctedAmount;
    const shouldConfirmNow = conversation.step === 'confirmation'
      && /\b(confirm|confirme|confirmar|salve|salvar|cadastre|cadastrar)\b/.test(normalizedAnswer);
    if (shouldConfirmNow) return createRecurrence(context, state);
    await saveConversation(context, conversation.step, state);
    return {
      reply: conversation.step === 'confirmation'
        ? `Corrigi o valor. Agora ficou: ${recurrenceSummary(state)}. Posso confirmar?`
        : `Certo, alterei o valor para ${formatCurrency(correctedAmount)}. ${promptForStep(conversation.step, state)}`,
      action: 'correct_finance_recurrence',
      input: { field: 'amount', value: correctedAmount },
    };
  }

  if (conversation.step === 'type') {
    const type = /receita|entrada/.test(normalizedAnswer)
      ? 'income'
      : /despesa|saida|gasto/.test(normalizedAnswer)
        ? 'expense'
        : null;
    if (!type) return { reply: 'Essa recorrência é uma receita ou uma despesa?' };
    state.type = type;
    await saveConversation(context, 'description', state);
    return { reply: 'Qual é a descrição da recorrência? Por exemplo: Academia, Aluguel ou Salário.' };
  }

  if (conversation.step === 'description') {
    const description = correctedDescription
      ?? answer.split(/,\s*(?:n[aã]o|mas|corrigindo)/i)[0].trim().replace(/[.!?]+$/, '');
    if (description.length < 2 || description.length > 160) return { reply: 'Informe uma descrição entre 2 e 160 caracteres.' };
    const inferredType = inferredTypeFromDescription(description);
    const changedType = inferredType && inferredType !== state.type && /\?|n[aã]o|corrig|na verdade/i.test(answer);
    if (changedType) state.type = inferredType;
    state.description = description;
    await saveConversation(context, 'amount', state);
    return {
      reply: changedType
        ? `Você tem razão: “${description}” normalmente é uma ${inferredType === 'expense' ? 'despesa' : 'receita'}. Corrigi o tipo. Qual é o valor?`
        : `Qual é o valor de “${description}”?`,
    };
  }

  if (conversation.step === 'amount') {
    const amount = parseAmount(answer);
    if (!amount) return { reply: 'Não identifiquei um valor válido. Responda, por exemplo: R$ 120,00.' };
    state.amount = amount;
    const type = state.type as 'income' | 'expense';
    const categories = await listCategories(context, type);
    if (!categories.length) {
      const category = await createSuggestedCategory(context, type, String(state.description ?? ''));
      state.category_id = category.id;
      state.category_name = category.name;
      await saveConversation(context, 'day', state);
      return {
        reply: `Criei a categoria “${category.name}” para você. Em qual dia do mês essa recorrência acontece? Responda com um número de 1 a 31.`,
        action: 'create_finance_category',
        input: { name: category.name, type },
        result: { category_id: category.id },
      };
    }
    const inferredCategory = findCategory(null, String(state.description ?? ''), categories);
    if (inferredCategory) {
      state.category_id = inferredCategory.id;
      state.category_name = inferredCategory.name;
      await saveConversation(context, 'day', state);
      return { reply: `Vou usar a categoria “${inferredCategory.name}”. Em qual dia do mês essa recorrência acontece?` };
    }
    await saveConversation(context, 'category', state);
    return { reply: `Em qual categoria? Opções: ${categories.map(({ name }) => name).join(', ')}.` };
  }

  if (conversation.step === 'category') {
    const categories = await listCategories(context, state.type as 'income' | 'expense');
    const category = findNamedItem(answer, categories);
    if (!category) return { reply: `Não encontrei essa categoria. Escolha uma destas: ${categories.map(({ name }) => name).join(', ')}.` };
    state.category_id = category.id;
    state.category_name = category.name;
    await saveConversation(context, 'day', state);
    return { reply: 'Em qual dia do mês essa recorrência acontece? Responda com um número de 1 a 31.' };
  }

  if (conversation.step === 'day') {
    const day = Number(answer.match(/\d{1,2}/)?.[0]);
    if (!Number.isInteger(day) || day < 1 || day > 31) return { reply: 'Informe um dia válido entre 1 e 31.' };
    state.day_of_month = day;
    if (state.type === 'expense') {
      await saveConversation(context, 'payment_method', state);
      return { reply: 'Como essa despesa é paga: cartão de crédito ou outra forma de pagamento?' };
    }
    await saveConversation(context, 'confirmation', state);
    return { reply: `Vou cadastrar uma ${recurrenceSummary(state)}. Confirma? Responda “sim” ou “cancelar”.` };
  }

  if (conversation.step === 'payment_method') {
    const isCredit = /credito|cartao/.test(normalizedAnswer);
    const isOther = /debito|pix|boleto|dinheiro|transferencia|outra/.test(normalizedAnswer);
    if (!isCredit && !isOther) return { reply: 'Responda “cartão de crédito” ou “outra forma de pagamento”.' };
    state.payment_method = isCredit ? 'credit' : 'debit';
    if (isCredit) {
      const cards = await listCreditCards(context);
      if (!cards.length) return { reply: 'Você não possui um cartão ativo cadastrado. Cadastre um cartão no app ou responda “outra forma de pagamento”.' };
      await saveConversation(context, 'card', state);
      return { reply: `Qual cartão? Opções: ${cards.map(({ name }: { name: string }) => name).join(', ')}.` };
    }
    await saveConversation(context, 'confirmation', state);
    return { reply: `Vou cadastrar uma ${recurrenceSummary(state)}. Confirma? Responda “sim” ou “cancelar”.` };
  }

  if (conversation.step === 'card') {
    const cards = await listCreditCards(context);
    const card = findNamedItem(answer, cards);
    if (!card) return { reply: `Não encontrei esse cartão. Escolha um destes: ${cards.map(({ name }: { name: string }) => name).join(', ')}.` };
    state.account_id = card.id;
    state.card_name = card.name;
    await saveConversation(context, 'confirmation', state);
    return { reply: `Vou cadastrar uma ${recurrenceSummary(state)}. Confirma? Responda “sim” ou “cancelar”.` };
  }

  if (conversation.step === 'confirmation') {
    if (!/\b(sim|confirmo|pode confirmar|pode cadastrar|esta certo|ta certo|correto|isso mesmo|ok)\b/.test(normalizedAnswer)) {
      return { reply: 'Responda “sim” para confirmar ou “cancelar” para encerrar.' };
    }
    return createRecurrence(context, state);
  }

  await finishConversation(context, 'cancelled');
  return { reply: 'A conversa anterior perdeu o contexto. Inicie novamente pedindo para adicionar uma recorrência.' };
}

function findCategory(categoryName: unknown, description: string, categories: FinanceCategory[]) {
  const requested = normalize(String(categoryName ?? ''));
  const normalizedDescription = normalize(description);
  const categoryAliases: Record<string, string[]> = {
    salario: ['salario', 'pagamento', 'holerite'],
    freelance: ['freelance', 'freela', 'cliente', 'servico'],
    investimentos: ['investimento', 'dividendo', 'rendimento', 'juros'],
    'outras receitas': ['outras receitas', 'receita', 'entrada'],
    saude: ['saude', 'academia', 'medico', 'farmacia', 'remedio', 'plano de saude'],
    moradia: ['moradia', 'aluguel', 'condominio', 'energia', 'luz', 'agua'],
    assinaturas: ['assinatura', 'netflix', 'spotify', 'streaming'],
    transporte: ['transporte', 'uber', 'combustivel', 'gasolina'],
    'outras despesas': ['outras despesas', 'despesa', 'gasto'],
  };

  const exact = categories.find(({ name }) => normalize(name) === requested);
  if (exact) return exact;

  const byRequestedName = requested
    ? categories.find(({ name }) => normalize(name).includes(requested) || requested.includes(normalize(name)))
    : null;
  if (byRequestedName) return byRequestedName;

  const byAlias = categories.find(({ name }) => {
    const normalizedName = normalize(name);
    const terms = categoryAliases[normalizedName] ?? [normalizedName];
    return terms.some((term) => normalizedDescription.includes(term));
  });
  if (byAlias) return byAlias;

  return categories.find(({ name }) => ['outras receitas', 'outras despesas'].includes(normalize(name)))
    ?? (categories.length === 1 ? categories[0] : null);
}

function suggestedCategory(description: string, type: 'income' | 'expense') {
  const normalized = normalize(description);
  const suggestions = type === 'income'
    ? [
        { name: 'Salário', terms: ['salario', 'holerite', 'pagamento'] },
        { name: 'Freelance', terms: ['freelance', 'freela', 'cliente', 'servico'] },
        { name: 'Investimentos', terms: ['investimento', 'dividendo', 'rendimento', 'juros'] },
      ]
    : [
        { name: 'Saúde', terms: ['saude', 'academia', 'medico', 'farmacia', 'remedio', 'plano'] },
        { name: 'Moradia', terms: ['moradia', 'aluguel', 'condominio', 'energia', 'luz', 'agua'] },
        { name: 'Assinaturas', terms: ['assinatura', 'netflix', 'spotify', 'streaming'] },
        { name: 'Transporte', terms: ['transporte', 'uber', 'combustivel', 'gasolina'] },
      ];
  return suggestions.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.name
    ?? (type === 'income' ? 'Outras receitas' : 'Outras despesas');
}

async function createSuggestedCategory(
  context: BotContext,
  type: 'income' | 'expense',
  description: string,
) {
  const name = suggestedCategory(description, type);
  const { data: existingCategories, error: lookupError } = await context.admin
    .from('finance_categories')
    .select('id,name')
    .eq('user_id', context.userId)
    .eq('type', type);
  if (lookupError) throw lookupError;
  const existingCategory = (existingCategories ?? []).find(
    (category: FinanceCategory) => normalize(category.name) === normalize(name),
  );
  if (existingCategory) {
    const { data, error } = await context.admin
      .from('finance_categories')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', existingCategory.id)
      .eq('user_id', context.userId)
      .select('id,name')
      .single();
    if (error) throw error;
    return data as FinanceCategory;
  }
  const { data, error } = await context.admin
    .from('finance_categories')
    .insert({
      user_id: context.userId,
      name,
      type,
      icon: name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase(),
      color: type === 'income' ? '#157F42' : '#B42318',
      description: 'Categoria criada automaticamente pelo Jhonny.',
      is_active: true,
    })
    .select('id,name')
    .single();
  if (error) throw error;
  return data as FinanceCategory;
}

export async function handleFinanceIntent(
  context: BotContext,
  route: RoutedIntent,
): Promise<ModuleResult> {
  if (route.intent === 'create_recurrence') {
    await saveConversation(context, 'type', {});
    return {
      reply: 'Claro. Essa recorrência é uma receita ou uma despesa? Você pode digitar “cancelar” a qualquer momento.',
      action: 'start_finance_recurrence',
    };
  }

  if (route.intent !== 'add_income') {
    return { reply: 'Por enquanto, no Financeiro eu consigo registrar receitas.' };
  }

  const amount = Number(route.entities.amount);
  const description = String(route.entities.description ?? '').trim().slice(0, 160);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999999.99) {
    return { reply: 'Não consegui identificar um valor válido. Tente, por exemplo: “Recebi R$ 500 de um cliente”.' };
  }
  if (!description) {
    return { reply: 'Qual é a descrição dessa receita? Exemplo: “Recebi R$ 500 de um cliente”.' };
  }

  const { data: categoryRows, error: categoriesError } = await context.admin
    .from('finance_categories')
    .select('id,name')
    .eq('user_id', context.userId)
    .eq('type', 'income')
    .eq('is_active', true)
    .order('name');
  if (categoriesError) throw categoriesError;

  const categories = (categoryRows ?? []) as FinanceCategory[];
  const category = categories.length
    ? findCategory(route.entities.categoryName, description, categories)
    : await createSuggestedCategory(context, 'income', description);
  if (!category) {
    return {
      reply: `Em qual categoria devo registrar? Suas categorias de receita são: ${categories.map(({ name }: FinanceCategory) => name).join(', ')}.`,
    };
  }

  const transactionDate = resolveTargetDate(context.date, route.entities.dateOffsetDays);
  const { data: transaction, error } = await context.admin
    .from('finance_transactions')
    .insert({
      user_id: context.userId,
      category_id: category.id,
      type: 'income',
      description,
      amount,
      transaction_date: transactionDate,
      notes: `Registrada pelo WhatsApp. Mensagem: ${context.text}`.slice(0, 1000),
    })
    .select('id')
    .single();
  if (error) throw error;

  const [, month, day] = transactionDate.split('-');
  return {
    reply: `Receita registrada: ${formatCurrency(amount)} em “${description}”, categoria ${category.name}, no dia ${day}/${month}.`,
    action: 'add_finance_income',
    input: {
      amount,
      description,
      category_id: category.id,
      category_name: category.name,
      transaction_date: transactionDate,
    },
    result: { transaction_id: transaction.id },
  };
}
