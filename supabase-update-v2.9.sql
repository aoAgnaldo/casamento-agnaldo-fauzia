-- V2.9 — Lista de presentes pública com fotografias + identificação da reserva do próprio convidado
-- Executar no Supabase SQL Editor.

drop function if exists public.list_gifts();
drop function if exists public.list_gifts(text);

create function public.list_gifts(p_invitation_code text default null)
returns table(
  id bigint,
  item_no integer,
  name text,
  reserved boolean,
  image_url text,
  reserved_by_me boolean
)
language sql
security definer
set search_path = public
as $$
  select
    g.id,
    g.item_no,
    g.name,
    coalesce(g.reserved,false),
    g.image_url,
    case
      when p_invitation_code is null or trim(p_invitation_code) = '' then false
      else exists (
        select 1
        from public.invitations i
        where i.id = g.reserved_by
          and lower(i.code) = lower(trim(p_invitation_code))
      )
    end
  from public.gifts g
  order by g.item_no;
$$;

grant execute on function public.list_gifts(text) to anon, authenticated;
