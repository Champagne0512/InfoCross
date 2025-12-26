-- 避免 RLS 递归：重写读取策略

drop policy if exists "Prospects read interest chat" on public.team_interest_messages;
drop policy if exists "Owners read interest chat" on public.team_interest_messages;

create policy "Prospects read interest chat" on public.team_interest_messages
  for select using (
    sender_id = auth.uid()
  );

create policy "Owners read interest chat" on public.team_interest_messages
  for select using (
    exists (
      select 1
      from public.teams t
      where t.id = team_interest_messages.team_id
        and t.owner_id = auth.uid()
    )
  );
