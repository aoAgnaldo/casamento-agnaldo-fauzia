-- Execute uma vez no SQL Editor do seu projecto Supabase.
-- Cada conta acede apenas ao seu plano. Para o casal usar o mesmo plano,
-- entre com a mesma conta do painel nos dois dispositivos.
begin;
create table if not exists public.wedding_planners (
 user_id uuid primary key references auth.users(id) on delete cascade,
 content jsonb not null default '{"version":1,"stages":[],"items":[],"contributions":[],"budget":0,"target":0}'::jsonb,
 revision integer not null default 1 check (revision > 0),
 constraint planner_content_object check (jsonb_typeof(content) = 'object')
);
alter table public.wedding_planners enable row level security;
revoke all on public.wedding_planners from anon, authenticated;
grant select, insert, update on public.wedding_planners to authenticated;
drop policy if exists planner_read_own on public.wedding_planners;
create policy planner_read_own on public.wedding_planners for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists planner_insert_own on public.wedding_planners;
create policy planner_insert_own on public.wedding_planners for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists planner_update_own on public.wedding_planners;
create policy planner_update_own on public.wedding_planners for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
