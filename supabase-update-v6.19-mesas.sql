-- V6.19 — Planta e controlo das mesas para o Protocolo Chefe
-- Executar no SQL Editor do Supabase depois da V6.17.

drop function if exists public.chief_reception_tables(uuid);
create or replace function public.chief_reception_tables(p_token uuid)
returns table(
  id bigint,
  name text,
  capacity integer,
  description text,
  invited_people bigint,
  arrived_people bigint,
  invited_groups bigint,
  arrived_groups bigint,
  guest_names text
)
language sql
security definer
set search_path=public
as $$
  select
    t.id, t.name, t.capacity, t.description,
    coalesce(sum(1 + coalesce(i.companion_count,0)),0)::bigint as invited_people,
    coalesce(sum(case when i.checked_in then 1 + coalesce(i.companion_count,0) else 0 end),0)::bigint as arrived_people,
    count(i.id)::bigint as invited_groups,
    count(i.id) filter (where i.checked_in)::bigint as arrived_groups,
    coalesce(string_agg(i.full_name, ', ' order by i.full_name) filter (where i.id is not null),'') as guest_names
  from public.reception_tables t
  left join public.invitations i on i.table_id=t.id
  where exists(
    select 1 from public.protocols c
    where c.id in (select id from public.protocol_identity(p_token))
      and c.role='chief'
  )
  group by t.id,t.name,t.capacity,t.description
  order by t.name;
$$;
grant execute on function public.chief_reception_tables(uuid) to anon, authenticated;
notify pgrst, 'reload schema';
