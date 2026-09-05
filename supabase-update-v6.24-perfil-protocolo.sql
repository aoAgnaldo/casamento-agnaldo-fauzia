-- V6.24 — Perfil do operador da recepção
-- Permite a cada Protocolo guardar um nome de apresentação e fotografia.

alter table public.protocols
  add column if not exists display_name text,
  add column if not exists photo_url text;

create or replace function public.protocol_profile(p_token uuid)
returns table(id uuid,full_name text,display_name text,photo_url text,role text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select p.id,p.full_name,coalesce(nullif(trim(p.display_name),''),p.full_name),p.photo_url,p.role
  from public.protocols p
  where p.id in (select pi.id from public.protocol_identity(p_token) pi)
    and p.active = true
    and p.session_expires_at > now()
  limit 1;
end;
$$;

grant execute on function public.protocol_profile(uuid) to anon, authenticated;

create or replace function public.protocol_update_profile(
  p_token uuid,
  p_display_name text,
  p_photo_url text default null
)
returns table(id uuid,full_name text,display_name text,photo_url text,role text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_name text;
  v_photo text;
  v_role text;
begin
  select p.id,p.full_name,p.photo_url,p.role
    into v_id,v_name,v_photo,v_role
  from public.protocols p
  where p.id in (select pi.id from public.protocol_identity(p_token) pi)
    and p.active = true
    and p.session_expires_at > now()
  limit 1;

  if v_id is null then
    raise exception 'Sessão inválida ou expirada';
  end if;

  if nullif(trim(coalesce(p_display_name,'')),'') is null then
    raise exception 'Introduza um nome para apresentar';
  end if;

  if length(trim(p_display_name)) > 120 then
    raise exception 'O nome não pode ultrapassar 120 caracteres';
  end if;

  if p_photo_url is not null and length(p_photo_url) > 500000 then
    raise exception 'A fotografia é demasiado grande';
  end if;

  update public.protocols
  set display_name=trim(p_display_name),
      photo_url=case when p_photo_url is null then v_photo else p_photo_url end
  where id=v_id;

  return query
  select p.id,p.full_name,coalesce(nullif(trim(p.display_name),''),p.full_name),p.photo_url,p.role
  from public.protocols p
  where p.id=v_id;
end;
$$;

grant execute on function public.protocol_update_profile(uuid,text,text) to anon, authenticated;

notify pgrst, 'reload schema';
