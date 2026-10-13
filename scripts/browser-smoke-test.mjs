const endpoint = process.argv[2] ?? 'http://127.0.0.1:9333';
const targetUrl = process.argv[3] ?? 'http://localhost:8081';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

let targets;
for (let attempt = 0; attempt < 20; attempt += 1) {
  try {
    targets = await fetch(`${endpoint}/json/list`).then((response) => response.json());
    break;
  } catch {
    await delay(500);
  }
}

if (!targets) throw new Error('Não foi possível conectar ao navegador de teste.');

const target = targets.find((item) => item.type === 'page');
if (!target) throw new Error('Nenhuma página disponível no navegador de teste.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') {
    const details = message.params.exceptionDetails;
    exceptions.push(details.exception?.description ?? details.text);
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(
      message.params.args.map((argument) => argument.value ?? argument.description).join(' '),
    );
  }
});

function command(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await command('Runtime.enable');
await command('Page.enable');
await command('Page.navigate', { url: targetUrl });
await delay(30000);

const evaluation = await command('Runtime.evaluate', {
  expression: `JSON.stringify({
    url: location.href,
    text: document.body.innerText.slice(0, 1200),
    readyState: document.readyState,
    rootHtmlLength: document.querySelector('#root')?.innerHTML.length ?? 0,
    migrationKeys: Object.keys(localStorage).filter((key) => key.includes('supabase-migration')),
    hasSupabaseSession: Object.keys(localStorage).some((key) => key.startsWith('sb-') && key.endsWith('-auth-token'))
  })`,
  returnByValue: true,
});

const result = JSON.parse(evaluation.result.value);
console.log(JSON.stringify({ ...result, exceptions, consoleErrors }, null, 2));
socket.close();

if (
  exceptions.length > 0 ||
  consoleErrors.length > 0 ||
  result.text.includes('Não foi possível conectar ao banco')
) {
  process.exitCode = 1;
}
