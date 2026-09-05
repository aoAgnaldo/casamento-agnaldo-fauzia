-- V6.9 — Imagens editáveis do convite pelo painel Admin
-- Executar depois do SQL V6.7.

create table if not exists public.wedding_settings(
  id smallint primary key check (id=1),
  cover_image_url text,
  story_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.wedding_settings(id, cover_image_url, story_image_url)
values (1, 'foto-capa.png', 'foto-capa.png')
on conflict (id) do nothing;

alter table public.wedding_settings enable row level security;
revoke all on public.wedding_settings from anon;
revoke all on public.wedding_settings from authenticated;
grant select on public.wedding_settings to anon, authenticated;

drop policy if exists "wedding settings public read" on public.wedding_settings;
create policy "wedding settings public read"
on public.wedding_settings
for select to anon, authenticated
using (true);

drop function if exists public.admin_update_wedding_images(text,text);
create or replace function public.admin_update_wedding_images(
  p_cover_image_url text default null,
  p_story_image_url text default null
)
returns public.wedding_settings
language plpgsql
security definer
set search_path=public
as $$
declare
  v_row public.wedding_settings;
begin
  if not public.is_admin() then
    raise exception 'Não autorizado.';
  end if;

  update public.wedding_settings
  set cover_image_url=coalesce(nullif(trim(p_cover_image_url),''),cover_image_url),
      story_image_url=coalesce(nullif(trim(p_story_image_url),''),story_image_url),
      updated_at=now()
  where id=1
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.admin_update_wedding_images(text,text) to authenticated;

insert into storage.buckets (id,name,public)
values ('wedding-images','wedding-images',true)
on conflict (id) do update set public=true;

drop policy if exists "wedding images public read" on storage.objects;
create policy "wedding images public read"
on storage.objects
for select to public
using (bucket_id='wedding-images');

drop policy if exists "wedding images admin insert" on storage.objects;
create policy "wedding images admin insert"
on storage.objects
for insert to authenticated
with check (
  bucket_id='wedding-images'
  and (storage.foldername(name))[1] in ('cover','story')
  and public.is_admin()
);

drop policy if exists "wedding images admin update" on storage.objects;
create policy "wedding images admin update"
on storage.objects
for update to authenticated
using (
  bucket_id='wedding-images'
  and (storage.foldername(name))[1] in ('cover','story')
  and public.is_admin()
)
with check (
  bucket_id='wedding-images'
  and (storage.foldername(name))[1] in ('cover','story')
  and public.is_admin()
);

drop policy if exists "wedding images admin delete" on storage.objects;
create policy "wedding images admin delete"
on storage.objects
for delete to authenticated
using (
  bucket_id='wedding-images'
  and (storage.foldername(name))[1] in ('cover','story')
  and public.is_admin()
);

notify pgrst, 'reload schema';
