-- V6.20 — Detalhe dos convidados por mesa para o Protocolo Chefe
-- Executar no SQL Editor do Supabase depois da V6.19.

drop function if exists public.chief_table_guests(uuid,bigint);
create or replace function public.chief_table_guests(p_token uuid, p_table_id bigint)
returns table(
  id uuid, code text, full_name text, whatsapp text, allowed_guests integer,
  rsvp_status text, companion_count integer, checked_in boolean, checked_in_at timestamptz
)
language sql
security definer
set search_path=public
as $$
  select i.id,i.code,i.full_name,i.whatsapp,i.allowed_guests,i.rsvp_status,i.companion_count,i.checked_in,i.checked_in_at
  from public.invitations i
  where i.table_id=p_table_id
    and exists(
      select 1 from public.protocols c
      where c.id in (select id from public.protocol_identity(p_token))
        and c.role='chief'
    )
  order by i.checked_in desc, i.full_name;
$$;

grant execute on function public.chief_table_guests(uuid,bigint) to anon, authenticated;
notify pgrst, 'reload schema';
