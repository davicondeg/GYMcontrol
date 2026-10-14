import type { RoutedIntent } from './types.ts';

function parseWaterAmount(text: string) {
  const normalized = text.toLowerCase().replace(',', '.');
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(ml|mililitros?|l|litros?)/i);
  if (!match || !/(bebi|tomei|água|agua|adicion)/i.test(normalized)) return null;

  const value = Number(match[1]);
  return Math.round(match[2].toLowerCase().startsWith('l') ? value * 1000 : value);
}

export function routeMessage(text: string): RoutedIntent {
  const normalized = text.toLowerCase().trim();
  const waterAmount = parseWaterAmount(normalized);

  if (waterAmount) {
    return { module: 'gym', intent: 'add_water', confidence: 1, entities: { amountMl: waterAmount } };
  }

  if (/quanto.*(água|agua)|total.*(água|agua)/i.test(normalized)) {
    return { module: 'gym', intent: 'query_water', confidence: 0.98, entities: {} };
  }

  if (/(quais|listar|mostre|ver).*(meus )?treinos|^(meus )?treinos[?!. ]*$/i.test(normalized)) {
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

  if (
    /^(já|ja).*(tomei|fiz|completei|marquei)|^(tomei|fiz|completei|marquei).*[?]$|^(creatina|whey|café|cafe|almoço|almoco|janta|ceia).*[?]$/i.test(normalized)
  ) {
    return { module: 'gym', intent: 'query_habit', confidence: 0.88, entities: {} };
  }

  if (/(não|nao) (tomei|fiz|completei|marquei|comi)|desmar(ca|que)|desfaz.*(hábito|habito|creatina|whey)/i.test(normalized)) {
    return { module: 'gym', intent: 'set_habit', confidence: 0.9, entities: { done: false } };
  }

  if (/(tomei|fiz|completei|marquei|comi|almocei|jantei)/i.test(normalized)) {
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

  if (/^(ajuda|menu|o que você faz|o que voce faz)[?!. ]*$/i.test(normalized)) {
    return { module: 'assistant', intent: 'help', confidence: 1, entities: {} };
  }

  return { module: 'assistant', intent: 'unknown', confidence: 0, entities: {} };
}
