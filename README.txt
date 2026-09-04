# Casamento Agnaldo & Fáuzia

## 1. Supabase
Execute `supabase-update.sql` no SQL Editor.
Depois crie um utilizador em Authentication > Users e associe-o:
`insert into public.admin_users(user_id) select id from auth.users where email='SEU_EMAIL';`

## 2. Site
- `index.html` é o convite público.
- `admin.html` é o painel privado.
- `supabase-config.js` contém apenas a Publishable Key.

## 3. GitHub Pages
Envie estes ficheiros para um repositório e active Settings > Pages > Deploy from branch.

## 4. WhatsApp
O painel gera uma mensagem personalizada e abre o WhatsApp. O envio automático pela API oficial exige configuração adicional no Meta/WhatsApp e deve ser feito no servidor/Edge Function, nunca expondo tokens no navegador.

ATUALIZAÇÃO — GESTÃO DE CONVIDADOS
1. Execute guest-admin.sql no SQL Editor do Supabase.
2. Abra admin.html e entre com a conta de administrador.
3. Pode adicionar, editar e remover convidados.
4. O código é gerado no formato AF-XXXXXX e há tentativas automáticas se houver colisão.
