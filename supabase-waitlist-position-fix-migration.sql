-- Fix: waitlist position was computed against a partitioned universe.
--
-- Old definitions filtered the row_number() partition to rows of the
-- same signup method (`where pubkey is not null` and the mirror clause
-- for email), so a wallet signup got their rank inside the wallet-only
-- subset (~636 rows at time of fix) and an email signup got their rank
-- inside the email-only subset (~364 rows). Both subsets are about half
-- the real list (~1,844), so every user's "#N on the list" card
-- understated their position by ~half.
--
-- New definitions row_number() over the ENTIRE table and only filter at
-- the very end. created_at + id provides a deterministic tiebreaker so
-- the same row gets the same number on every call.
--
-- Safe to apply: `create or replace function` — no data touched.

create or replace function public.waitlist_position(p_pubkey text)
returns bigint
language sql
security definer
set search_path = public
as $$
  with ordered as (
    select pubkey, row_number() over (order by created_at asc, id asc) as pos
    from public.waitlist
  )
  select pos from ordered where pubkey = p_pubkey;
$$;

-- Caller is the service-role client in the signup route; anon stays revoked.
revoke execute on function public.waitlist_position(text) from anon;

create or replace function public.waitlist_position_by_email(p_email text)
returns bigint
language sql
security definer
set search_path = public
as $$
  with ordered as (
    select email, row_number() over (order by created_at asc, id asc) as pos
    from public.waitlist
  )
  select pos from ordered where lower(email) = lower(p_email);
$$;

revoke execute on function public.waitlist_position_by_email(text) from anon;
