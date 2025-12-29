-- 允许管理员查看所有用户的 profiles
-- 先删除旧策略（如果存在）
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 创建新策略：管理员可以查看所有用户
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id  -- 用户可以查看自己
    OR public.is_platform_admin(auth.uid())  -- 管理员可以查看所有人
  );

-- 删除旧的只能查看自己的策略
DROP POLICY IF EXISTS "Users read self profile" ON public.profiles;

-- 允许管理员更新任何用户的 is_admin 字段
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id  -- 用户可以更新自己
    OR public.is_platform_admin(auth.uid())  -- 管理员可以更新任何人
  );

-- 删除旧的只能更新自己的策略
DROP POLICY IF EXISTS "Users edit self profile" ON public.profiles;
