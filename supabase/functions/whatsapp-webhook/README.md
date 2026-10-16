# Webhook do WhatsApp

Núcleo inicial do assistente pessoal integrado. O webhook identifica o usuário,
classifica a mensagem e encaminha a operação ao módulo responsável.

- valida a assinatura enviada pela Meta;
- conecta uma conta por código temporário `GYM-000000`;
- registra mensagens uma única vez pelo identificador do WhatsApp;
- registra consumo de água;
- consulta o consumo de água do dia;
- registra, desmarca e consulta hábitos personalizados da aba Hoje;
- apresenta o resumo de hábitos concluídos e pendentes do dia;
- lista treinos e mostra quais foram concluídos no dia;
- marca, desmarca e consulta um treino pelo nome;
- envia o link permanente do GymControl quando configurado;
- reconhece mensagens dos futuros módulos Agenda e Financeiro sem registrar dados incorretos;
- responde em português pelo WhatsApp.

## Segredos necessários

Configure no Supabase antes de publicar a função:

- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `GYMCONTROL_APP_URL` (endereço público e permanente do aplicativo)

A chave do Gemini será adicionada em uma etapa posterior. Nenhum segredo deve ser
incluído no aplicativo, nos arquivos versionados ou em variáveis `EXPO_PUBLIC_*`.

## Organização dos módulos

- `router.ts`: classifica módulo, intenção e entidades da mensagem;
- `modules/gym.ts`: executa comandos pertencentes ao GymControl;
- `types.ts`: mantém o contrato comum entre o roteador e os módulos.

Agenda e Financeiro devem ganhar arquivos próprios em `modules/` quando forem
implementados. O Gemini poderá ser usado como fallback quando as regras locais
não classificarem a mensagem com confiança suficiente.

## Canal provisório pela Evolution API

O mesmo endpoint aceita eventos `MESSAGES_UPSERT` da Evolution API sem remover
o suporte futuro à Meta. A URL cadastrada na instância deve incluir o segredo:

```text
https://alfqaabmbteqsumkheob.supabase.co/functions/v1/whatsapp-webhook?secret=EVOLUTION_WEBHOOK_SECRET
```

Configure também `EVOLUTION_API_URL` com a URL HTTPS pública da Evolution e
`EVOLUTION_API_KEY` com a chave global usada pela instalação. O evento enviado
ao webhook deve ser `MESSAGES_UPSERT`.

Enquanto a Evolution estiver apenas na rede local, defina
`EVOLUTION_REPLY_ENABLED=false`. Nesse modo, as mensagens recebidas são
processadas e registradas, mas nenhuma resposta automática é enviada. Só ative
as respostas depois de disponibilizar uma rota HTTPS segura para a Evolution.
