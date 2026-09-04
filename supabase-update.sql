-- ============================================================
-- ACTUALIZAÇÃO DO SISTEMA DO CASAMENTO — AGNALDO & FÁUZIA
-- Execute no SQL Editor do Supabase.
-- ============================================================

-- 1) Coluna code é usada pelo convidado como código do convite.
--    Mantém as tabelas que já criámos.

-- 2) Função pública de pesquisa: devolve apenas os dados necessários.
create or replace function public.find_invitation(search_key text)
returns table(id uuid, code text, full_name text, allowed_guests integer)
language sql
security definer
set search_path = public
as $$
  select i.id, i.code, i.full_name, i.allowed_guests
  from public.invitations i
  where lower(i.code) = lower(trim(search_key))
     or lower(i.full_name) = lower(trim(search_key))
  order by i.created_at
  limit 2;
$$;
grant execute on function public.find_invitation(text) to anon, authenticated;

-- 3) Guardar RSVP pelo CÓDIGO, em vez de confiar num UUID enviado pelo navegador.
create or replace function public.save_rsvp(
  invitation_code text,
  attending boolean,
  companion_count integer,
  note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_allowed integer;
begin
  select allowed_guests into v_allowed
  from public.invitations
  where lower(code)=lower(trim(invitation_code))
  for update;

  if not found then raise exception 'Convite não encontrado'; end if;
  if companion_count < 0 or companion_count > greatest(v_allowed-1,0) then
    raise exception 'Número de acompanhantes inválido';
  end if;

  update public.invitations
  set rsvp_status=case when attending then 'confirmed' else 'declined' end,
      companion_count=case when attending then companion_count else 0 end,
      rsvp_note=left(coalesce(note,''),500),
      rsvp_at=now()
  where lower(code)=lower(trim(invitation_code));
end;
$$;
grant execute on function public.save_rsvp(text,boolean,integer,text) to anon, authenticated;

-- 4) Presentes: listagem pública e reserva atómica.
create or replace function public.list_gifts()
returns table(id bigint,item_no integer,name text,reserved boolean)
language sql
security definer
set search_path = public
as $$
 select id,item_no,name,reserved from public.gifts order by item_no;
$$;
grant execute on function public.list_gifts() to anon, authenticated;

create or replace function public.reserve_gift(gift_id bigint, invitation_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_inv uuid; v_reserved boolean;
begin
  select id into v_inv from public.invitations where lower(code)=lower(trim(invitation_code));
  if not found then raise exception 'Convite não encontrado'; end if;

  update public.gifts
  set reserved=true,reserved_by=v_inv,reserved_at=now()
  where id=gift_id and coalesce(reserved,false)=false;

  if not found then raise exception 'Este presente já está reservado'; end if;
end;
$$;
grant execute on function public.reserve_gift(bigint,text) to anon, authenticated;

-- 5) Área administrativa.
create table if not exists public.admin_users(
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.admin_users enable row level security;

-- Apenas o próprio utilizador autenticado consegue verificar o seu registo.
drop policy if exists "admin self read" on public.admin_users;
create policy "admin self read" on public.admin_users
for select to authenticated using (user_id=auth.uid());

-- Função para saber se o utilizador actual é administrador.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
 select exists(select 1 from public.admin_users where user_id=auth.uid());
$$;

-- RPCs administrativas (sem acesso directo às tabelas pelo navegador).
create or replace function public.admin_list_invitations()
returns table(id uuid,code text,full_name text,whatsapp text,allowed_guests integer,rsvp_status text,companion_count integer,rsvp_note text,rsvp_at timestamptz,invitation_sent_at timestamptz,created_at timestamptz)
language sql security definer set search_path=public as $$
 select i.id,i.code,i.full_name,i.whatsapp,i.allowed_guests,i.rsvp_status,i.companion_count,i.rsvp_note,i.rsvp_at,i.invitation_sent_at,i.created_at
 from public.invitations i where public.is_admin() order by i.created_at desc;
$$;

create or replace function public.admin_create_invitation(p_code text,p_full_name text,p_whatsapp text,p_allowed_guests integer)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.is_admin() then raise exception 'Não autorizado'; end if;
 if p_full_name is null or trim(p_full_name)='' then raise exception 'Nome obrigatório'; end if;
 insert into public.invitations(code,full_name,whatsapp,allowed_guests)
 values(trim(p_code),trim(p_full_name),nullif(trim(p_whatsapp),''),greatest(p_allowed_guests,1))
 returning id into v_id;
 return v_id;
end; $$;

create or replace function public.admin_update_invitation(invitation_id uuid,p_full_name text,p_whatsapp text,p_allowed_guests integer)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'Não autorizado'; end if;
 update public.invitations set full_name=trim(p_full_name),whatsapp=nullif(trim(p_whatsapp),''),allowed_guests=greatest(p_allowed_guests,1)
 where id=invitation_id;
end; $$;

create or replace function public.admin_list_gifts()
returns table(id bigint,item_no integer,name text,reserved boolean,reserved_by_name text)
language sql security definer set search_path=public as $$
 select g.id,g.item_no,g.name,g.reserved,i.full_name
 from public.gifts g left join public.invitations i on i.id=g.reserved_by
 where public.is_admin() order by g.item_no;
$$;

grant execute on function public.admin_list_invitations() to authenticated;
grant execute on function public.admin_create_invitation(text,text,text,integer) to authenticated;
grant execute on function public.admin_update_invitation(uuid,text,text,integer) to authenticated;
grant execute on function public.admin_list_gifts() to authenticated;

-- IMPORTANTE:
-- Depois de criares o utilizador de login em Authentication > Users,
-- executa esta linha trocando o email pelo teu:
--
-- insert into public.admin_users(user_id)
-- select id from auth.users where email='TEU_EMAIL_AQUI'
-- on conflict do nothing;
--
-- Nunca coloques a Secret Key/Service Role Key no site.

-- ============================================================
-- V2.1 — GESTÃO DE PRESENTES + FOTOGRAFIAS
-- ============================================================

alter table public.gifts
add column if not exists image_url text;

-- Bucket público para fotografias dos presentes.
-- As imagens são públicas para que os convidados possam vê-las;
-- apenas administradores autenticados podem carregar/remover ficheiros.
insert into storage.buckets (id, name, public)
values ('gift-photos', 'gift-photos', true)
on conflict (id) do update set public = true;

-- Policies do Storage
 drop policy if exists "gift photos admin insert" on storage.objects;
 drop policy if exists "gift photos admin update" on storage.objects;
 drop policy if exists "gift photos admin delete" on storage.objects;

create policy "gift photos admin insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'gift-photos'
  and exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "gift photos admin update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'gift-photos'
  and exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  )
)
with check (
  bucket_id = 'gift-photos'
  and exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  )
);

