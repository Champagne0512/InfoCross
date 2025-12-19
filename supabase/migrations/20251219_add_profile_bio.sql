-- 添加个性签名字段到 profiles 表
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- 添加字段注释
COMMENT ON COLUMN public.profiles.bio IS '用户个性签名，最多100字符';
