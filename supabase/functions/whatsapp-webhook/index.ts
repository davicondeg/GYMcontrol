import { createClient } from 'npm:@supabase/supabase-js@2';
import { classifyWithGemini } from './gemini.ts';
import { handleGymIntent } from './modules/gym.ts';
import { handleActiveFinanceConversation, handleFinanceIntent } from './modules/finance.ts';
import { routeMessage, withTemporalContext } from './router.ts';
import type { IncomingMessage, MessageProvider, ModuleResult, RoutedIntent } from './types.ts';

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8' };

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing secret: ${name}`);
  return value;
}

function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

async function verifySignature(request: Request, body: string) {
  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(env('WHATSAPP_APP_SECRET')),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
  const expected = `sha256=${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  return signature.length === expected.length && signature === expected;
}

async function sendMetaText(to: string, text: string) {
  const response = await fetch(
    `https://graph.facebook.com/v23.0/${env('WHATSAPP_PHONE_NUMBER_ID')}/messages`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${env('WHATSAPP_ACCESS_TOKEN')}`, ...jsonHeaders },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
    },
  );
  if (!response.ok) throw new Error(`WhatsApp send failed: ${response.status}`);
}

async function sendEvolutionText(admin: any, instance: string, to: string, message: string) {
  if (Deno.env.get('EVOLUTION_REPLY_ENABLED') !== 'true') {
    const { error } = await admin.from('bot_outbox').insert({
      provider: 'evolution',
      instance_name: instance,
      recipient: to,
      message_text: message,
    });
    if (error) throw error;
    return;
  }

  const baseUrl = env('EVOLUTION_API_URL').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/message/sendText/${encodeURIComponent(instance)}`, {
    method: 'POST',
    headers: { apikey: env('EVOLUTION_API_KEY'), ...jsonHeaders },
    body: JSON.stringify({ number: to, text: message }),
  });
  if (!response.ok) throw new Error(`Evolution send failed: ${response.status}`);
}

async function sendText(admin: any, provider: MessageProvider, to: string, text: string) {
  if (provider.type === 'evolution') {
    return sendEvolutionText(admin, provider.instance, to, text);
  }
  return sendMetaText(to, text);
}

function evolutionText(data: any) {
  return data?.message?.conversation ??
    data?.message?.extendedTextMessage?.text ??
    data?.message?.ephemeralMessage?.message?.extendedTextMessage?.text ??
    null;
}

function whatsappNumber(jid: unknown) {
  return String(jid ?? '').split('@')[0].replace(/\D/g, '');
}

function parseEvolutionMessages(payload: any): IncomingMessage[] {
  if (String(payload?.event ?? '').toLowerCase().replaceAll('_', '.') !== 'messages.upsert') return [];
  const data = payload?.data;
  if (!data || data.key?.fromMe || String(data.key?.remoteJid ?? '').endsWith('@g.us')) return [];
  const text = evolutionText(data)?.trim();
  const waId = whatsappNumber(data.key?.remoteJidAlt ?? data.key?.participantAlt ?? data.key?.remoteJid);
  if (!text || !waId || !data.key?.id || !payload.instance) return [];
  return [{
    messageId: `evolution:${payload.instance}:${data.key.id}`,
    waId,
    text,
    provider: { type: 'evolution', instance: String(payload.instance) },
  }];
}

function parseMetaMessages(payload: any): IncomingMessage[] {
  const messages = payload?.entry?.flatMap((entry: any) =>
    entry.changes?.flatMap((change: any) => change.value?.messages ?? []) ?? []) ?? [];
  return messages
    .filter((message: any) => message.type === 'text')
    .map((message: any) => ({
      messageId: String(message.id),
      waId: String(message.from),
      text: String(message.text?.body ?? '').trim(),
      provider: { type: 'meta' as const },
    }));
}

