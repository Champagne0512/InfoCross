-- 强制加入审批流程：仅管理员可添加成员

-- 删除用户直接加入的策略
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'team_members'
      AND policyname = 'Users join team'
  ) THEN
    EXECUTE 'drop policy "Users join team" on public.team_members';
  END IF;
END $$;

-- 新增管理员添加成员策略
drop policy if exists "Admins add members" on public.team_members;
create policy "Admins add members" on public.team_members
  for insert
  with check (public.is_team_admin(team_id, auth.uid()));
