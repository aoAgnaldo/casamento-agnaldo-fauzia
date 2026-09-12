// Ligação pública ao Supabase.
// A Publishable Key pode estar no navegador quando o RLS está correctamente configurado.
const SUPABASE_URL = 'https://cyizyzzmitfjrdxsczyo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3rp3p356f7dZhL7oIJR14w_IhXFZV-q';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Mantém a ligação disponível para todos os módulos do painel, incluindo o editor do convite.
window.supabaseClient = supabaseClient;

// Endereço público usado nos QR Codes e nas mensagens de convite.
// Altere apenas esta linha se o convite for publicado noutro endereço.
window.WEDDING_PUBLIC_INVITE_URL = window.WEDDING_PUBLIC_INVITE_URL || 'https://aoagnaldo.github.io/casamento-agnaldo-fauzia/index.html';
