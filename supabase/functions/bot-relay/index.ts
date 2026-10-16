import { createClient } from 'npm:@supabase/supabase-js@2';

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8' };

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing secret: ${name}`);
  return value;
}

function authorized(request: Request) {
  const provided = request.headers.get('x-relay-secret') ?? '';
  const expected = env('EVOLUTION_RELAY_SECRET');
  return provided.length === expected.length && provided === expected;
}

Deno.serve(async (request: Request) => {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 });
  const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  if (request.method === 'GET') {
    const { data: jobs, error: readError } = await admin
      .from('bot_outbox')
      .select('id,instance_name,recipient,message_text,attempts')
      .in('status', ['queued', 'failed'])
      .lte('available_at', new Date().toISOString())
      .lt('attempts', 5)
      .order('created_at')
      .limit(1);
    if (readError) throw readError;
    const job = jobs?.[0];
    if (!job) return new Response(null, { status: 204 });

    const { data: claimed, error: claimError } = await admin
      .from('bot_outbox')
      .update({ status: 'sending', attempts: job.attempts + 1, updated_at: new Date().toISOString() })
      .eq('id', job.id)
      .in('status', ['queued', 'failed'])
      .select('id,instance_name,recipient,message_text')
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return new Response(null, { status: 204 });
    return new Response(JSON.stringify(claimed), { headers: jsonHeaders });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isSafeInteger(id) || id <= 0) return new Response('Invalid job id', { status: 400 });

    if (body?.success === true) {
      const sentAt = new Date().toISOString();
      const { data: job, error: updateError } = await admin
        .from('bot_outbox')
        .update({ status: 'sent', sent_at: sentAt, updated_at: sentAt, last_error: null })
        .eq('id', id)
        .eq('status', 'sending')
        .select('recipient,message_text')
        .maybeSingle();
      if (updateError) throw updateError;

      if (job) {
        const { data: connection } = await admin
          .from('whatsapp_connections')
          .select('user_id')
          .eq('wa_id', job.recipient)
          .maybeSingle();
        await admin.from('bot_messages').upsert({
          message_id: `outbox:${id}`,
          user_id: connection?.user_id ?? null,
          wa_id: job.recipient,
          direction: 'outgoing',
          message_text: job.message_text,
          status: 'sent',
          metadata: { provider: 'evolution' },
        }, { onConflict: 'message_id' });
      }
    } else {
      const retryAt = new Date(Date.now() + 10_000).toISOString();
      const errorMessage = String(body?.error ?? 'Falha desconhecida').slice(0, 500);
      const { error: updateError } = await admin
        .from('bot_outbox')
        .update({ status: 'failed', available_at: retryAt, updated_at: new Date().toISOString(), last_error: errorMessage })
        .eq('id', id)
        .eq('status', 'sending');
      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ acknowledged: true }), { headers: jsonHeaders });
  }

  return new Response('Method not allowed', { status: 405 });
});
