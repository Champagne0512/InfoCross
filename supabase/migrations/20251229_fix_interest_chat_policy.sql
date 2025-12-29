-- 修复临时聊天（私聊）的 RLS 策略，让申请者和队长双方都能看到完整对话

-- 删除旧的有问题的策略
drop policy if exists "Prospects read interest chat" on public.team_interest_messages;
drop policy if exists "Owners read interest chat" on public.team_interest_messages;

-- 创建新的统一读取策略：
-- 场景：申请者 A 和小组 X 的队长 B 之间的私聊
-- A 应该能看到：自己发的消息 + B 发给小组 X 的消息（队长回复）
-- B 应该能看到：所有发给小组 X 的消息
create policy "Read interest chat" on public.team_interest_messages
  for select using (
    -- 自己发的消息
    sender_id = auth.uid()
    -- 队长可以看到发给自己小组的所有消息
    or exists (
      select 1 from public.teams t
      where t.id = team_interest_messages.team_id
        and t.owner_id = auth.uid()
    )
    -- 申请者可以看到队长在自己参与的对话中的回复
    -- 即：如果我曾经向某个小组发过消息，我就能看到该小组的所有临时聊天消息
    or exists (
      select 1 from public.team_interest_messages my_msg
      where my_msg.team_id = team_interest_messages.team_id
        and my_msg.sender_id = auth.uid()
    )
  );
