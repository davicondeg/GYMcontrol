# Evolution API local do Jhonny

Ambiente provisório para conectar um número secundário do WhatsApp ao núcleo do
Jhonny. Esta integração usa WhatsApp Web e não é uma API oficial da Meta.

## Pré-requisitos

- Docker Desktop aberto;
- um número secundário com WhatsApp;
- um túnel HTTPS apontando para `http://localhost:8080`.

## Preparação

1. Copie `.env.example` para `.env`.
2. Gere valores longos e diferentes para `AUTHENTICATION_API_KEY` e
   `POSTGRES_PASSWORD`.
3. Repita a senha do Postgres dentro de `DATABASE_CONNECTION_URI`.
4. Inicie os serviços:

   ```powershell
   docker compose up -d
   ```

5. Abra `http://localhost:8080` e confirme que a API responde.

Não versione o arquivo `.env`, o QR Code ou os dados de sessão. Os volumes do
Docker preservam a conexão local entre reinicializações.

## Integração com o Supabase

A instância deverá enviar o evento `MESSAGES_UPSERT` para:

```text
https://alfqaabmbteqsumkheob.supabase.co/functions/v1/whatsapp-webhook?secret=SEU_SEGREDO
```

O Supabase precisará dos segredos `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e
`EVOLUTION_WEBHOOK_SECRET`. `EVOLUTION_API_URL` será a URL HTTPS do túnel, não
`localhost`, porque a Edge Function roda fora deste computador.

Use apenas um número secundário. A sessão pode desconectar e o WhatsApp pode
limitar ou bloquear números conectados por automações não oficiais.
