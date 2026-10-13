import { createClient } from 'npm:@supabase/supabase-js@2';

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

async function sendText(to: string, text: string) {
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

function parseWaterAmount(text: string) {
  const normalized = text.toLowerCase().replace(',', '.');
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(ml|mililitros?|l|litros?)/i);
  if (!match || !/(bebi|tomei|água|agua|adicion)/i.test(normalized)) return null;
  const value = Number(match[1]);
  return Math.round(match[2].toLowerCase().startsWith('l') ? value * 1000 : value);
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
  if (!await verifySignature(request, rawBody)) return new Response('Invalid signature', { status: 401 });

  const payload = JSON.parse(rawBody);
  const messages = payload?.entry?.flatMap((entry: any) =>
    entry.changes?.flatMap((change: any) => change.value?.messages ?? []) ?? []) ?? [];
  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  for (const message of messages) {
    if (message.type !== 'text') continue;
    const messageId = String(message.id);
    const waId = String(message.from);
    const text = String(message.text?.body ?? '').trim();
    const { error: duplicateError } = await admin.from('bot_messages').insert({
      message_id: messageId, wa_id: waId, direction: 'incoming', message_text: text,
    });
    if (duplicateError?.code === '23505') continue;
    if (duplicateError) throw duplicateError;

    const linkCode = text.match(/^GYM-\d{6}$/i)?.[0];
    if (linkCode) {
      const { data: userId } = await admin.rpc('bot_link_whatsapp', { p_code: linkCode, p_wa_id: waId });
      await sendText(waId, userId ? 'WhatsApp conectado à sua conta GYMcontrol.' : 'Código inválido ou expirado. Gere um novo código no aplicativo.');
      continue;
    }

    const { data: connection } = await admin.from('whatsapp_connections').select('user_id').eq('wa_id', waId).maybeSingle();
    if (!connection) {
      await sendText(waId, 'Conecte seu WhatsApp pelo aplicativo GYMcontrol antes de usar o bot.');
      continue;
    }

    const date = localDate();
    const amount = parseWaterAmount(text);
    if (amount) {
      const { data: total, error } = await admin.rpc('bot_add_water', { p_user_id: connection.user_id, p_date: date, p_amount: amount });
      if (error) throw error;
      await admin.from('bot_actions').insert({ message_id: messageId, user_id: connection.user_id, action: 'add_water', status: 'completed', input: { amount_ml: amount }, result: { total_ml: total } });
      await sendText(waId, `Registrei ${amount} ml. Seu total de hoje é ${total} ml.`);
    } else if (/quanto.*(água|agua)|total.*(água|agua)/i.test(text)) {
      const { data } = await admin.from('daily_tracking').select('water_ml').eq('user_id', connection.user_id).eq('date', date).maybeSingle();
      const total = data?.water_ml ?? 0;
      await admin.from('bot_actions').insert({ message_id: messageId, user_id: connection.user_id, action: 'query_water', status: 'completed', result: { total_ml: total } });
      await sendText(waId, `Você registrou ${total} ml de água hoje.`);
    } else {
      await sendText(waId, 'Ainda estou aprendendo. Por enquanto, posso registrar ou consultar sua água de hoje.');
    }

    await admin.from('bot_messages').update({ user_id: connection.user_id, status: 'processed' }).eq('message_id', messageId);
  }

  return new Response(JSON.stringify({ received: true }), { headers: jsonHeaders });
});
