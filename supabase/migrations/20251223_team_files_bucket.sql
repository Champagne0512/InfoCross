-- 创建 team-files 存储桶并开放给认证用户上传/读取

insert into storage.buckets (id, name, public)
values ('team-files', 'team-files', true)
on conflict (id) do nothing;

drop policy if exists "Team files read" on storage.objects;
create policy "Team files read" on storage.objects
  for select using (bucket_id = 'team-files' and auth.role() = 'authenticated');

drop policy if exists "Team files upload" on storage.objects;
create policy "Team files upload" on storage.objects
  for insert with check (bucket_id = 'team-files' and auth.role() = 'authenticated');
