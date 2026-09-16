-- À exécuter une seule fois sur une base existante V4.3.1.

-- ============================================================
-- V4.4.0 — RAPPORT POST-SOIRÉE / OPPORTUNITÉS CAVISTE
-- ============================================================

alter table public.players add column if not exists commercial_consent boolean not null default false;
alter table public.players add column if not exists commercial_consent_at timestamptz;

-- Version enrichie de join_game. L'ancienne surcharge est conservée pour compatibilité,
-- mais le frontend V4.4 appelle celle-ci avec un consentement commercial explicite.
create or replace function public.join_game(p_code text,p_name text,p_commercial_consent boolean)
returns table(game_id uuid, code text, status text, current integer, phase text, wine_count integer, host_id uuid, experience_mode text, discovery_theme text, discovery_theme_goal text)
language plpgsql
security definer
set search_path=public
as $$
declare
  g public.games%rowtype;
  clean_name text;
begin
  if auth.uid() is null then raise exception 'Authentification requise.'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'Convertis ton profil invité en compte email avant de rejoindre une partie.';
  end if;
  clean_name=btrim(p_name);
  if char_length(clean_name)<1 or char_length(clean_name)>30 then raise exception 'Prénom invalide.'; end if;

  select * into g from public.games where upper(public.games.code)=upper(btrim(p_code)) limit 1;
  if g.id is null then raise exception 'Partie introuvable.'; end if;
  if g.status='finished' then raise exception 'Cette partie est terminée.'; end if;
  if g.status<>'lobby' and not exists(select 1 from public.players p where p.game_id=g.id and p.user_id=auth.uid()) then
    raise exception 'La dégustation a déjà commencé.';
  end if;

  select coalesce(p.display_name,clean_name) into clean_name from public.profiles p where p.id=auth.uid();
  if clean_name is null or btrim(clean_name)='' then clean_name:='Joueur'; end if;

  insert into public.players(game_id,user_id,name,commercial_consent,commercial_consent_at)
  values(g.id,auth.uid(),left(clean_name,30),coalesce(p_commercial_consent,false),case when coalesce(p_commercial_consent,false) then now() else null end)
  on conflict on constraint players_game_id_user_id_key
  do update set name=excluded.name,
                commercial_consent=excluded.commercial_consent,
                commercial_consent_at=case when excluded.commercial_consent then coalesce(public.players.commercial_consent_at,now()) else null end;

  return query select g.id,g.code,g.status,g.current,g.phase,g.wine_count,g.host_id,g.experience_mode,g.discovery_theme,g.discovery_theme_goal;
end;
$$;
revoke all on function public.join_game(text,text,boolean) from public;
grant execute on function public.join_game(text,text,boolean) to authenticated;

create table if not exists public.post_event_reports (
  game_id uuid primary key references public.games(id) on delete cascade,
  host_id uuid not null,
  emailed_at timestamptz,
  provider_id text,
  created_at timestamptz not null default now()
);
alter table public.post_event_reports enable row level security;
drop policy if exists post_event_reports_host_select on public.post_event_reports;
drop policy if exists post_event_reports_host_insert on public.post_event_reports;
drop policy if exists post_event_reports_host_update on public.post_event_reports;
create policy post_event_reports_host_select on public.post_event_reports for select to authenticated using(host_id=auth.uid());
create policy post_event_reports_host_insert on public.post_event_reports for insert to authenticated with check(host_id=auth.uid() and public.is_game_host(game_id));
create policy post_event_reports_host_update on public.post_event_reports for update to authenticated using(host_id=auth.uid() and public.is_game_host(game_id)) with check(host_id=auth.uid() and public.is_game_host(game_id));
grant select,insert,update on public.post_event_reports to authenticated;

-- Les emails des participants ne sont jamais exposés via profiles.
-- Cet RPC ne les révèle qu'à l'hôte d'une partie terminée, et uniquement si le participant
-- a donné son consentement commercial explicite pendant l'inscription à la soirée.
create or replace function public.get_post_event_contacts(p_game_id uuid)
returns table(user_id uuid, name text, email text, commercial_consent boolean, commercial_consent_at timestamptz)
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  if auth.uid() is null then raise exception 'Authentification requise.'; end if;
  if not exists(select 1 from public.games g where g.id=p_game_id and g.host_id=auth.uid() and g.status='finished') then
    raise exception 'Rapport réservé à l’organisateur après la fin de la partie.';
  end if;
  return query
  select p.user_id,p.name,
         case when p.commercial_consent then u.email else null end,
         p.commercial_consent,p.commercial_consent_at
  from public.players p
  left join auth.users u on u.id=p.user_id
  where p.game_id=p_game_id
    and p.user_id<>auth.uid()
  order by p.created_at;
end;
$$;
revoke all on function public.get_post_event_contacts(uuid) from public;
grant execute on function public.get_post_event_contacts(uuid) to authenticated;
