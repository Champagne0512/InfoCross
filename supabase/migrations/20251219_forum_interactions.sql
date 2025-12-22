-- 论坛交互功能完善
-- 包含浏览量、点赞、评论的计数器更新

-- 1. 增加浏览量的函数
CREATE OR REPLACE FUNCTION increment_view_count(thread_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_threads
  SET view_count = view_count + 1
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 点赞帖子的函数（带计数器同步）
CREATE OR REPLACE FUNCTION toggle_thread_like(p_thread_id BIGINT, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_exists BOOLEAN;
  v_new_count INT;
BEGIN
  -- 检查是否已点赞
  SELECT EXISTS(
    SELECT 1 FROM forum_interactions
    WHERE thread_id = p_thread_id AND user_id = p_user_id AND type = 'like'
  ) INTO v_exists;

  IF v_exists THEN
    -- 取消点赞
    DELETE FROM forum_interactions
    WHERE thread_id = p_thread_id AND user_id = p_user_id AND type = 'like';
    
    UPDATE forum_threads
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = p_thread_id
    RETURNING like_count INTO v_new_count;
    
    RETURN jsonb_build_object('liked', false, 'likeCount', v_new_count);
  ELSE
    -- 添加点赞
    INSERT INTO forum_interactions (user_id, thread_id, type)
    VALUES (p_user_id, p_thread_id, 'like')
    ON CONFLICT (user_id, thread_id, type) DO NOTHING;
    
    UPDATE forum_threads
    SET like_count = like_count + 1
    WHERE id = p_thread_id
    RETURNING like_count INTO v_new_count;
    
    RETURN jsonb_build_object('liked', true, 'likeCount', v_new_count);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 点赞评论的函数
CREATE OR REPLACE FUNCTION toggle_comment_like(p_comment_id BIGINT, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_exists BOOLEAN;
  v_new_count INT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM forum_interactions
    WHERE comment_id = p_comment_id AND user_id = p_user_id AND type = 'like'
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM forum_interactions
    WHERE comment_id = p_comment_id AND user_id = p_user_id AND type = 'like';
    
    UPDATE forum_comments
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = p_comment_id
    RETURNING like_count INTO v_new_count;
    
    RETURN jsonb_build_object('liked', false, 'likeCount', v_new_count);
  ELSE
    INSERT INTO forum_interactions (user_id, comment_id, type)
    VALUES (p_user_id, p_comment_id, 'like')
    ON CONFLICT (user_id, comment_id, type) DO NOTHING;
    
    UPDATE forum_comments
    SET like_count = like_count + 1
    WHERE id = p_comment_id
    RETURNING like_count INTO v_new_count;
    
    RETURN jsonb_build_object('liked', true, 'likeCount', v_new_count);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 评论计数触发器
CREATE OR REPLACE FUNCTION update_thread_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads
    SET comment_count = comment_count + 1
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads
    SET comment_count = GREATEST(comment_count - 1, 0)
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS trigger_update_comment_count ON forum_comments;

-- 创建触发器
CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION update_thread_comment_count();

-- 5. 收藏帖子的函数
CREATE OR REPLACE FUNCTION toggle_thread_bookmark(p_thread_id BIGINT, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_exists BOOLEAN;
  v_new_count INT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM forum_interactions
    WHERE thread_id = p_thread_id AND user_id = p_user_id AND type = 'bookmark'
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM forum_interactions
    WHERE thread_id = p_thread_id AND user_id = p_user_id AND type = 'bookmark';

    UPDATE forum_threads
    SET bookmark_count = GREATEST(bookmark_count - 1, 0)
    WHERE id = p_thread_id
    RETURNING bookmark_count INTO v_new_count;

    RETURN jsonb_build_object('bookmarked', false, 'bookmarkCount', v_new_count);
  ELSE
    INSERT INTO forum_interactions (user_id, thread_id, type)
    VALUES (p_user_id, p_thread_id, 'bookmark')
    ON CONFLICT (user_id, thread_id, type) DO NOTHING;

    UPDATE forum_threads
    SET bookmark_count = bookmark_count + 1
    WHERE id = p_thread_id
    RETURNING bookmark_count INTO v_new_count;

    RETURN jsonb_build_object('bookmarked', true, 'bookmarkCount', v_new_count);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 分享计数函数
CREATE OR REPLACE FUNCTION increment_share_count(p_thread_id BIGINT, p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_new_count INT;
BEGIN
  -- 记录分享行为
  INSERT INTO forum_interactions (user_id, thread_id, type)
  VALUES (p_user_id, p_thread_id, 'share')
  ON CONFLICT (user_id, thread_id, type) DO NOTHING;
  
  -- 增加分享计数
  UPDATE forum_threads
  SET share_count = share_count + 1
  WHERE id = p_thread_id
  RETURNING share_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 添加 forum_interactions 的 RLS 策略
CREATE POLICY "Users can view own interactions" ON forum_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interactions" ON forum_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON forum_interactions
  FOR DELETE USING (auth.uid() = user_id);
