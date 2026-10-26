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
- registra receitas do módulo Financeiro com valor, descrição, data e categoria;
- conduz o cadastro conversacional de recorrências financeiras, preservando o progresso por 24 horas e exigindo confirmação antes de salvar;
- reconhece mensagens do futuro módulo Agenda e despesas financeiras ainda não habilitadas sem registrar dados incorretos;
- conversa sobre assuntos gerais pelo Gemini quando a mensagem não exige dados do aplicativo;
- responde em português pelo WhatsApp.

## Segredos necessários

Configure no Supabase antes de publicar a função:

- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `GYMCONTROL_APP_URL` (endereço público e permanente do aplicativo)

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (opcional; usa `gemini-flash-lite-latest` por padrão)

Nenhum segredo deve ser incluído no aplicativo, nos arquivos versionados ou em
variáveis `EXPO_PUBLIC_*`.

## Organização dos módulos

- `router.ts`: classifica módulo, intenção e entidades da mensagem;
- `modules/gym.ts`: executa comandos pertencentes ao GymControl;
- `types.ts`: mantém o contrato comum entre o roteador e os módulos.

Agenda deve ganhar um arquivo próprio em `modules/` quando for implementada. O
Financeiro começa em `modules/finance.ts`, inicialmente com receitas. O Gemini poderá ser usado como fallback quando as regras locais
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

## Interpretação com Gemini

As regras determinísticas são avaliadas primeiro. Quando nenhuma regra reconhece
a mensagem, o Gemini classifica a solicitação dentro de uma lista fechada de
intenções. Se o assunto não exigir uma ação do aplicativo, ele produz uma
resposta curta de conversa geral. Comandos que consultam ou alteram registros
continuam limitados às intenções validadas pelo servidor. A chave nunca deve ser
incluída no cliente ou no Git.

As respostas do Gemini têm saída limitada e tempo máximo de doze segundos. Uma
segunda tentativa curta ocorre apenas quando o serviço informa sobrecarga.
Saudações e apresentações comuns são respondidas localmente, sem consumir a API.
