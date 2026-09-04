// Ligação pública ao Supabase.
// A Publishable Key pode estar no navegador quando o RLS está correctamente configurado.
const SUPABASE_URL = 'https://cyizyzzmitfjrdxsczyo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3rp3p356f7dZhL7oIJR14w_IhXFZV-q';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
