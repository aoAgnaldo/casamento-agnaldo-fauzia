-- V6.17 — Estado da equipa para o Protocolo Chefe
-- Executar no SQL Editor do Supabase depois das versões anteriores.

drop function if exists public.chief_reception_team(uuid);
create or replace function public.chief_reception_team(p_token uuid)
returns table(
  id uuid,
  full_name text,
  access_code text,
  active boolean,
  role text,
  online boolean,
  task_total bigint,
  task_done bigint
)
language sql
security definer
set search_path=public
as $$
  select
    p.id,
    p.full_name,
    p.access_code,
    p.active,
    p.role,
    (p.active and p.session_token is not null and p.session_expires_at > now()) as online,
    count(t.id) as task_total,
    count(t.id) filter (where t.completed) as task_done
  from public.protocols p
  left join public.protocol_tasks t on t.protocol_id=p.id
  where exists(
    select 1 from public.protocols c
    where c.id in (select id from public.protocol_identity(p_token))
      and c.role='chief'
  )
  group by p.id,p.full_name,p.access_code,p.active,p.role,p.session_token,p.session_expires_at
  order by case when p.role='chief' then 0 else 1 end, p.full_name;
$$;
grant execute on function public.chief_reception_team(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
