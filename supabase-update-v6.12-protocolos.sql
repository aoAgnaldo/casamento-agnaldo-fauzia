-- V6.12 — Protocolos: correcção de PIN + edição de dados
-- Executar no Supabase SQL Editor. Não é necessário criar Secret Key.

create extension if not exists pgcrypto;

create or replace function public.admin_update_protocol(
  p_id uuid,
  p_full_name text,
  p_whatsapp text,
  p_access_code text,
  p_pin text default null
)
returns void
language plpgsql
security definer
set search_path=public,extensions
as $$
begin
  if not public.is_admin() then raise exception 'Não autorizado'; end if;
  if length(trim(coalesce(p_full_name,'')))=0 then raise exception 'Nome obrigatório'; end if;
  if length(trim(coalesce(p_access_code,'')))=0 then raise exception 'Código de acesso obrigatório'; end if;
  if length(trim(coalesce(p_pin,''))) > 0 and length(trim(p_pin)) < 4 then raise exception 'PIN deve ter pelo menos 4 dígitos'; end if;

  if exists (select 1 from public.protocols where upper(access_code)=upper(trim(p_access_code)) and id<>p_id) then
    raise exception 'Já existe um protocolo com este código de acesso';
  end if;

  if length(trim(coalesce(p_pin,''))) > 0 then
    update public.protocols
       set full_name=trim(p_full_name),
           whatsapp=nullif(trim(p_whatsapp),''),
           access_code=upper(trim(p_access_code)),
           pin_hash=crypt(trim(p_pin), gen_salt('bf')),
           session_token=null,
           session_expires_at=null
     where id=p_id;
  else
    update public.protocols
       set full_name=trim(p_full_name),
           whatsapp=nullif(trim(p_whatsapp),''),
           access_code=upper(trim(p_access_code))
     where id=p_id;
  end if;

  if not found then raise exception 'Protocolo não encontrado'; end if;
end $$;
grant execute on function public.admin_update_protocol(uuid,text,text,text,text) to authenticated;

-- Reforça a verificação do PIN e normaliza espaços/código.
drop function if exists public.verify_protocol(text,text);
create function public.verify_protocol(p_access_code text,p_pin text)
returns table(id uuid,full_name text,session_token uuid)
language plpgsql
security definer
set search_path=public,extensions
as $$
declare v_id uuid; v_name text; v_token uuid;
begin
  select p.id,p.full_name into v_id,v_name
    from public.protocols p
   where p.active=true
     and upper(trim(p.access_code))=upper(trim(coalesce(p_access_code,'')))
     and p.pin_hash=crypt(trim(coalesce(p_pin,'')),p.pin_hash)
   limit 1;
  if v_id is null then return; end if;
  v_token:=gen_random_uuid();
  update public.protocols set session_token=v_token,session_expires_at=now()+interval '12 hours' where id=v_id;
  return query select v_id,v_name,v_token;
end $$;
grant execute on function public.verify_protocol(text,text) to anon,authenticated;

notify pgrst, 'reload schema';
