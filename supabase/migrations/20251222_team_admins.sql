-- 协作空间管理员与权限扩展

-- 1. team_members 增加管理员标记
alter table team_members
  add column if not exists is_admin boolean default false;

update team_members
set is_admin = true
where coalesce(is_owner, false) = true;

-- 2. 提供统一的管理员判定函数
create or replace function public.is_team_admin(p_team_id bigint, p_user_id uuid)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  if p_user_id is null then
    return false;
  end if;
  return exists (
    select 1 from public.teams t
    where t.id = p_team_id and t.owner_id = p_user_id
  )
  or exists (
    select 1 from public.team_members tm
    where tm.team_id = p_team_id
      and tm.member_id = p_user_id
      and coalesce(tm.is_admin, false)
      and tm.status = 'approved'
  );
end;
$$;

-- 3. 更新 teams 策略（允许管理员编辑基本信息）
drop policy if exists "Owners manage own teams" on public.teams;
create policy "Admins manage teams" on public.teams
  for update using (public.is_team_admin(id, auth.uid()))
  with check (public.is_team_admin(id, auth.uid()));

drop policy if exists "Owners delete teams" on public.teams;
create policy "Owners delete teams" on public.teams
  for delete using (auth.uid() = owner_id);

-- 4. team_members 策略允许管理员管理成员
drop policy if exists "Members manage own membership" on public.team_members;
create policy "Members manage own membership" on public.team_members
  for delete using (
    auth.uid() = member_id
    or public.is_team_admin(team_id, auth.uid())
  );

drop policy if exists "Owners approve members" on public.team_members;
create policy "Admins update members" on public.team_members
  for update using (public.is_team_admin(team_id, auth.uid()))
  with check (public.is_team_admin(team_id, auth.uid()));

-- 5. workspace 相关策略同步管理员权限
drop policy if exists "Owners update applications" on team_applications;
create policy "Admins update applications" on team_applications
  for update using (public.is_team_admin(team_id, auth.uid()));

drop policy if exists "Team members send chat" on team_chat_messages;
create policy "Team members send chat" on team_chat_messages
  for insert with check (
    public.is_team_admin(team_id, auth.uid())
    or exists (
      select 1 from team_members tm where tm.team_id = team_chat_messages.team_id and tm.member_id = auth.uid()
    )
  );

drop policy if exists "Team members manage tasks" on team_tasks;
create policy "Admins manage tasks" on team_tasks
  for insert with check (public.is_team_admin(team_id, auth.uid()));

drop policy if exists "Team members update tasks" on team_tasks;
create policy "Admins update tasks" on team_tasks
  for update using (public.is_team_admin(team_id, auth.uid()));

drop policy if exists "Team members upload files" on team_files;
create policy "Admins upload files" on team_files
  for insert with check (public.is_team_admin(team_id, auth.uid()));
