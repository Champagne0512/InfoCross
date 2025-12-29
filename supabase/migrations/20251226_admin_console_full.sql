-- InfoCross 管理后台一体化 SQL（可单次执行）

-- 1. profiles 增加 is_admin 字段
alter table public.profiles
  add column if not exists is_admin boolean default false;

-- 2. 核心管理员判定函数（带参数）
create or replace function public.is_platform_admin(p_user_id uuid default auth.uid())
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  target_user uuid := coalesce(p_user_id, auth.uid());
  result boolean;
begin
  if target_user is null then
    return false;
  end if;
  select coalesce(pr.is_admin, false) into result
  from public.profiles pr
  where pr.id = target_user;
  return coalesce(result, false);
end;
$$;

grant execute on function public.is_platform_admin(uuid) to authenticated, anon;

-- 3. 无参包装，便于直接调用及 GRANT
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_platform_admin(auth.uid());
$$;

grant execute on function public.is_platform_admin() to authenticated, anon;

-- 4. Admin 仪表盘聚合数据
create or replace function public.admin_dashboard_stats()
returns table(
  total_articles bigint,
  active_teams bigint,
  pending_applications bigint,
  new_users_7d bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'permission denied for admin dashboard';
  end if;
  return query
  select
    (select count(*) from public.articles),
    (select count(*) from public.teams where status in ('recruiting', 'full')),
    (select count(*) from public.team_applications where status = 'pending'),
    (select count(*) from public.profiles where created_at >= now() - interval '7 days');
end;
$$;

grant execute on function public.admin_dashboard_stats() to authenticated, anon;

-- 5. Admin 近期申请列表
create or replace function public.admin_recent_applications(limit_count integer default 8)
returns table(
  application_id bigint,
  created_at timestamptz,
  team_id bigint,
  team_name text,
  mode text,
  status text,
  applicant_id uuid,
  applicant_name text,
  applicant_college text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'permission denied for admin applications';
  end if;
  return query
  select
    ta.id,
    ta.created_at,
    ta.team_id,
    t.name,
    ta.mode,
    ta.status,
    ta.applicant_id,
    p.username,
    p.college,
    ta.message
  from public.team_applications ta
  join public.teams t on t.id = ta.team_id
  join public.profiles p on p.id = ta.applicant_id
  order by ta.created_at desc
  limit coalesce(limit_count, 8);
end;
$$;

grant execute on function public.admin_recent_applications(integer) to authenticated;
grant execute on function public.admin_recent_applications() to authenticated;
