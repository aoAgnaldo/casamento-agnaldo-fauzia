-- V6.11 — Programa editável do casamento
-- Executar depois do V6.10.

alter table public.wedding_settings
  add column if not exists program_items jsonb;

update public.wedding_settings
set program_items = coalesce(program_items, jsonb_build_array(
  jsonb_build_object('date','29 MAIO','time','09:00','title','Cerimónia religiosa','description','Na Igreja Universal — Jardim, vamos celebrar a nossa união perante Deus, a família e os amigos.','location','Igreja Universal — Jardim, Maputo','map_url','https://www.google.com/maps/search/?api=1&query=Igreja%20Universal%20Jardim%20Maputo'),
  jsonb_build_object('date','29 MAIO','time','Depois da cerimónia','title','Sessão de fotos','description','Após a cerimónia, teremos um momento reservado para fotografias e para guardar memórias deste dia especial.','location','','map_url',''),
  jsonb_build_object('date','29 MAIO','time','15:00','title','Recepção','description','Receberemos os nossos convidados na Sala de Eventos do Kaya Kwanga Residence.','location','Sala de Eventos do Kaya Kwanga Residence, Maputo','map_url','https://www.google.com/maps/search/?api=1&query=Kaya%20Kwanga%20Residence%20Maputo')
)), updated_at=now()
where id=1;

drop function if exists public.admin_update_program(jsonb);
create or replace function public.admin_update_program(p_program_items jsonb)
returns public.wedding_settings
language plpgsql
security definer
set search_path=public
as $$
declare v_row public.wedding_settings;
begin
  if not public.is_admin() then raise exception 'Não autorizado.'; end if;
  if jsonb_typeof(p_program_items) <> 'array' then raise exception 'O programa deve ser uma lista.'; end if;
  update public.wedding_settings
  set program_items=p_program_items, updated_at=now()
  where id=1
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.admin_update_program(jsonb) to authenticated;
notify pgrst, 'reload schema';
