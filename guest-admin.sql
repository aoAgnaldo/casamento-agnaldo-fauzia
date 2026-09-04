-- Função para remover convidados pelo painel administrativo.
drop function if exists public.admin_delete_invitation(uuid);
create function public.admin_delete_invitation(invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Não autorizado'; end if;
  delete from public.invitations where id = invitation_id;
  if not found then raise exception 'Convidado não encontrado'; end if;
end;
$$;
grant execute on function public.admin_delete_invitation(uuid) to authenticated;

-- Regista quando o convite é enviado pelo painel via WhatsApp
DROP FUNCTION IF EXISTS public.admin_mark_invitation_sent(uuid);
CREATE FUNCTION public.admin_mark_invitation_sent(invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  UPDATE public.invitations
  SET invitation_sent_at = now()
  WHERE id = invitation_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_mark_invitation_sent(uuid) TO authenticated;
