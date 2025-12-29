-- 检查当前所有用户的管理员状态
-- 你可以在 Supabase SQL Editor 中运行这个查询

-- 1. 查看所有用户的管理员状态
SELECT 
  id,
  email,
  username,
  is_admin,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. 设置特定邮箱为管理员（替换成你的邮箱）
-- UPDATE profiles 
-- SET is_admin = true 
-- WHERE email = 'your-email@example.com';

-- 3. 设置 test1@qq.com 为管理员
UPDATE profiles 
SET is_admin = true 
WHERE email = 'test1@qq.com';

-- 4. 设置 student@infocross.edu 为管理员
UPDATE profiles 
SET is_admin = true 
WHERE email = 'student@infocross.edu';

-- 5. 再次查看结果
SELECT 
  id,
  email,
  username,
  is_admin
FROM profiles
WHERE is_admin = true;
