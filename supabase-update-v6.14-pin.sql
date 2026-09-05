-- V6.14 — Correcção definitiva do login dos Protocolos
-- Executar DEPOIS da V6.13.
-- Esta versão mantém os PINs bcrypt, mas também permite migrar protocolos
-- antigos que eventualmente tenham um PIN guardado em texto simples.
-- Depois da execução, recarregar o schema do PostgREST.

create extension if not exists pgcrypto;

drop function if exists public.verify_protocol(text,text);

create or replace function public.verify_protocol(p_access_code text,p_pin text)
returns table(id uuid,full_name text,session_token uuid,role text)
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  v_id uuid;
  v_name text;
  v_role text;
  v_token uuid;
  v_pin text := trim(coalesce(p_pin,''));
  v_hash text;
begin
  if length(v_pin)=0 or length(trim(coalesce(p_access_code,'')))=0 then
    return;
  end if;

  select p.id,p.full_name,p.role,p.pin_hash
    into v_id,v_name,v_role,v_hash
  from public.protocols p
  where p.active=true
    and upper(trim(p.access_code))=upper(trim(coalesce(p_access_code,'')))
    and (
      -- PINs criados correctamente com pgcrypto/bcrypt
      (v_hash is not null and v_hash like '$2%' and crypt(v_pin,v_hash)=v_hash)
      -- Compatibilidade com algum protocolo antigo que tenha PIN em texto simples.
      -- Quando entrar correctamente, o PIN é imediatamente convertido para bcrypt.
      or
      (v_hash is not null and v_hash not like '$2%' and v_hash=v_pin)
    )
  limit 1;

  if v_id is null then
    return;
  end if;

  -- Migração automática de PIN legado para bcrypt.
  if v_hash not like '$2%' then
    update public.protocols
       set pin_hash=crypt(v_pin,gen_salt('bf'))
     where id=v_id;
  end if;

  v_token:=gen_random_uuid();

  update public.protocols
     set session_token=v_token,
         session_expires_at=now()+interval '12 hours'
   where id=v_id;

  return query
  select v_id,v_name,v_token,v_role;
end;
$$;

grant execute on function public.verify_protocol(text,text) to anon,authenticated;

-- Função administrativa explícita para redefinir um PIN.
-- Pode ser usada pelo painel Admin sem expor o PIN.
drop function if exists public.admin_reset_protocol_pin(uuid,text);

create or replace function public.admin_reset_protocol_pin(p_id uuid,p_pin text)
returns void
language plpgsql
security definer
set search_path=public,extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'Não autorizado';
  end if;

  if length(trim(coalesce(p_pin,''))) < 4 then
    raise exception 'PIN deve ter pelo menos 4 dígitos';
  end if;

  update public.protocols
     set pin_hash=crypt(trim(p_pin),gen_salt('bf')),
         session_token=null,
         session_expires_at=null
   where id=p_id;

  if not found then
    raise exception 'Protocolo não encontrado';
  end if;
end;
$$;

grant execute on function public.admin_reset_protocol_pin(uuid,text) to authenticated;

notify pgrst, 'reload schema';
