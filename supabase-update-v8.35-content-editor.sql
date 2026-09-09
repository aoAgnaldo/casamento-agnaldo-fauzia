-- V8.35 — Editor completo do conteúdo público do convite
-- Executar no Supabase depois das migrations V6.10/V6.11 e antes de usar o novo editor.

alter table public.wedding_settings
  add column if not exists site_content jsonb,
  add column if not exists bank_accounts jsonb,
  add column if not exists details_items jsonb,
  add column if not exists story_images jsonb;

update public.wedding_settings
set site_content = coalesce(site_content, jsonb_build_object(
  'hero_kicker','Estamos a celebrar',
  'hero_title_line1','Um amor para',
  'hero_title_line2','toda a vida',
  'hero_copy','Há encontros que parecem acaso, mas chegam com a delicadeza de uma promessa.',
  'date_label','29 de maio de 2027',
  'story_signature','Com carinho, A & F',
  'gifts_intro','A vossa presença é o nosso maior presente. Se quiserem oferecer algo, podem escolher uma opção abaixo ou contribuir directamente.',
  'contribution_name','Agnaldo & Fáuzia',
  'gifts_note','Reserve um presente para não haver repetidos.',
  'rsvp_copy','Procure o seu convite pelo nome ou código pessoal e confirme a sua presença directamente aqui no site.',
  'rsvp_help','Falar connosco →',
  'footer_names','Agnaldo & Fáuzia',
  'footer_date','29 · 05 · 2027',
  'details_title_1','Alguns detalhes',
  'details_title_2','importantes'
)),
bank_accounts = coalesce(bank_accounts, jsonb_build_array(
  jsonb_build_object('bank','BCI','account','17039233510001','copy','17039233510001'),
  jsonb_build_object('bank','BIM','account','1005281229','copy','1005281229'),
  jsonb_build_object('bank','Moza','account','04520806110001','copy','04520806110001'),
  jsonb_build_object('bank','M-Pesa','account','845510992','copy','845510992'),
  jsonb_build_object('bank','E-Mola','account','87 588 4353','copy','875884353')
)),
details_items = coalesce(details_items, jsonb_build_array(
  jsonb_build_object('title','Kaya Kwanga','text','Avenida da Marginal · Maputo · Plus Code: 2JW6+WGC','icon','⌖'),
  jsonb_build_object('title','Traje','text','Elegância descontraída. Cores alegres são bem-vindas.','icon','◷'),
  jsonb_build_object('title','Confirmação','text','Pedimos resposta até 30 de Abril de 2027.','icon','□')
)),
story_images = coalesce(story_images, jsonb_build_array()),
updated_at=now()
where id=1;

drop function if exists public.admin_update_wedding_content(jsonb,jsonb,jsonb,jsonb,text);
create or replace function public.admin_update_wedding_content(
  p_site_content jsonb,
  p_bank_accounts jsonb,
  p_details_items jsonb,
  p_story_images jsonb,
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
  if jsonb_typeof(p_site_content) <> 'object' then raise exception 'Conteúdo inválido.'; end if;
  if jsonb_typeof(p_bank_accounts) <> 'array' then raise exception 'Dados bancários inválidos.'; end if;
  if jsonb_typeof(p_details_items) <> 'array' then raise exception 'Detalhes inválidos.'; end if;
  if jsonb_typeof(p_story_images) <> 'array' then raise exception 'Galeria inválida.'; end if;
  update public.wedding_settings
  set site_content=p_site_content,
      bank_accounts=p_bank_accounts,
      details_items=p_details_items,
      story_images=p_story_images,
      story_text=case when p_story_text is null then story_text else nullif(trim(p_story_text),'') end,
      story_image_url=coalesce(nullif(trim(p_story_images->0->>'url'),''), story_image_url),
      updated_at=now()
  where id=1
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.admin_update_wedding_content(jsonb,jsonb,jsonb,jsonb,text) to authenticated;
notify pgrst, 'reload schema';
