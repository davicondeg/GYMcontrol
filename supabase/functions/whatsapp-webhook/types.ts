export type ModuleCode = 'gym' | 'agenda' | 'finance' | 'assistant';

export type RoutedIntent = {
  module: ModuleCode;
  intent: string;
  confidence: number;
  entities: Record<string, unknown>;
};

export type BotContext = {
  admin: any;
  messageId: string;
  userId: string;
  waId: string;
  text: string;
  date: string;
  gymControlUrl?: string;
};

export type ModuleResult = {
  reply: string;
  action?: string;
  input?: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type MessageProvider =
  | { type: 'meta' }
  | { type: 'evolution'; instance: string };

export type IncomingMessage = {
  messageId: string;
  waId: string;
  text: string;
  provider: MessageProvider;
};
