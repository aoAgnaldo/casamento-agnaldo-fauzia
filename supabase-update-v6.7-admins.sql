-- V6.7 — Perfis e múltiplos administradores
-- Executar depois do SQL actual do projecto (V5.6 corrigido).

create table if not exists public.admin_profiles(
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon;
grant select, insert, update on public.admin_profiles to authenticated;

drop policy if exists "admin profile self read" on public.admin_profiles;
create policy "admin profile self read" on public.admin_profiles
for select to authenticated using (user_id=auth.uid() and public.is_admin());

drop policy if exists "admin profile self insert" on public.admin_profiles;
create policy "admin profile self insert" on public.admin_profiles
for insert to authenticated with check (user_id=auth.uid() and public.is_admin());

drop policy if exists "admin profile self update" on public.admin_profiles;
create policy "admin profile self update" on public.admin_profiles
for update to authenticated using (user_id=auth.uid() and public.is_admin()) with check (user_id=auth.uid() and public.is_admin());

-- Lista apenas para administradores autenticados.
drop function if exists public.admin_list_admins();
create or replace function public.admin_list_admins()
returns table(user_id uuid,email text,display_name text,avatar_url text,created_at timestamptz)
language sql security definer set search_path=public,auth
as $$
  select u.id,u.email,
         coalesce(p.display_name, split_part(coalesce(u.email,''),'@',1)) as display_name,
         p.avatar_url,u.created_at
  from auth.users u
  join public.admin_users au on au.user_id=u.id
  left join public.admin_profiles p on p.user_id=u.id
  where public.is_admin()
  order by coalesce(p.display_name,u.email);
$$;
grant execute on function public.admin_list_admins() to authenticated;

-- Bucket público: os avatares podem ser mostrados no cabeçalho.
insert into storage.buckets (id,name,public)
values ('admin-avatars','admin-avatars',true)
on conflict (id) do update set public=true;

-- Apenas administradores podem gerir o seu próprio avatar.
drop policy if exists "admin avatars insert own" on storage.objects;
create policy "admin avatars insert own" on storage.objects
for insert to authenticated
with check (
  bucket_id='admin-avatars'
  and (storage.foldername(name))[1]=auth.uid()::text
  and public.is_admin()
);

drop policy if exists "admin avatars update own" on storage.objects;
create policy "admin avatars update own" on storage.objects
for update to authenticated
using (bucket_id='admin-avatars' and (storage.foldername(name))[1]=auth.uid()::text and public.is_admin())
with check (bucket_id='admin-avatars' and (storage.foldername(name))[1]=auth.uid()::text and public.is_admin());

drop policy if exists "admin avatars delete own" on storage.objects;
create policy "admin avatars delete own" on storage.objects
for delete to authenticated
using (bucket_id='admin-avatars' and (storage.foldername(name))[1]=auth.uid()::text and public.is_admin());

-- O SELECT público é necessário porque o bucket é público e os convidados não precisam de login.
drop policy if exists "admin avatars public read" on storage.objects;
create policy "admin avatars public read" on storage.objects
for select to public using (bucket_id='admin-avatars');

notify pgrst, 'reload schema';
