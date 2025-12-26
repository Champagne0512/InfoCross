-- 重置临时沟通 RLS 策略，避免自引用导致递归

drop policy if exists "Prospects send interest chat" on public.team_interest_messages;
drop policy if exists "Prospects read interest chat" on public.team_interest_messages;
drop policy if exists "Owners reply interest chat" on public.team_interest_messages;
drop policy if exists "Owners read interest chat" on public.team_interest_messages;
drop policy if exists "Owners moderate interest chat" on public.team_interest_messages;

create policy "Prospects send interest chat" on public.team_interest_messages
  for insert
  with check (auth.uid() = sender_id);

create policy "Prospects read interest chat" on public.team_interest_messages
  for select using (auth.uid() = sender_id);

create policy "Owners reply interest chat" on public.team_interest_messages
  for insert
  with check (
    exists (
      select 1 from public.teams t
      where t.id = team_interest_messages.team_id
        and t.owner_id = auth.uid()
    )
  );

create policy "Owners read interest chat" on public.team_interest_messages
  for select using (
    exists (
      select 1 from public.teams t
      where t.id = team_interest_messages.team_id
        and t.owner_id = auth.uid()
    )
  );

create policy "Owners moderate interest chat" on public.team_interest_messages
  for delete using (
    exists (
      select 1 from public.teams t
      where t.id = team_interest_messages.team_id
        and t.owner_id = auth.uid()
    )
  );
