-- 修复临时聊天读取策略，允许任何登录用户查看特定小组的消息
-- 这样用户在发送第一条消息之前也能看到聊天界面（即使是空的）

-- 删除旧策略
drop policy if exists "Read interest chat" on public.team_interest_messages;

-- 创建新的读取策略
create policy "Read interest chat" on public.team_interest_messages
  for select using (
    -- 必须登录
    auth.uid() is not null
    and (
      -- 自己发的消息
      sender_id = auth.uid()
      -- 队长可以看到发给自己小组的所有消息
      or exists (
        select 1 from public.teams t
        where t.id = team_interest_messages.team_id
          and t.owner_id = auth.uid()
      )
      -- 申请者可以看到自己参与的对话（曾经发过消息的小组）
      or exists (
        select 1 from public.team_interest_messages my_msg
        where my_msg.team_id = team_interest_messages.team_id
          and my_msg.sender_id = auth.uid()
      )
      -- 已提交申请的用户可以看到该小组的消息
      or exists (
        select 1 from public.team_applications ta
        where ta.team_id = team_interest_messages.team_id
          and ta.applicant_id = auth.uid()
      )
    )
  );
