-- 创建 avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 设置 avatars bucket 的访问策略
-- 允许所有用户读取头像
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 允许用户上传自己的头像
create policy "Users can upload own avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户更新自己的头像
create policy "Users can update own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户删除自己的头像
create policy "Users can delete own avatar."
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
