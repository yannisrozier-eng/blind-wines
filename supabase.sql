-- BLIND WINE V3.5.1 COHERENCE AUDIT
-- À exécuter dans Supabase > SQL Editor.
-- Ce script migre une base V2.x existante et renforce le multi-joueur + la confidentialité.

create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key,
  code text unique not null,
  status text not null default 'lobby' check (status in ('lobby','tasting','finished')),
  current integer not null default 0,
  host_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.games add column if not exists phase text not null default 'answering';
alter table public.games add column if not exists wine_count integer not null default 9;
alter table public.games add column if not exists experience_mode text not null default 'blind';
alter table public.games drop constraint if exists games_experience_mode_check;
alter table public.games add constraint games_experience_mode_check check (experience_mode in ('blind','discovery','challenge'));
alter table public.games drop column if exists host_token;
alter table public.games drop constraint if exists games_phase_check;
alter table public.games add constraint games_phase_check check (phase in ('answering','revealed'));
alter table public.games drop constraint if exists games_current_check;
alter table public.games drop constraint if exists games_wine_count_check;
alter table public.games add constraint games_wine_count_check check (wine_count between 3 and 20);
alter table public.games add constraint games_current_check check (current >= 0 and current < wine_count);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null,
  name text not null check (char_length(name) between 1 and 30),
  created_at timestamptz not null default now(),
  unique(game_id,user_id)
);

create table if not exists public.wines (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  position integer not null,
  type text not null check (type in ('rose','white','red')),
  name text not null default '',
  price numeric,
  region text not null default '',
  grape text not null default '',
  unique(game_id,position)
);

alter table public.wines drop constraint if exists wines_position_check;
alter table public.wines add constraint wines_position_check check (position >= 0 and position < 20);

