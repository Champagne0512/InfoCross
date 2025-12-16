-- 自动同步 auth.users -> profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_username text;
BEGIN
  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, v_username)
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    username = coalesce(excluded.username, public.profiles.username);

  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS 策略：允许用户读写自己的 profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert self profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read self profile" ON public.profiles;
DROP POLICY IF EXISTS "Users edit self profile" ON public.profiles;

CREATE POLICY "Users insert self profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users read self profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users edit self profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
