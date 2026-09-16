create or replace function public.set_commercial_consent(p_game_id uuid,p_consent boolean)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if auth.uid() is null then raise exception 'Authentification requise.'; end if;
  if not exists(select 1 from public.players p where p.game_id=p_game_id and p.user_id=auth.uid()) then
    raise exception 'Participation introuvable.';
  end if;
  if exists(select 1 from public.games g where g.id=p_game_id and g.status='finished') then
    raise exception 'Le consentement ne peut plus être modifié après la fin de la partie.';
  end if;
  update public.players
     set commercial_consent=coalesce(p_consent,false),
         commercial_consent_at=case when coalesce(p_consent,false) then coalesce(commercial_consent_at,now()) else null end
   where game_id=p_game_id and user_id=auth.uid();
end;
$$;
revoke all on function public.set_commercial_consent(uuid,boolean) from public;
grant execute on function public.set_commercial_consent(uuid,boolean) to authenticated;
