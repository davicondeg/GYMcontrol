import fs from 'node:fs';

const endpoint = process.argv[2] ?? 'http://127.0.0.1:9333';
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`${endpoint}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === 'page');

if (!target) throw new Error('Nenhuma página disponível no navegador de teste.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function command(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.result.value;
}

await command('Runtime.enable');
await command('Page.enable');

const readWater = `(() => {
  const lines = document.body.innerText.split('\\n');
  const goalLine = lines.findIndex((line) => line.includes('/ 3.000 ml'));
  return Number(lines[goalLine - 1].replaceAll('.', ''));
})()`;

const valueBeforeClick = await evaluate(readWater);

const clicked = await evaluate(`(() => {
  const button = [...document.querySelectorAll('[role="button"]')]
    .find((element) => element.textContent.includes('+500 ml'));
  button?.click();
  return Boolean(button);
})()`);

await delay(4000);
const valueBeforeReload = await evaluate(readWater);

await command('Page.reload', { ignoreCache: true });
await delay(12000);
const valueAfterReload = await evaluate(readWater);
const auth = await evaluate(`(() => {
  const key = Object.keys(localStorage).find((item) => item.startsWith('sb-') && item.endsWith('-auth-token'));
  return key ? JSON.parse(localStorage.getItem(key)) : null;
})()`);
const date = await evaluate(`(() => {
  const value = new Date();
  return [value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'), String(value.getDate()).padStart(2, '0')].join('-');
})()`);

const environment = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1).trim()];
  }),
);
await evaluate(`fetch(
  ${JSON.stringify(`${environment.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/daily_tracking?date=eq.${date}`)},
  {
    method: 'PATCH',
    headers: {
      apikey: ${JSON.stringify(environment.EXPO_PUBLIC_SUPABASE_ANON_KEY)},
      Authorization: ${JSON.stringify(`Bearer ${auth.access_token}`)},
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ water_ml: 0, updated_at: new Date().toISOString() })
  }
).then((response) => response.ok)`);

console.log(JSON.stringify({ clicked, valueBeforeClick, valueBeforeReload, valueAfterReload }, null, 2));
socket.close();

if (
  !clicked ||
  valueBeforeReload !== valueBeforeClick + 500 ||
  valueAfterReload !== valueBeforeReload
) {
  process.exitCode = 1;
}
