import type { RoutedIntent } from './types.ts';

function dateOffsetFromText(text: string, referenceDate: string) {
  const normalized = text.toLowerCase().trim();
  if (/\bdepois de amanhã(?:\s|$)/i.test(normalized)) return 2;
  if (/\bamanhã(?:\s|$)/i.test(normalized)) return 1;
  if (/\banteontem\b/i.test(normalized)) return -2;
  if (/\bontem\b/i.test(normalized)) return -1;
  if (/\bhoje\b/i.test(normalized)) return 0;

  const daysAgo = normalized.match(/\bhá\s+(\d{1,4})\s+dias?\b|\bha\s+(\d{1,4})\s+dias?\b/i);
  if (daysAgo) return -Number(daysAgo[1] ?? daysAgo[2]);

  const explicitDate = normalized.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if (!explicitDate) return null;
  const reference = new Date(`${referenceDate}T12:00:00Z`);
  const yearValue = explicitDate[3] ? Number(explicitDate[3]) : reference.getUTCFullYear();
  const year = yearValue < 100 ? 2000 + yearValue : yearValue;
  const target = new Date(Date.UTC(year, Number(explicitDate[2]) - 1, Number(explicitDate[1]), 12));
  if (
    target.getUTCFullYear() !== year ||
    target.getUTCMonth() !== Number(explicitDate[2]) - 1 ||
    target.getUTCDate() !== Number(explicitDate[1])
  ) return Number.NaN;
  return Math.round((target.getTime() - reference.getTime()) / 86400000);
}

export function withTemporalContext(text: string, referenceDate: string, route: RoutedIntent) {
  const parsedOffset = dateOffsetFromText(text, referenceDate);
  const modelOffset = Number(route.entities.dateOffsetDays);
  const dateOffsetDays = parsedOffset ?? (Number.isInteger(modelOffset) ? modelOffset : 0);
  const isSupportedOffset = dateOffsetDays <= 0 && dateOffsetDays >= -3650;

  if ((route.module === 'gym' || route.module === 'finance') && !isSupportedOffset) {
    return {
      module: 'assistant' as const,
      intent: 'general_chat',
      confidence: 1,
      entities: {
        reply: Number.isNaN(dateOffsetDays)
          ? 'A data informada não é válida. Use, por exemplo, 20/10/2026.'
          : dateOffsetDays > 0
            ? 'Ainda não registro informações em datas futuras. Informe hoje ou uma data passada.'
            : 'Consigo consultar ou registrar informações dos últimos 10 anos.',
      },
    };
  }

  return { ...route, entities: { ...route.entities, dateOffsetDays: isSupportedOffset ? dateOffsetDays : 0 } };
}

function parseWaterAmount(text: string) {
  const normalized = text.toLowerCase().replace(',', '.');
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(ml|mililitros?|l|litros?)/i);
  if (!match || !/(bebi|tomei|água|agua|adicion)/i.test(normalized)) return null;

  const value = Number(match[1]);
  return Math.round(match[2].toLowerCase().startsWith('l') ? value * 1000 : value);
}

