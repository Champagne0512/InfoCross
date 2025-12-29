-- 修复申请审批的 RLS 策略
-- 问题：队长无法更新申请状态

-- 删除旧策略
DROP POLICY IF EXISTS "Admins update applications" ON team_applications;
DROP POLICY IF EXISTS "Owners update applications" ON team_applications;

-- 创建新策略：队长或管理员可以更新申请
CREATE POLICY "Team owners and admins can update applications" ON team_applications
  FOR UPDATE
  USING (
    -- 队长可以更新
    EXISTS (
      SELECT 1 FROM teams t 
      WHERE t.id = team_applications.team_id 
      AND t.owner_id = auth.uid()
    )
    -- 或者是小组管理员
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_applications.team_id
      AND tm.member_id = auth.uid()
      AND tm.is_admin = true
      AND tm.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t 
      WHERE t.id = team_applications.team_id 
      AND t.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_applications.team_id
      AND tm.member_id = auth.uid()
      AND tm.is_admin = true
      AND tm.status = 'approved'
    )
  );

-- 同时确保队长可以插入成员（审批通过后添加成员）
DROP POLICY IF EXISTS "Team owners insert members" ON team_members;

CREATE POLICY "Team owners and admins insert members" ON team_members
  FOR INSERT
  WITH CHECK (
    -- 自己申请加入
    auth.uid() = member_id
    -- 或者是队长添加
    OR EXISTS (
      SELECT 1 FROM teams t 
      WHERE t.id = team_members.team_id 
      AND t.owner_id = auth.uid()
    )
    -- 或者是管理员添加
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.member_id = auth.uid()
      AND tm.is_admin = true
      AND tm.status = 'approved'
    )
  );
