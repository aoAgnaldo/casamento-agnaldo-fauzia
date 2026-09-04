-- CHECK-IN DOS CONVIDADOS
-- Execute este ficheiro no Supabase SQL Editor.

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

DROP FUNCTION IF EXISTS public.admin_list_invitations_checkin();
CREATE FUNCTION public.admin_list_invitations_checkin()
RETURNS TABLE(
  id uuid,
  code text,
  full_name text,
  whatsapp text,
  allowed_guests integer,
  rsvp_status text,
  companion_count integer,
  rsvp_note text,
  rsvp_at timestamptz,
  invitation_sent_at timestamptz,
  checked_in boolean,
  checked_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN QUERY
  SELECT i.id, i.code, i.full_name, i.whatsapp, i.allowed_guests,
         i.rsvp_status, i.companion_count, i.rsvp_note, i.rsvp_at,
         i.invitation_sent_at, i.checked_in, i.checked_in_at
  FROM public.invitations i
  ORDER BY i.full_name;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_invitations_checkin() TO authenticated;

DROP FUNCTION IF EXISTS public.admin_check_in_invitation(uuid);
CREATE FUNCTION public.admin_check_in_invitation(invitation_id uuid)
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
  SET checked_in = true,
      checked_in_at = COALESCE(checked_in_at, now())
  WHERE id = invitation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convidado não encontrado';
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_check_in_invitation(uuid) TO authenticated;

DROP FUNCTION IF EXISTS public.admin_cancel_check_in(uuid);
CREATE FUNCTION public.admin_cancel_check_in(invitation_id uuid)
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
  SET checked_in = false,
      checked_in_at = NULL
  WHERE id = invitation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convidado não encontrado';
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_cancel_check_in(uuid) TO authenticated;
