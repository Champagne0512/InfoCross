-- 允许未提交申请的潜在成员向队长发送临时沟通消息

drop policy if exists "Prospects send interest chat" on public.team_interest_messages;

create policy "Prospects send interest chat" on public.team_interest_messages
  for insert
  with check (
    auth.uid() = sender_id
  );
