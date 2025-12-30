-- 完整修复临时聊天 RLS 策略
-- 问题：原有多个 SELECT 策略可能冲突，且条件过于严格

-- 删除所有旧的 SELECT 策略
drop policy if exists "Read interest chat" on public.team_interest_messages;
drop policy if exists "Prospects read interest chat" on public.team_interest_messages;
drop policy if exists "Owners read interest chat" on public.team_interest_messages;

-- 创建统一的读取策略
create policy "Read interest chat" on public.team_interest_messages
  for select using (
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
    )
  );