create table if not exists public.wine_secrets (
  wine_id uuid primary key references public.wines(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  name text not null default '',
  price numeric check (price is null or price > 0),
  region text not null default '',
  grapes text[] not null default '{}'::text[]
);

create table if not exists public.wine_reveals (
  wine_id uuid primary key references public.wines(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  name text not null,
  price numeric not null check (price > 0),
  region text not null,
  grapes text[] not null default '{}'::text[],
  revealed_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  wine_id uuid not null references public.wines(id) on delete cascade,
  user_id uuid not null,
  scores jsonb not null default '{}'::jsonb,
  aromas jsonb not null default '[]'::jsonb,
  note integer check (note between 1 and 10),
  price numeric check (price is null or price > 0),
  region text not null default '',
  grape text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  unique(game_id,wine_id,user_id)
);


-- Profil minimal créé tôt pour que create_game()/join_game() puissent être compilées
-- sur une base Supabase totalement vide.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.answers add column if not exists grapes text[] not null default '{}'::text[];
alter table public.answers add column if not exists hint_level integer not null default 0;
alter table public.answers add column if not exists discovery_step integer not null default 0;
alter table public.answers add column if not exists quiz_choice integer;
alter table public.answers drop constraint if exists answers_discovery_step_check;
alter table public.answers add constraint answers_discovery_step_check check (discovery_step between 0 and 4);
alter table public.answers drop constraint if exists answers_quiz_choice_check;
alter table public.answers add constraint answers_quiz_choice_check check (quiz_choice is null or quiz_choice between 0 and 3);
alter table public.answers drop constraint if exists answers_hint_level_check;
alter table public.answers add constraint answers_hint_level_check check (hint_level between 0 and 2);
alter table public.wine_secrets add column if not exists learning_goal text not null default '';
alter table public.wine_secrets add column if not exists learning_note text not null default '';
alter table public.wine_secrets add column if not exists hint1 text not null default '';
alter table public.wine_secrets add column if not exists hint2 text not null default '';
alter table public.wine_reveals add column if not exists learning_goal text not null default '';
alter table public.wine_reveals add column if not exists learning_note text not null default '';
alter table public.wine_reveals add column if not exists hint1 text not null default '';
alter table public.wine_reveals add column if not exists hint2 text not null default '';

alter table public.wine_secrets add column if not exists eye_tip text not null default '';
alter table public.wine_secrets add column if not exists nose_tip text not null default '';
alter table public.wine_secrets add column if not exists palate_tip text not null default '';
alter table public.wine_secrets add column if not exists quiz_question text not null default '';
alter table public.wine_secrets add column if not exists quiz_options jsonb not null default '[]'::jsonb;
alter table public.wine_secrets drop constraint if exists wine_secrets_quiz_options_check;
alter table public.wine_secrets add constraint wine_secrets_quiz_options_check
  check (
    jsonb_typeof(quiz_options)='array'
    and jsonb_array_length(quiz_options) between 0 and 4
  );
alter table public.wine_secrets add column if not exists quiz_correct integer;
alter table public.wine_secrets drop constraint if exists wine_secrets_quiz_correct_check;
alter table public.wine_secrets add constraint wine_secrets_quiz_correct_check
  check (quiz_correct is null or quiz_correct between 0 and 3);
alter table public.wine_secrets add column if not exists quiz_explanation text not null default '';
alter table public.wine_reveals add column if not exists eye_tip text not null default '';
alter table public.wine_reveals add column if not exists nose_tip text not null default '';
alter table public.wine_reveals add column if not exists palate_tip text not null default '';
alter table public.wine_reveals add column if not exists quiz_question text not null default '';
alter table public.wine_reveals add column if not exists quiz_options jsonb not null default '[]'::jsonb;
alter table public.wine_reveals add column if not exists quiz_correct integer;
alter table public.wine_reveals add column if not exists quiz_explanation text not null default '';


-- Migration des anciennes vraies réponses stockées dans wines vers la table privée.
insert into public.wine_secrets(wine_id,game_id,name,price,region,grapes)
select id,game_id,coalesce(name,''),price,coalesce(region,''),
       case when coalesce(grape,'')='' then '{}'::text[] else string_to_array(grape,' / ') end
from public.wines
where btrim(coalesce(name,''))<>''
   or price is not null
   or btrim(coalesce(region,''))<>''
   or btrim(coalesce(grape,''))<>''
on conflict (wine_id) do nothing;

-- Pour les anciennes parties déjà terminées, créer aussi les révélations.
insert into public.wine_reveals(wine_id,game_id,name,price,region,grapes)
select s.wine_id,s.game_id,s.name,s.price,s.region,s.grapes
from public.wine_secrets s
join public.games g on g.id=s.game_id
where g.status='finished' and s.price is not null and s.name<>'' and s.region<>''
on conflict (wine_id) do nothing;

-- IMPORTANT : les anciennes colonnes restent pour compatibilité SQL, mais sont vidées.
update public.wines set name='',price=null,region='',grape='';

alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.wines enable row level security;
alter table public.wine_secrets enable row level security;
alter table public.wine_reveals enable row level security;
alter table public.answers enable row level security;

-- Fonctions de sécurité sans récursion RLS.
create or replace function public.is_game_host(p_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(select 1 from public.games g where g.id=p_game_id and g.host_id=auth.uid());
$$;

create or replace function public.is_game_member(p_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(select 1 from public.players p where p.game_id=p_game_id and p.user_id=auth.uid());
$$;

-- Création atomique : partie + organisateur + bouteilles + secrets.
drop function if exists public.create_game(integer);
drop function if exists public.create_game(integer,text);
create function public.create_game(p_wine_count integer, p_experience_mode text)
returns table(game_id uuid, code text, status text, current integer, phase text, wine_count integer, host_id uuid, experience_mode text)
language plpgsql
security definer
set search_path=public
as $$
declare
  gid uuid:=gen_random_uuid();
  gcode text;
  chars text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i integer;
  wid uuid;
  wtype text;
begin
  if auth.uid() is null then raise exception 'Authentification requise.'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'Convertis ton profil invité en compte email avant de créer une partie.';
  end if;
  if p_wine_count<3 or p_wine_count>20 then raise exception 'Le nombre de vins doit être compris entre 3 et 20.'; end if;
  if p_experience_mode not in ('blind','discovery','challenge') then raise exception 'Mode invalide.'; end if;

  loop
    select string_agg(substr(chars,1+floor(random()*length(chars))::integer,1),'')
    into gcode
    from generate_series(1,5);
    exit when not exists(select 1 from public.games g where g.code=gcode);
  end loop;

  insert into public.games(id,code,status,current,phase,wine_count,host_id,experience_mode)
  values(gid,gcode,'lobby',0,'answering',p_wine_count,auth.uid(),p_experience_mode);

  insert into public.players(game_id,user_id,name)
  select gid,auth.uid(),coalesce((select display_name from public.profiles where id=auth.uid()),'Organisateur');

  for i in 0..p_wine_count-1 loop
    wtype:=case
      when i*3<p_wine_count then 'rose'
      when i*3<2*p_wine_count then 'white'
      else 'red'
    end;

    insert into public.wines(game_id,position,type)
    values(gid,i,wtype)
    returning id into wid;

    insert into public.wine_secrets(wine_id,game_id,name,price,region,grapes)
    values(wid,gid,'',null,'','{}'::text[]);
  end loop;

  return query
  select gid,gcode,'lobby'::text,0,'answering'::text,p_wine_count,auth.uid(),p_experience_mode;
end;
$$;

revoke all on function public.create_game(integer,text) from public;
grant execute on function public.create_game(integer,text) to authenticated;

-- Rejoindre par code sans rendre toutes les parties publiques.
-- Le DROP est nécessaire en migration V2.7 -> V2.8 car le type de retour gagne wine_count.
drop function if exists public.join_game(text,text);
create function public.join_game(p_code text,p_name text)
returns table(game_id uuid, code text, status text, current integer, phase text, wine_count integer, host_id uuid, experience_mode text)
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
  if char_length(clean_name)<1 or char_length(clean_name)>30 then
    raise exception 'Prénom invalide.';
  end if;

  select * into g from public.games
  where upper(public.games.code)=upper(btrim(p_code))
  limit 1;

  if g.id is null then raise exception 'Partie introuvable.'; end if;
  if g.status='finished' then raise exception 'Cette partie est terminée.'; end if;

  -- Un membre existant peut se reconnecter. Un nouveau joueur ne peut entrer qu'au lobby.
  -- IMPORTANT : join_game retourne une colonne nommée game_id ; éviter les références SQL non qualifiées à game_id.
  if g.status<>'lobby' and not exists(
    select 1 from public.players p where p.game_id=g.id and p.user_id=auth.uid()
  ) then
    raise exception 'La dégustation a déjà commencé.';
  end if;

  select coalesce(p.display_name,clean_name) into clean_name
  from public.profiles p where p.id=auth.uid();
  if clean_name is null or btrim(clean_name)='' then clean_name:='Joueur'; end if;

  insert into public.players(game_id,user_id,name)
  values(g.id,auth.uid(),left(clean_name,30))
  on conflict on constraint players_game_id_user_id_key
  do update set name=excluded.name;

  return query select g.id,g.code,g.status,g.current,g.phase,g.wine_count,g.host_id,g.experience_mode;
end;
$$;

revoke all on function public.join_game(text,text) from public;
grant execute on function public.join_game(text,text) to authenticated;
revoke all on function public.is_game_host(uuid) from public;
grant execute on function public.is_game_host(uuid) to authenticated;
revoke all on function public.is_game_member(uuid) from public;
grant execute on function public.is_game_member(uuid) to authenticated;

create or replace function public.is_game_lobby(p_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(select 1 from public.games g where g.id=p_game_id and g.status='lobby');
$$;

revoke all on function public.is_game_lobby(uuid) from public;
grant execute on function public.is_game_lobby(uuid) to authenticated;



-- Intégrité : l'organisateur peut modifier le contenu d'un vin au lobby,
-- mais ne peut pas déplacer une ligne vers une autre partie ou position.
create or replace function public.guard_wine_identity()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if tg_op='UPDATE' and (new.game_id is distinct from old.game_id or new.position is distinct from old.position) then
    raise exception 'La partie et la position d’un vin sont immuables.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_wine_identity on public.wines;
create trigger trg_guard_wine_identity
before update on public.wines
for each row execute function public.guard_wine_identity();

create or replace function public.guard_wine_secret_identity()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if tg_op='UPDATE' and (
    new.wine_id is distinct from old.wine_id
    or new.game_id is distinct from old.game_id
  ) then
    raise exception 'L’identité d’un secret de vin est immuable.';
  end if;

  if not exists(
    select 1 from public.wines w
    where w.id=new.wine_id and w.game_id=new.game_id
  ) then
    raise exception 'Le secret doit appartenir au même jeu que son vin.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_wine_secret_identity on public.wine_secrets;
create trigger trg_guard_wine_secret_identity
before insert or update on public.wine_secrets
for each row execute function public.guard_wine_secret_identity();


-- Supprimer les anciennes policies.
do $$
declare r record;
begin
  for r in select schemaname,tablename,policyname from pg_policies
           where schemaname='public' and tablename in ('games','players','wines','wine_secrets','wine_reveals','answers')
  loop
    execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename);
  end loop;
end $$;

create policy games_select on public.games for select to authenticated
using (host_id=auth.uid() or public.is_game_member(id));

create policy players_select on public.players for select to authenticated
using (public.is_game_host(game_id) or public.is_game_member(game_id));


create policy players_delete_host on public.players for delete to authenticated
using (
  public.is_game_host(game_id)
  and user_id<>auth.uid()
  and exists(select 1 from public.games g where g.id=game_id and g.status='lobby')
);

create policy wines_select on public.wines for select to authenticated
using (public.is_game_host(game_id) or public.is_game_member(game_id));

create policy wines_update on public.wines for update to authenticated
using (public.is_game_host(game_id) and public.is_game_lobby(game_id))
with check (public.is_game_host(game_id) and public.is_game_lobby(game_id));

create policy wine_secrets_select on public.wine_secrets for select to authenticated
using (public.is_game_host(game_id));

create policy wine_secrets_update on public.wine_secrets for update to authenticated
using (public.is_game_host(game_id) and public.is_game_lobby(game_id))
with check (public.is_game_host(game_id) and public.is_game_lobby(game_id));

create policy wine_reveals_select on public.wine_reveals for select to authenticated
using (public.is_game_host(game_id) or public.is_game_member(game_id));

create or replace function public.start_game(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  g public.games%rowtype;
  total_wines integer;
  incomplete integer;
  bad_quiz integer;
  bad_hints integer;
begin
  select * into g from public.games where id=p_game_id for update;
  if g.id is null then raise exception 'Partie introuvable.'; end if;
  if g.host_id<>auth.uid() then raise exception 'Action réservée à l’organisateur.'; end if;
  if g.status<>'lobby' then raise exception 'La partie a déjà commencé.'; end if;
  if not exists(
    select 1 from public.players p where p.game_id=p_game_id and p.user_id<>g.host_id
  ) then
    raise exception 'Ajoute au moins un joueur avant de lancer la dégustation.';
  end if;

  select count(*) into total_wines from public.wines where game_id=p_game_id;
  if total_wines<>g.wine_count then raise exception 'Configuration des vins incomplète.'; end if;

  select count(*) into incomplete
  from public.wine_secrets s
  join public.wines w on w.id=s.wine_id
  where s.game_id=p_game_id
    and (btrim(s.name)='' or s.price is null or s.price<=0 or btrim(s.region)='' or coalesce(array_length(s.grapes,1),0)=0);

  if incomplete>0 then raise exception 'Complète toutes les bouteilles avant de lancer.'; end if;

  if g.experience_mode='discovery' then
    select count(*) into bad_quiz
    from public.wine_secrets s
    where s.game_id=p_game_id
      and btrim(s.quiz_question)<>''
      and (
        jsonb_array_length(s.quiz_options)<2
        or s.quiz_correct is null
        or s.quiz_correct<0
        or s.quiz_correct>=jsonb_array_length(s.quiz_options)
      );

    if bad_quiz>0 then
      raise exception 'Vérifie les mini-quiz : 2 à 4 réponses et une bonne réponse valide sont requises.';
    end if;
  end if;

  if g.experience_mode='challenge' then
    select count(*) into bad_hints
    from public.wine_secrets s
    where s.game_id=p_game_id
      and (btrim(s.hint1)='' or btrim(s.hint2)='');

    if bad_hints>0 then
      raise exception 'Ajoute deux indices à chaque vin du mode Challenge avant de lancer.';
    end if;
  end if;

  update public.games set status='tasting',phase='answering',current=0 where id=p_game_id;
end;
$$;

create or replace function public.reveal_current_wine(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  g public.games%rowtype;
  w public.wines%rowtype;
  s public.wine_secrets%rowtype;
begin
  select * into g from public.games where id=p_game_id for update;
  if g.id is null then raise exception 'Partie introuvable.'; end if;
  if g.host_id<>auth.uid() then raise exception 'Action réservée à l’organisateur.'; end if;
  if g.status<>'tasting' or g.phase<>'answering' then raise exception 'Révélation impossible dans cet état.'; end if;

  select * into w from public.wines where game_id=p_game_id and position=g.current;
  select * into s from public.wine_secrets where wine_id=w.id;
  if s.wine_id is null then raise exception 'Données du vin introuvables.'; end if;

  insert into public.wine_reveals(
    wine_id,game_id,name,price,region,grapes,
    learning_goal,learning_note,hint1,hint2,
    eye_tip,nose_tip,palate_tip,quiz_question,quiz_options,quiz_correct,quiz_explanation
  )
  values(
    s.wine_id,s.game_id,s.name,s.price,s.region,s.grapes,
    s.learning_goal,s.learning_note,s.hint1,s.hint2,
    s.eye_tip,s.nose_tip,s.palate_tip,s.quiz_question,s.quiz_options,s.quiz_correct,s.quiz_explanation
  )
  on conflict (wine_id) do update set
    name=excluded.name,price=excluded.price,region=excluded.region,grapes=excluded.grapes,
    learning_goal=excluded.learning_goal,learning_note=excluded.learning_note,
    hint1=excluded.hint1,hint2=excluded.hint2,
    eye_tip=excluded.eye_tip,nose_tip=excluded.nose_tip,palate_tip=excluded.palate_tip,
    quiz_question=excluded.quiz_question,quiz_options=excluded.quiz_options,
    quiz_correct=excluded.quiz_correct,quiz_explanation=excluded.quiz_explanation,
    revealed_at=now();

  update public.games set phase='revealed' where id=p_game_id;
end;
$$;

create or replace function public.advance_game(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  g public.games%rowtype;
begin
  select * into g from public.games where id=p_game_id for update;
  if g.id is null then raise exception 'Partie introuvable.'; end if;
  if g.host_id<>auth.uid() then raise exception 'Action réservée à l’organisateur.'; end if;
  if g.status<>'tasting' or g.phase<>'revealed' then raise exception 'Le vin doit être révélé avant de continuer.'; end if;

  if g.current+1<g.wine_count then
    update public.games set current=g.current+1,phase='answering' where id=p_game_id;
  else
    update public.games set status='finished' where id=p_game_id;
  end if;
end;
$$;

revoke all on function public.start_game(uuid) from public;
grant execute on function public.start_game(uuid) to authenticated;
revoke all on function public.reveal_current_wine(uuid) from public;
grant execute on function public.reveal_current_wine(uuid) to authenticated;
revoke all on function public.advance_game(uuid) from public;
grant execute on function public.advance_game(uuid) to authenticated;

create or replace function public.is_open_wine(p_game_id uuid,p_wine_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.games g
    join public.wines w on w.game_id=g.id
    where g.id=p_game_id
      and w.id=p_wine_id
      and g.status='tasting'
      and g.phase='answering'
      and w.position=g.current
  );
$$;

revoke all on function public.is_open_wine(uuid,uuid) from public;
grant execute on function public.is_open_wine(uuid,uuid) to authenticated;

create policy answers_select on public.answers for select to authenticated
using (user_id=auth.uid() or public.is_game_host(game_id));

create policy answers_insert on public.answers for insert to authenticated
with check (
  user_id=auth.uid()
  and not public.is_game_host(game_id)
  and public.is_game_member(game_id)
  and exists(select 1 from public.wines w where w.id=wine_id and w.game_id=game_id)
  and public.is_open_wine(game_id,wine_id)
);

-- Une réponse validée (done=true) ne peut plus être modifiée.
create policy answers_update on public.answers for update to authenticated
using (user_id=auth.uid() and done=false and public.is_game_member(game_id))
with check (
  user_id=auth.uid()
  and not public.is_game_host(game_id)
  and public.is_game_member(game_id)
  and exists(select 1 from public.wines w where w.id=wine_id and w.game_id=game_id)
  and public.is_open_wine(game_id,wine_id)
);

create or replace function public.guard_answer_write()
returns trigger
language plpgsql
set search_path=public
as $$
declare
  gmode text;
begin
  if tg_op='UPDATE' then
    if old.done then raise exception 'Cette réponse est verrouillée.'; end if;
    if new.game_id<>old.game_id or new.wine_id<>old.wine_id or new.user_id<>old.user_id then
      raise exception 'Identité de réponse non modifiable.';
    end if;
    if new.hint_level < old.hint_level then
      raise exception 'Un indice déjà utilisé ne peut pas être annulé.';
    end if;
    if old.quiz_choice is not null and new.quiz_choice is distinct from old.quiz_choice then
      raise exception 'La réponse au mini-quiz est verrouillée après le premier choix.';
    end if;
  end if;

  select experience_mode into gmode from public.games where id=new.game_id;
  if gmode is null then
    raise exception 'Partie introuvable.';
  end if;

  -- Cohérence forte entre les trois expériences : les champs propres à un mode
  -- ne peuvent pas être injectés dans un autre mode via l'API REST.
  if gmode='blind' then
    if new.hint_level<>0 or new.quiz_choice is not null or new.discovery_step<>0 then
      raise exception 'Champs incompatibles avec le mode À l’aveugle.';
    end if;
  elsif gmode='challenge' then
    if new.quiz_choice is not null or new.discovery_step<>0 then
      raise exception 'Champs incompatibles avec le mode Challenge.';
    end if;
  elsif gmode='discovery' then
    if new.hint_level<>0
       or new.price is not null
       or btrim(coalesce(new.region,''))<>''
       or coalesce(array_length(new.grapes,1),0)<>0
       or btrim(coalesce(new.grape,''))<>'' then
      raise exception 'Champs incompatibles avec le mode Découverte.';
    end if;
  end if;

  if new.done then
    if new.note is null then
      raise exception 'Ajoute ta note globale.';
    end if;
    if gmode='discovery' then
      if new.quiz_choice is null then raise exception 'Réponds au mini-quiz avant de terminer.'; end if;
    else
      if new.price is null or new.price<=0 or btrim(new.region)='' or coalesce(array_length(new.grapes,1),0)=0 then
        raise exception 'Réponse incomplète.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_answer_update on public.answers;
drop trigger if exists trg_guard_answer_write on public.answers;
create trigger trg_guard_answer_write
before insert or update on public.answers
for each row execute function public.guard_answer_write();

-- Retirer explicitement les anciens droits hérités des V2.7/V2.8.
revoke insert,update,delete on public.games from authenticated;
revoke insert,update on public.players from authenticated;
revoke insert,delete on public.wines from authenticated;
revoke insert,delete on public.wine_secrets from authenticated;
revoke insert,update,delete on public.wine_reveals from authenticated;

grant select on public.games to authenticated;
grant select,delete on public.players to authenticated;
grant select,update on public.wines to authenticated;
grant select,update on public.wine_secrets to authenticated;
grant select on public.wine_reveals to authenticated;
grant select,insert,update on public.answers to authenticated;



-- Indexes V3.1 : historique et temps réel à coût stable quand la base grandit.
create index if not exists idx_games_host_created on public.games(host_id,created_at desc);
create index if not exists idx_players_user_created on public.players(user_id,created_at desc);
create index if not exists idx_answers_user_done_game on public.answers(user_id,done,game_id);
create index if not exists idx_answers_game_wine_done on public.answers(game_id,wine_id,done);
create index if not exists idx_reveals_game on public.wine_reveals(game_id);

-- ============================================================
-- V3 : COMPTES PERMANENTS & PROFILS
-- ============================================================

alter table public.profiles enable row level security;

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  new.updated_at=now();
  return new;
end;
$$;
drop trigger if exists trg_touch_profile_updated_at on public.profiles;
create trigger trg_touch_profile_updated_at before update on public.profiles
for each row execute function public.touch_profile_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  proposed text;
begin
  proposed:=coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'),''),
                     nullif(split_part(coalesce(new.email,''),'@',1),''),
                     'Joueur');
  insert into public.profiles(id,display_name)
  values(new.id,left(proposed,30))
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Rattrapage pour les utilisateurs existants déjà authentifiés.
insert into public.profiles(id,display_name)
select u.id,left(coalesce(nullif(btrim(u.raw_user_meta_data->>'display_name'),''),
                          nullif(split_part(coalesce(u.email,''),'@',1),''),
                          'Joueur'),30)
from auth.users u
where not exists(select 1 from public.profiles p where p.id=u.id)
on conflict(id) do nothing;

drop policy if exists profiles_select_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;

create policy profiles_select_self on public.profiles
for select to authenticated
using (id=auth.uid());

create policy profiles_insert_self on public.profiles
for insert to authenticated
with check (id=auth.uid());

create policy profiles_update_self on public.profiles
for update to authenticated
using (id=auth.uid()) with check (id=auth.uid());

grant select,insert,update on public.profiles to authenticated;


-- V3.2 : après révélation uniquement, les membres peuvent voir les réponses du vin.
-- Permet le classement intermédiaire et les récompenses sans exposer les réponses en cours.
drop policy if exists answers_select_revealed_members on public.answers;
create policy answers_select_revealed_members on public.answers
for select to authenticated
using (
  done=true
  and public.is_game_member(game_id)
  and exists(
    select 1 from public.wine_reveals r
    where r.game_id=answers.game_id and r.wine_id=answers.wine_id
  )
);

-- Realtime, de manière idempotente.
do $$
begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='games') then
    alter publication supabase_realtime add table public.games;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='players') then
    alter publication supabase_realtime add table public.players;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='answers') then
    alter publication supabase_realtime add table public.answers;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='wine_reveals') then
    alter publication supabase_realtime add table public.wine_reveals;
  end if;
end $$;


-- ============================================================
-- V3.4.1 : RPC PÉDAGOGIQUES CONTRÔLÉES
-- ============================================================

create or replace function public.get_discovery_wine(p_game_id uuid,p_wine_id uuid)
returns table(
  wine_id uuid,name text,price numeric,region text,grapes text[],
  learning_goal text,learning_note text,
  eye_tip text,nose_tip text,palate_tip text,
  quiz_question text,quiz_options jsonb
)
language sql stable security definer set search_path=public as $$
 select s.wine_id,s.name,s.price,s.region,s.grapes,
        s.learning_goal,s.learning_note,
        s.eye_tip,s.nose_tip,s.palate_tip,
        s.quiz_question,s.quiz_options
 from public.wine_secrets s
 join public.games g on g.id=s.game_id
 join public.wines w on w.id=s.wine_id and w.game_id=s.game_id
 where s.game_id=p_game_id and s.wine_id=p_wine_id
   and g.experience_mode='discovery'
   and w.position=g.current
   and g.status='tasting'
   and public.is_game_member(p_game_id);
$$;

create or replace function public.get_discovery_quiz_feedback(p_game_id uuid,p_wine_id uuid)
returns table(quiz_correct integer,quiz_explanation text)
language sql stable security definer set search_path=public as $$
 select
   case
     when btrim(s.quiz_question)<>''
      and jsonb_array_length(s.quiz_options)>=2
      and s.quiz_correct is not null
      and s.quiz_correct>=0
      and s.quiz_correct<jsonb_array_length(s.quiz_options)
     then s.quiz_correct else 0
   end,
   case
     when btrim(s.quiz_question)<>''
      and jsonb_array_length(s.quiz_options)>=2
      and s.quiz_correct is not null
      and s.quiz_correct>=0
      and s.quiz_correct<jsonb_array_length(s.quiz_options)
     then coalesce(nullif(btrim(s.quiz_explanation),''),
       'Observe la structure du vin et relie-la progressivement à son style.')
     else 'La progression vient surtout de la capacité à décrire ce que l’on ressent, puis à relier ces sensations au style du vin.'
   end
 from public.wine_secrets s
 join public.games g on g.id=s.game_id
 join public.wines w on w.id=s.wine_id and w.game_id=s.game_id
 join public.answers a
   on a.game_id=s.game_id and a.wine_id=s.wine_id and a.user_id=auth.uid()
 where s.game_id=p_game_id and s.wine_id=p_wine_id
   and g.experience_mode='discovery'
   and w.position=g.current
   and g.status='tasting'
   and public.is_game_member(p_game_id)
   and a.quiz_choice is not null;
$$;


create or replace function public.get_challenge_hints(p_game_id uuid,p_wine_id uuid)
returns table(hint1 text,hint2 text)
language sql
stable
security definer
set search_path=public
as $$
 select
   case when coalesce(a.hint_level,0)>=1 then s.hint1 else '' end,
   case when coalesce(a.hint_level,0)>=2 then s.hint2 else '' end
 from public.wine_secrets s
 join public.games g on g.id=s.game_id
 join public.wines w on w.id=s.wine_id and w.game_id=s.game_id
 left join public.answers a
   on a.game_id=s.game_id
  and a.wine_id=s.wine_id
  and a.user_id=auth.uid()
 where s.game_id=p_game_id
   and s.wine_id=p_wine_id
   and g.experience_mode='challenge'
   and g.status='tasting'
   and g.phase='answering'
   and w.position=g.current
   and public.is_game_member(p_game_id)
   and not public.is_game_host(p_game_id);
$$;

revoke all on function public.get_discovery_wine(uuid,uuid) from public;
revoke all on function public.get_discovery_quiz_feedback(uuid,uuid) from public;
revoke all on function public.get_challenge_hints(uuid,uuid) from public;
grant execute on function public.get_discovery_wine(uuid,uuid) to authenticated;
grant execute on function public.get_discovery_quiz_feedback(uuid,uuid) to authenticated;
grant execute on function public.get_challenge_hints(uuid,uuid) to authenticated;


create or replace function public.delete_game(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Non authentifié.';
  end if;

  if not exists (
    select 1
    from public.games g
    where g.id = p_game_id
      and g.host_id = auth.uid()
  ) then
    raise exception 'Seul l''organisateur peut supprimer cette partie.';
  end if;

  delete from public.games
  where id = p_game_id
    and host_id = auth.uid();
end;
$$;

revoke all on function public.delete_game(uuid) from public;
grant execute on function public.delete_game(uuid) to authenticated;
