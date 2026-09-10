-- V8.36 — Conteúdo editável do convite público
-- Execute este ficheiro UMA vez no Supabase: SQL Editor > New query > Run.
-- Não remove nem altera os convidados, presentes, mesas ou imagens existentes.

alter table public.wedding_settings
  add column if not exists site_content jsonb not null default '{}'::jsonb;

create or replace function public.admin_update_site_content(p_content jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'É necessário iniciar sessão como administrador.';
  end if;

  if p_content is null or jsonb_typeof(p_content) <> 'object' then
    raise exception 'O conteúdo do convite tem de ser um objecto válido.';
  end if;

  insert into public.wedding_settings (id, site_content)
  values (1, p_content)
  on conflict (id) do update
    set site_content = excluded.site_content;

  return p_content;
end;
$$;

revoke all on function public.admin_update_site_content(jsonb) from public;
grant execute on function public.admin_update_site_content(jsonb) to authenticated;

-- O convite já lê wedding_settings publicamente para mostrar as imagens e o programa.
-- Por isso, a nova coluna site_content fica disponível para a página index.html
-- sem expor qualquer informação de convidados ou de administração.
