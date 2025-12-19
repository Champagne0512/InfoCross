-- 为 profiles 表添加 default_mode 字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_mode TEXT DEFAULT 'focus';

-- 添加约束确保只能是 'focus' 或 'vibe'
ALTER TABLE profiles ADD CONSTRAINT check_default_mode 
  CHECK (default_mode IN ('focus', 'vibe'));
