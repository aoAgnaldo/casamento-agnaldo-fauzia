V6.7 — PERFIS E MÚLTIPLOS ADMINISTRADORES

1) Executar no Supabase SQL Editor:
   supabase-update-v6.7-admins.sql

2) Deploy da Edge Function:
   Pasta: supabase/functions/create-admin
   Com a Supabase CLI:
     supabase functions deploy create-admin

   A função precisa de SUPABASE_SERVICE_ROLE_KEY como secret.
   Nunca colocar essa chave no HTML/JS.
   Se a variável ainda não existir:
     supabase secrets set SUPABASE_SERVICE_ROLE_KEY="A_TUA_SERVICE_ROLE_KEY"

3) Depois de executar o SQL e fazer o deploy, abrir o Admin.
   No botão ☰ do cabeçalho existem:
   - Minha conta: altera o nome e a fotografia do administrador actual.
   - Administradores: cria novas contas de administrador com nome, email e palavra-passe.

4) O novo administrador recebe uma conta real do Supabase Auth, com email confirmado, e é colocado em public.admin_users. Pode entrar em admin.html com o email e a palavra-passe definidos.

5) Cada administrador tem o seu próprio nome e fotografia. Ao entrar, o cabeçalho mostra os dados da conta autenticada.

6) A chave Publishable continua no site. A Service Role Key só fica na Edge Function.