function parseMoneyAmount(text: string) {
  const match = text.match(/(?:r\$\s*)?(\d+(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)(?![\d.,])(?:\s*(?:reais?|real))?/i);
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

function parseIncomeDescription(text: string) {
  return text
    .replace(/\b(?:hoje|ontem|anteontem)\b/gi, '')
    .replace(/\b(?:recebi|ganhei|entrou|caiu|registre|registra|adicione|adiciona|anote)\b/gi, '')
    .replace(/(?:r\$\s*)?(?:\d+(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)(?![\d.,])/gi, '')
    .replace(/\b(?:reais?|real)\b/gi, '')
    .replace(/^\s*(?:de|do|da|por|como)\s+/i, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
    .trim() || 'Receita pelo WhatsApp';
}

export function routeMessage(text: string): RoutedIntent {
  const normalized = text.toLowerCase().trim();
  const waterAmount = parseWaterAmount(normalized);

  if (/(?:recebi|ganhei|entrou|caiu).*(?:r\$|\d|reais?|real)|(?:registr|adicion|anot).*(?:receita|entrada)/i.test(normalized)) {
    const amount = parseMoneyAmount(normalized);
    return {
      module: 'finance',
      intent: 'add_income',
      confidence: amount ? 0.98 : 0.82,
      entities: { amount, description: parseIncomeDescription(text) },
    };
  }

  if (/(?:adicion|cadastr|cri|registr).*(?:recorr[eê]ncia|recorrente)|(?:nova|uma).*(?:recorr[eê]ncia|recorrente)/i.test(normalized)) {
    return { module: 'finance', intent: 'create_recurrence', confidence: 0.97, entities: {} };
  }

  if (waterAmount) {
    return { module: 'gym', intent: 'add_water', confidence: 1, entities: { amountMl: waterAmount } };
  }

  if (
    /quanto.*(água|agua)|total.*(água|agua)|(como|qual).*(hidratação|hidratacao)|(hidratação|hidratacao).*(hoje|agora|por enquanto|indo|estou)/i.test(normalized)
  ) {
    return { module: 'gym', intent: 'query_water', confidence: 0.98, entities: {} };
  }

  if (
    /(exercícios|exercicios|cargas?).*(treinos?)|(treinos?).*(exercícios|exercicios|cargas?)|(o que|que).*(coloquei|tem|há|ha).*(treinos?)|(treinos?).*(o que|que).*(coloquei|tem|há|ha)/i.test(normalized)
  ) {
    return { module: 'gym', intent: 'list_workout_exercises', confidence: 0.97, entities: {} };
  }

  if (/(quais|listar|mostre|ver).*(meus )?treinos|quais treinos.*(tenho|existem)|^(meus )?treinos[?!. ]*$/i.test(normalized)) {
    return { module: 'gym', intent: 'list_workouts', confidence: 0.96, entities: {} };
  }

  if (/^(qual|o que).*(treino).*(hoje)|treino de hoje/i.test(normalized)) {
    return { module: 'gym', intent: 'workout_today', confidence: 0.93, entities: {} };
  }

  if (/^(já|ja).*(fiz|concluí|conclui|terminei).*(treino)|^(fiz|concluí|conclui|terminei).*(treino).*[?]$/i.test(normalized)) {
    return { module: 'gym', intent: 'query_workout', confidence: 0.9, entities: {} };
  }

  if (/(não|nao).*(fiz|concluí|conclui|terminei).*(treino)|desmar(ca|que).*(treino)/i.test(normalized)) {
    return { module: 'gym', intent: 'set_workout', confidence: 0.94, entities: { done: false } };
  }

  if (/(fiz|concluí|conclui|terminei).*(treino)|(treino).*(feito|concluído|concluido)/i.test(normalized)) {
    return { module: 'gym', intent: 'set_workout', confidence: 0.9, entities: { done: true } };
  }

  if (/(quais|quantos|resumo|lista).*(hábitos|habitos|refeições|refeicoes|suplementos).*(hoje)?/i.test(normalized)) {
    return { module: 'gym', intent: 'query_habits_today', confidence: 0.92, entities: {} };
  }

  if (/(não|nao).*(tomei|fiz|completei|marquei|comi|marque|registre)|desmar(ca|que)|desfaz.*(hábito|habito|creatina|whey)/i.test(normalized)) {
    return { module: 'gym', intent: 'set_habit', confidence: 0.9, entities: { done: false } };
  }

  if (
    /(?:^(?:já|ja)\s+)?(?:eu\s+)?(?:tomei|fiz|completei|marquei|comi|almocei|jantei).*[?]$|(?:você|voce).*(?:registrou|marcou)|(?:está|esta|foi).*(?:marcado|registrado)/i.test(normalized)
  ) {
    return { module: 'gym', intent: 'query_habit', confidence: 0.92, entities: {} };
  }

  if (
    /(?:tomei|fiz|completei|marquei|comi|almocei|jantei)|(?:marque|registre|registra|anote).*(?:hábito|habito|refeição|refeicao|café|cafe|lanche|almoço|almoco|janta|jantar|ceia|creatina|whey)|acabei de (?:fazer|realizar|comer|tomar)/i.test(normalized)
  ) {
    return { module: 'gym', intent: 'set_habit', confidence: 0.84, entities: { done: true } };
  }

  if (/(link|endereço|endereco|abrir).*(gym|academia)|(gym|academia).*(link|endereço|endereco|abrir)/i.test(normalized)) {
    return { module: 'gym', intent: 'app_link', confidence: 0.95, entities: {} };
  }

  if (/(gastei|gasto|despesa|uber|financeir|reais|r\$)/i.test(normalized)) {
    return { module: 'finance', intent: 'module_not_available', confidence: 0.75, entities: {} };
  }

  if (/(agenda|calendário|calendario|tarefa|compromisso|entregar|lembrete)/i.test(normalized)) {
    return { module: 'agenda', intent: 'module_not_available', confidence: 0.75, entities: {} };
  }

  if (/^(ajuda|menu|o que você faz|o que voce faz|como você pode me ajudar|como voce pode me ajudar|do que você é capaz|do que voce e capaz)[?!. ]*$/i.test(normalized)) {
    return { module: 'assistant', intent: 'help', confidence: 1, entities: {} };
  }

  if (/^(oi|olá|ola|e aí|e ai|bom dia|boa tarde|boa noite|fala)(,? (jhonny|johnny))?[?!. ]*$/i.test(normalized)) {
    return {
      module: 'assistant', intent: 'general_chat', confidence: 1,
      entities: { reply: 'Olá! Sou o Jhonny. Como posso ajudar você hoje?' },
    };
  }

  if (/^(quem (é|e) você|quem (é|e) voce|qual (é|e) o seu nome)[?!. ]*$/i.test(normalized)) {
    return {
      module: 'assistant', intent: 'general_chat', confidence: 1,
      entities: { reply: 'Sou o Jhonny, seu assistente pessoal integrado ao GymControl.' },
    };
  }

  return { module: 'assistant', intent: 'unknown', confidence: 0, entities: {} };
}
