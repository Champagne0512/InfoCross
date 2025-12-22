-- 为论坛帖子添加收藏计数字段
ALTER TABLE forum_threads
  ADD COLUMN IF NOT EXISTS bookmark_count INT DEFAULT 0;

-- 兜底，避免旧数据出现 null
UPDATE forum_threads
SET bookmark_count = 0
WHERE bookmark_count IS NULL;
