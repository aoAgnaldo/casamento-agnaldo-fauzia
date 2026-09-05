import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Método não permitido.' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) throw new Error('Sessão de administrador não encontrada.')
    const token = authHeader.slice(7)

    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY não está configurada na função.')

    const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: callerData, error: callerError } = await adminClient.auth.getUser(token)
    if (callerError || !callerData.user) throw new Error('Sessão inválida ou expirada.')

    const { data: adminRow, error: adminError } = await adminClient
      .from('admin_users').select('user_id').eq('user_id', callerData.user.id).maybeSingle()
    if (adminError || !adminRow) throw new Error('Não autorizado.')

    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const displayName = String(body.display_name || '').trim()
    if (!email || !email.includes('@')) throw new Error('Introduza um email válido.')
    if (password.length < 6) throw new Error('A palavra-passe deve ter pelo menos 6 caracteres.')
    if (!displayName) throw new Error('Introduza o nome a apresentar.')

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    })
    if (createError || !created.user) throw new Error(createError?.message || 'Não foi possível criar o utilizador.')

    const newUserId = created.user.id
    const { error: insertAdminError } = await adminClient.from('admin_users').insert({ user_id: newUserId })
    if (insertAdminError) {
      await adminClient.auth.admin.deleteUser(newUserId)
      throw new Error(insertAdminError.message)
    }

    const { error: profileError } = await adminClient.from('admin_profiles').upsert({
      user_id: newUserId,
      display_name: displayName,
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    if (profileError) {
      await adminClient.from('admin_users').delete().eq('user_id', newUserId)
      await adminClient.auth.admin.deleteUser(newUserId)
      throw new Error(profileError.message)
    }

    return new Response(JSON.stringify({ ok: true, user_id: newUserId, email, display_name: displayName }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
