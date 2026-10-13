# Configuração do Supabase

## 1. Criar o esquema

Abra o **SQL Editor** do projeto Supabase, copie o conteúdo de
`migrations/20261013170000_initial_schema.sql` e execute uma única vez.

## 2. Ativar usuários anônimos

No painel do Supabase, abra **Authentication > Providers > Anonymous** e habilite
o acesso anônimo. Cada instalação receberá um usuário próprio, e as políticas RLS
impedirão que uma pessoa leia ou altere os dados de outra.

## 3. Próxima etapa

Depois de aplicar o esquema, valide a sessão anônima e migre os dados locais para
as tabelas remotas. O SQLite e o IndexedDB devem ser mantidos durante essa fase
para permitir uma transição sem perda de dados.
