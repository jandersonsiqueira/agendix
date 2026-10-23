# Agendix

Plataforma SaaS multiempresa de agendamentos, construída com **Next.js 16 + React 19 + TypeScript + Supabase**. A base técnica toma o Sistema Pastorais como referência, mas o código e as regras de negócio são próprios.

## Primeira entrega

- Cadastro e login **únicos** por pessoa (e-mail/senha e Google).
- Confirmação de e-mail, recuperação e alteração de senha.
- Conta sem empresa: estado vazio com opção de criar estabelecimento ou aguardar convite.
- Criação de estabelecimentos e associação automática do criador como `owner`.
- Convites seguros vinculados ao e-mail e válidos por 7 dias, com compartilhamento manual do link.
- Perfis `owner`, `admin`, `receptionist`, `professional`, associados à empresa (não ao usuário global).
- Usuário em **uma** empresa: acesso direto sem seletor. Em **várias**: alternância na barra lateral, recarregando o contexto.
- Gestão básica da equipe, incluindo alteração de papéis e remoção (somente proprietário).
- PWA instalável, interface responsiva e barra lateral expansível.
- Políticas de isolamento por empresa (RLS), operações sensíveis por RPC transacional no banco.

> A agenda, o financeiro e o cadastro de serviços ainda não foram implementados. Os indicadores no dashboard são apenas espaços reservados, **não dados simulados**.

## Pré-requisitos

Node.js 24 recomendado, Supabase CLI e um projeto Supabase próprio.

```bash
npm install
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` no `.env.local`.

## Banco de dados

As migrations versionadas estão em `supabase/migrations`. Com Supabase CLI autenticada e projeto vinculado:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npm run db:push
```

Para desenvolvimento local com Docker e Supabase CLI:

```bash
npx supabase start
npx supabase db reset
```

**Não execute `db reset` no projeto de produção.** A migration cria tabelas, RLS e funções seguras, sem precisar de `service_role` no navegador ou no servidor Next.js.

## Configuração de autenticação no Supabase

Em **Authentication → URL Configuration**:

- Site URL: `http://localhost:3000` no desenvolvimento.
- Redirect URLs: `http://localhost:3000/auth/callback` e a URL equivalente de produção, por exemplo `https://seu-dominio.com/auth/callback`.
- Mantenha a confirmação de e-mail ativada para novos cadastros.

Em **Authentication → Providers → Google**, habilite Google e configure Client ID/Secret do Google Cloud. No Google Cloud, o redirect URI OAuth deve apontar para o callback fornecido pelo **Supabase** (`https://SEU-PROJETO.supabase.co/auth/v1/callback`). O redirecionamento do aplicativo continua sendo `/auth/callback`.

Para testes de convite, use duas contas com e-mails confirmados. A primeira cria o estabelecimento, abre **Equipe**, gera e compartilha o link com o e-mail convidado. A segunda entra com sua própria conta e aceita o convite. O e-mail precisa coincidir exatamente com o convite.

## Executar

```bash
npm run dev
npm run typecheck
npm test
npm run build
```

## Segurança

- A sessão é validada com `auth.getUser()` no servidor.
- Toda seleção de estabelecimento é verificada contra os vínculos ativos do usuário; a cookie de contexto **não** concede acesso ao banco.
- Acesso a empresas e membros é filtrado por RLS; funções de escrita validam permissões internamente.
- Tokens de convite são aleatórios (256 bits), armazenados apenas como hash SHA-256 e utilizados uma única vez.
- Não copie segredos do Sistema Pastorais ou inclua `.env.local` no Git.
- Antes de publicar, configure SMTP transacional, proteção contra abuso e política de retenção dos convites.

## Próximas etapas

Serviços, profissionais de agenda (distintos de contas de acesso), horários, agendamentos, notificações, planos e faturamento.
