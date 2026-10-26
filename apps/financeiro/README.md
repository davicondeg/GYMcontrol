# 💸 Gestor Financeiro

## 📌 Sobre o projeto

O Gestor Financeiro é uma aplicação web desenvolvida com o objetivo de ajudar o usuário a entender e organizar seus gastos, com foco principal no controle de despesas no crédito e no acompanhamento de faturas futuras. Diferente de sistemas tradicionais de controle financeiro, este projeto não tem como objetivo gerenciar saldo bancário ou simular pagamentos, mas sim oferecer clareza sobre os hábitos de consumo e compromissos financeiros já assumidos.

## 🎯 Objetivo

O sistema foi pensado para permitir que o usuário tenha uma visão clara sobre quanto está gastando, onde está gastando, quanto já comprometeu do seu futuro com compras parceladas e como essas decisões impactam os próximos meses. A ideia central é transformar dados financeiros em informação útil para tomada de decisão.

## 🧠 Conceito do sistema

O sistema é baseado em dois pilares principais. O primeiro é o fluxo financeiro atual, que considera as receitas e despesas imediatas, permitindo ao usuário entender sua movimentação no presente. O segundo pilar é o comprometimento futuro, que considera compras realizadas no crédito e suas respectivas parcelas, organizando essas informações em faturas distribuídas ao longo dos meses.

## ⚙️ Funcionalidades atuais

Atualmente, o sistema já permite o cadastro de transações, com separação entre receitas e despesas. O formulário de transação foi estruturado para diferenciar claramente esses dois tipos, evitando inconsistências de uso. Também já há suporte para despesas no crédito, incluindo seleção de cartão, definição de parcelas e estrutura inicial para organização de faturas futuras. O dashboard apresenta uma visão geral dos dados inseridos, permitindo acompanhamento básico dos gastos.

## 🚧 Em desenvolvimento

O projeto ainda está em evolução. Entre os próximos passos estão a implementação completa da lógica de parcelamento, geração automática de parcelas distribuídas ao longo dos meses, organização de faturas por período, criação de relatórios e gráficos mais avançados, cálculo de comprometimento financeiro futuro e melhorias na experiência do usuário.

## ⚠️ Requisito antes da finalização: onboarding inicial

Antes de considerar o aplicativo pronto para uso geral, deve ser implementado um
fluxo obrigatório de primeiro acesso. O usuário novo não deve chegar diretamente
ao dashboard sem concluir a configuração mínima necessária para que faturas,
transações e relatórios funcionem com dados coerentes.

Ordem proposta para o onboarding:

1. Apresentar brevemente como o Gestor Financeiro organiza gastos e faturas.
2. Exibir as categorias sugeridas de receitas e despesas.
3. Permitir aprovar, editar, excluir e criar categorias antes de continuar.
4. Solicitar o cadastro de pelo menos um cartão, incluindo nome, instituição,
   limite, fechamento e vencimento.
5. Oferecer o cadastro de uma conta de pagamento vinculada ao cartão quando
   aplicável.
6. Mostrar um resumo da configuração e pedir confirmação para entrar no app.

Critérios mínimos de conclusão:

- o usuário revisou e confirmou suas categorias;
- existe pelo menos uma categoria ativa de receita e uma de despesa;
- existe pelo menos um cartão cadastrado;
- o sistema salvou a conclusão do onboarding por usuário;
- acessos posteriores abrem o dashboard, com opção de rever a configuração;
- se o processo for interrompido, ele retorna ao último passo concluído.

Este fluxo é requisito de lançamento e deve ser implementado antes dos ajustes
finais e da publicação geral do aplicativo.

## 🧩 Decisões de arquitetura

Algumas decisões importantes foram tomadas durante o desenvolvimento para manter o sistema simples e focado. O sistema não controla saldo bancário real, não simula pagamento de faturas e não utiliza contas bancárias como entidade principal. O foco está totalmente no controle de gastos, especialmente no crédito. Receitas são tratadas como entradas genéricas de dinheiro, e há uma separação clara entre o que impacta o presente e o que representa compromissos futuros.

## Situação no monorepo

Esta aplicação foi importada para `apps/financeiro` como base visual e funcional.
Ela permanece independente do GymControl. A autenticação e os dados serão
migrados para o projeto Supabase compartilhado por meio das tabelas com prefixo
`finance_` e políticas de acesso por usuário.

O login, as categorias e as contas já utilizam o mesmo projeto Supabase do
GymControl, mantendo os registros separados por usuário. Transações, cartões,
faturas e relatórios ainda serão migrados incrementalmente.

## 🖥️ Tecnologias utilizadas

O projeto é desenvolvido utilizando HTML, CSS e JavaScript. Futuramente será integrado com Supabase para persistência de dados e evolução do sistema.

## 🚀 Como rodar o projeto

Na raiz do monorepo, execute `npm run finance:web`. O comando sincroniza as
credenciais públicas do Supabase em um arquivo local ignorado pelo Git e inicia
o Gestor Financeiro somente neste computador, em `http://127.0.0.1:4175`.

O fluxo oficial de publicação do repositório gera apenas o GymControl. O Gestor
Financeiro não é incluído no artefato do GitHub Pages.

## 📈 Próximos passos

Entre as próximas evoluções do sistema estão a melhoria do dashboard, criação de relatórios mais completos, integração com banco de dados, refinamento da lógica de faturas e aprimoramento geral da experiência do usuário.

## 💡 Inspiração

O projeto se inspira em aplicações como Mobills e Organizze, especialmente no que diz respeito à organização de gastos e visualização de faturas, mas busca uma abordagem mais simples e direta, focada na clareza das informações.

## 👨‍💻 Autor

Projeto desenvolvido com foco em aprendizado prático, evolução em desenvolvimento web e construção de um sistema com valor real.
