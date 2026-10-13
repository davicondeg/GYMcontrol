# Webhook do WhatsApp

Primeiro recorte funcional do bot do GYMcontrol:

- valida a assinatura enviada pela Meta;
- conecta uma conta por código temporário `GYM-000000`;
- registra mensagens uma única vez pelo identificador do WhatsApp;
- registra consumo de água;
- consulta o consumo de água do dia;
- responde em português pelo WhatsApp.

## Segredos necessários

Configure no Supabase antes de publicar a função:

- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`

A chave do Gemini será adicionada em uma etapa posterior. Nenhum segredo deve ser
incluído no aplicativo, nos arquivos versionados ou em variáveis `EXPO_PUBLIC_*`.
