import fs from 'node:fs';
import path from 'node:path';

function readEnvironment(filePath) {
  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
}

const rootEnvironment = readEnvironment(path.resolve('.env'));
const evolutionEnvironment = readEnvironment(path.resolve('infra/evolution/.env'));
const supabaseUrl = rootEnvironment.EXPO_PUBLIC_SUPABASE_URL;
const relaySecret = evolutionEnvironment.EVOLUTION_RELAY_SECRET;
const evolutionApiKey = evolutionEnvironment.AUTHENTICATION_API_KEY;
const evolutionUrl = evolutionEnvironment.SERVER_URL || 'http://127.0.0.1:8080';

if (!supabaseUrl || !relaySecret || !evolutionApiKey) {
  throw new Error('Configure SUPABASE URL, EVOLUTION_RELAY_SECRET e AUTHENTICATION_API_KEY antes de iniciar o relay.');
}

const relayUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/bot-relay`;
let running = true;

process.on('SIGINT', () => {
  running = false;
  console.log('\nEncerrando o relay do Jhonny...');
});

async function acknowledge(id, success, error) {
  const response = await fetch(relayUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-relay-secret': relaySecret },
    body: JSON.stringify({ id, success, error }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Falha ao confirmar o envio: HTTP ${response.status}`);
}

async function poll() {
  const response = await fetch(relayUrl, {
    headers: { 'x-relay-secret': relaySecret },
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 204) return false;
  if (!response.ok) throw new Error(`Falha ao consultar a fila: HTTP ${response.status}`);

  const job = await response.json();
  try {
    const sendResponse = await fetch(`${evolutionUrl.replace(/\/$/, '')}/message/sendText/${encodeURIComponent(job.instance_name)}`, {
      method: 'POST',
      headers: { apikey: evolutionApiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ number: job.recipient, text: job.message_text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!sendResponse.ok) throw new Error(`Evolution respondeu HTTP ${sendResponse.status}`);
    await acknowledge(job.id, true);
    console.log(`Resposta ${job.id} enviada com sucesso.`);
  } catch (error) {
    await acknowledge(job.id, false, error instanceof Error ? error.message : String(error));
    console.error(`Não foi possível enviar a resposta ${job.id}.`);
  }
  return true;
}

console.log('Relay do Jhonny iniciado. Use Ctrl+C para encerrar.');
while (running) {
  try {
    const delivered = await poll();
    if (!delivered) await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
