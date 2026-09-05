-- V6.10 — 3 controlos discretos para capa, história e detalhes
-- Executar depois do V6.9.

alter table public.wedding_settings
  add column if not exists details_image_url text,
  add column if not exists story_text text;

update public.wedding_settings
set details_image_url=coalesce(details_image_url, cover_image_url, 'foto-capa.png'),
    story_text=coalesce(story_text, 'Tudo começou num casamento, num daqueles encontros em que a vida parece preparar, silenciosamente, algo muito especial. Naquele dia, uma amiga comentou que já tinha sido a ponte para a união de vários casais. A Fáuzia, em tom de brincadeira, perguntou-lhe: “Você vive juntando as pessoas, mas quando chegará a minha vez?”\n\nPouco tempo depois, essa amiga falou-lhe sobre um amigo querido, descrevendo as suas qualidades e dizendo que talvez houvesse ali uma história bonita para começar. Sem avisar a Fáuzia, entrou em contacto com o Agnaldo e escreveu-lhe: “Agnaldo, tenho uma amiga enviada por Deus que está interessada em conhecer-te.”\n\nEntre fotografias, mensagens e boas conversas, os nossos caminhos começaram a aproximar-se. No dia 23 de Outubro de 2025, começámos a conversar e demos o primeiro passo para uma história que se tornaria cada vez mais bonita. Hoje, percebemos que aquele encontro não foi por acaso: Deus usou uma amiga como ponte para escrever a nossa história de amor.'),
    updated_at=now()
where id=1;

drop function if exists public.admin_update_wedding_images(text,text);
drop function if exists public.admin_update_wedding_images(text,text,text,text);
create or replace function public.admin_update_wedding_images(
  p_cover_image_url text default null,
  p_story_image_url text default null,
  p_details_image_url text default null,
  p_story_text text default null
)
returns public.wedding_settings
language plpgsql
security definer
set search_path=public
as $$
declare v_row public.wedding_settings;
begin
  if not public.is_admin() then raise exception 'Não autorizado.'; end if;
  update public.wedding_settings
  set cover_image_url=coalesce(nullif(trim(p_cover_image_url),''),cover_image_url),
      story_image_url=coalesce(nullif(trim(p_story_image_url),''),story_image_url),
      details_image_url=coalesce(nullif(trim(p_details_image_url),''),details_image_url),
      story_text=case when p_story_text is null then story_text else nullif(trim(p_story_text),'') end,
      updated_at=now()
  where id=1
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.admin_update_wedding_images(text,text,text,text) to authenticated;

insert into storage.buckets (id,name,public)
values ('wedding-images','wedding-images',true)
on conflict (id) do update set public=true;

drop policy if exists "wedding images admin insert" on storage.objects;
create policy "wedding images admin insert"
on storage.objects for insert to authenticated
with check (bucket_id='wedding-images' and (storage.foldername(name))[1] in ('cover','story','details') and public.is_admin());

drop policy if exists "wedding images admin update" on storage.objects;
create policy "wedding images admin update"
on storage.objects for update to authenticated
using (bucket_id='wedding-images' and (storage.foldername(name))[1] in ('cover','story','details') and public.is_admin())
with check (bucket_id='wedding-images' and (storage.foldername(name))[1] in ('cover','story','details') and public.is_admin());

drop policy if exists "wedding images admin delete" on storage.objects;
create policy "wedding images admin delete"
on storage.objects for delete to authenticated
using (bucket_id='wedding-images' and (storage.foldername(name))[1] in ('cover','story','details') and public.is_admin());

notify pgrst, 'reload schema';