Deno.serve(async (request: Request) => {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const valid = url.searchParams.get('hub.mode') === 'subscribe' &&
      url.searchParams.get('hub.verify_token') === env('WHATSAPP_VERIFY_TOKEN');
    return new Response(valid ? url.searchParams.get('hub.challenge') ?? '' : 'Forbidden', { status: valid ? 200 : 403 });
  }
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const rawBody = await request.text();
  const payload = JSON.parse(rawBody);
  const isEvolution = Boolean(payload?.event && payload?.instance && payload?.data);
  if (isEvolution) {
    const url = new URL(request.url);
    if (url.searchParams.get('secret') !== env('EVOLUTION_WEBHOOK_SECRET')) {
      return new Response('Invalid Evolution webhook secret', { status: 401 });
    }
  } else if (!await verifySignature(request, rawBody)) {
    return new Response('Invalid Meta signature', { status: 401 });
  }

  const messages = isEvolution ? parseEvolutionMessages(payload) : parseMetaMessages(payload);
  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  for (const message of messages) {
    const { messageId, provider, text, waId } = message;
    const { error: duplicateError } = await admin.from('bot_messages').insert({
      message_id: messageId,
      wa_id: waId,
      direction: 'incoming',
      message_text: text,
      metadata: { provider: provider.type },
    });
    if (duplicateError?.code === '23505') continue;
    if (duplicateError) throw duplicateError;

    const linkCode = text.match(/^(GYM|APP)-\d{6}$/i)?.[0];
    if (linkCode) {
      const { data: userId } = await admin.rpc('bot_link_whatsapp', { p_code: linkCode, p_wa_id: waId });
      await sendText(admin, provider, waId, userId ? 'WhatsApp conectado à sua conta GYMcontrol.' : 'Código inválido ou expirado. Gere um novo código no aplicativo.');
      continue;
    }

    const { data: connection } = await admin.from('whatsapp_connections').select('user_id').eq('wa_id', waId).maybeSingle();
    if (!connection) {
      await sendText(admin, provider, waId, 'Conecte seu WhatsApp pelo aplicativo GYMcontrol antes de usar o bot.');
      continue;
    }

    const referenceDate = localDate();
    const context = {
      admin,
      messageId,
      userId: connection.user_id,
      waId,
      text,
      date: referenceDate,
    };
    const activeFinanceResponse = await handleActiveFinanceConversation(context);
    const deterministicRoute = activeFinanceResponse ? null : routeMessage(text);
    const classifiedRoute = deterministicRoute?.intent === 'unknown'
      ? await classifyWithGemini(text, referenceDate) ?? deterministicRoute
      : deterministicRoute;
    const route: RoutedIntent = activeFinanceResponse
      ? { module: 'finance' as const, intent: 'continue_recurrence', confidence: 1, entities: {} }
      : withTemporalContext(text, referenceDate, classifiedRoute!);
    let response: ModuleResult;

    if (activeFinanceResponse) {
      response = activeFinanceResponse;
    } else if (route.module === 'gym') {
      response = await handleGymIntent({
        admin,
        messageId,
        userId: connection.user_id,
        waId,
        text,
        date: referenceDate,
        gymControlUrl: Deno.env.get('GYMCONTROL_APP_URL') ?? undefined,
      }, route);
    } else if (route.module === 'finance' && ['add_income', 'create_recurrence'].includes(route.intent)) {
      response = await handleFinanceIntent(context, route);
    } else if (route.intent === 'module_not_available') {
      const moduleName = route.module === 'finance' ? 'Financeiro' : 'Agenda';
      response = route.module === 'finance'
        ? { reply: 'O Financeiro já registra receitas. O cadastro de despesas pelo WhatsApp será habilitado na próxima etapa.' }
        : { reply: `Entendi que essa mensagem pertence ao módulo ${moduleName}, mas ele ainda não está disponível.` };
    } else if (route.intent === 'help') {
      response = {
        reply: 'Posso conversar, registrar receitas e também registrar ou consultar água, hábitos e treinos. Exemplos: “recebi R$ 500 de um cliente”, “bebi 500 ml”, “tomei creatina ontem” e “quais hábitos fiz hoje?”.',
      };
    } else if (route.intent === 'general_chat' && typeof route.entities.reply === 'string') {
      response = { reply: route.entities.reply };
    } else {
      response = {
        reply: 'Não entendi com segurança. Tente, por exemplo: “recebi R$ 500 de um cliente”, “bebi 500 ml”, “listar meus treinos” ou “link do GymControl”.',
      };
    }

    if (response.action) {
      const { error: actionError } = await admin.from('bot_actions').insert({
        message_id: messageId,
        user_id: connection.user_id,
        module_code: route.module,
        intent: route.intent,
        action: response.action,
        status: 'completed',
        input: response.input ?? {},
        result: response.result ?? {},
      });
      if (actionError) throw actionError;
    }

    await sendText(admin, provider, waId, response.reply);
    await admin.from('bot_messages').update({
      user_id: connection.user_id,
      module_code: route.module === 'assistant' ? null : route.module,
      intent: route.intent,
      intent_confidence: route.confidence,
      status: 'processed',
    }).eq('message_id', messageId);
  }

  return new Response(JSON.stringify({ received: true }), { headers: jsonHeaders });
});