create policy "gift photos admin delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'gift-photos'
  and exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  )
);

-- Leitura pública das imagens é feita pelo bucket público.

-- Função para adicionar presente.
drop function if exists public.admin_create_gift(text);

create function public.admin_create_gift(
    p_name text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id bigint;
    v_item_no integer;
begin
    if not public.is_admin() then
        raise exception 'Não autorizado';
    end if;

    if p_name is null or trim(p_name) = '' then
        raise exception 'Nome do presente obrigatório';
    end if;

    select coalesce(max(item_no), 0) + 1
    into v_item_no
    from public.gifts;

    insert into public.gifts (item_no, name, reserved)
    values (v_item_no, trim(p_name), false)
    returning id into v_id;

    return v_id;
end;
$$;

grant execute on function public.admin_create_gift(text)
to authenticated;

-- Guardar a URL da fotografia.
drop function if exists public.admin_update_gift_image(bigint, text);

create function public.admin_update_gift_image(
    gift_id bigint,
    p_image_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Não autorizado';
    end if;

    update public.gifts
    set image_url = nullif(trim(p_image_url), '')
    where id = gift_id;

    if not found then
        raise exception 'Presente não encontrado';
    end if;
end;
$$;

grant execute on function public.admin_update_gift_image(bigint, text)
to authenticated;

-- Remover presente. Por segurança, não permite apagar um presente já reservado.
drop function if exists public.admin_delete_gift(bigint);

create function public.admin_delete_gift(
    gift_id bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Não autorizado';
    end if;

    delete from public.gifts
    where id = gift_id
      and coalesce(reserved, false) = false;

    if not found then
        raise exception 'Presente não encontrado ou já reservado';
    end if;
end;
$$;

grant execute on function public.admin_delete_gift(bigint)
to authenticated;

-- Actualizar a listagem pública para incluir a fotografia.
drop function if exists public.list_gifts();

create function public.list_gifts()
returns table (
    id bigint,
    item_no integer,
    name text,
    reserved boolean,
    image_url text
)
language sql
security definer
set search_path = public
as $$
    select
        g.id,
        g.item_no,
        g.name,
        coalesce(g.reserved, false),
        g.image_url
    from public.gifts g
    order by g.item_no;
$$;

grant execute on function public.list_gifts()
to anon, authenticated;

-- Actualizar a listagem administrativa.
drop function if exists public.admin_list_gifts();

create function public.admin_list_gifts()
returns table (
    id bigint,
    item_no integer,
    name text,
    reserved boolean,
    reserved_by_name text,
    image_url text
)
language sql
security definer
set search_path = public
as $$
    select
        g.id,
        g.item_no,
        g.name,
        coalesce(g.reserved, false),
        i.full_name,
        g.image_url
    from public.gifts g
    left join public.invitations i on i.id = g.reserved_by
    where public.is_admin()
    order by g.item_no;
$$;

grant execute on function public.admin_list_gifts()
to authenticated;

-- ============================================================
-- V2.8 — GESTÃO COMPLETA DE PRESENTES
-- ============================================================

-- Permite editar o nome do presente sem alterar a fotografia.
drop function if exists public.admin_update_gift(bigint, text);
create function public.admin_update_gift(
    gift_id bigint,
    p_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Não autorizado';
    end if;
    if p_name is null or trim(p_name) = '' then
        raise exception 'Nome do presente obrigatório';
    end if;
    update public.gifts
    set name = trim(p_name)
    where id = gift_id;
    if not found then
        raise exception 'Presente não encontrado';
    end if;
end;
$$;
grant execute on function public.admin_update_gift(bigint, text) to authenticated;

-- Garantir novamente a listagem administrativa com fotografia e pessoa que reservou.
drop function if exists public.admin_list_gifts();
create function public.admin_list_gifts()
returns table (
    id bigint,
    item_no integer,
    name text,
    reserved boolean,
    reserved_by_name text,
    image_url text
)
language sql
security definer
set search_path = public
as $$
    select
        g.id,
        g.item_no,
        g.name,
        coalesce(g.reserved, false),
        i.full_name,
        g.image_url
    from public.gifts g
    left join public.invitations i on i.id = g.reserved_by
    where public.is_admin()
    order by g.item_no;
$$;
grant execute on function public.admin_list_gifts() to authenticated;
