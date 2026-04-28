
-- 1. Recreate role enum: drop dependents, swap admin -> manager, add user
DROP POLICY IF EXISTS "Admins write destinations" ON public.destinations;
DROP POLICY IF EXISTS "Admins write hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins write restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admins write transport" ON public.transport;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Bootstrap first admin" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- swap enum
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('user', 'manager');

ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role
  USING (CASE WHEN role::text = 'admin' THEN 'manager' ELSE 'user' END)::public.app_role;

DROP TYPE public.app_role_old;

-- recreate has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- recreate policies on existing tables (managers write, public reads)
CREATE POLICY "Managers write destinations" ON public.destinations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers write hotels" ON public.hotels
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers write restaurants" ON public.restaurants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers write transport" ON public.transport
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Users view own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Managers view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Bootstrap first manager" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'manager'
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'manager')
  );

-- 2. Extend hotels & restaurants
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS near_destination text;
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS address text;

-- 3. profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_set_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-create profile + user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, destination_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users insert own review" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own review" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own review" ON public.reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Managers manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER reviews_set_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- recalc destination avg rating from reviews
CREATE OR REPLACE FUNCTION public.refresh_destination_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _dest uuid;
BEGIN
  _dest := COALESCE(NEW.destination_id, OLD.destination_id);
  UPDATE public.destinations
  SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE destination_id = _dest), rating)
  WHERE id = _dest;
  RETURN NULL;
END;
$$;
CREATE TRIGGER reviews_refresh_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_destination_rating();

-- 5. wishlists
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, destination_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wishlist owner select" ON public.wishlists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Wishlist owner insert" ON public.wishlists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Wishlist owner delete" ON public.wishlists
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Managers view all wishlists" ON public.wishlists
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'manager'));

-- 6. tour_plans
CREATE TABLE public.tour_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  destinations uuid[] NOT NULL DEFAULT '{}',
  start_date date,
  end_date date,
  num_people integer NOT NULL DEFAULT 1,
  estimated_budget integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tour_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tour owner all" ON public.tour_plans
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers view all tours" ON public.tour_plans
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER tour_plans_set_updated BEFORE UPDATE ON public.tour_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. search_logs
CREATE TABLE public.search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  search_query text NOT NULL,
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone log search" ON public.search_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner read own logs" ON public.search_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner delete own logs" ON public.search_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Managers read all logs" ON public.search_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'manager'));
CREATE INDEX idx_search_logs_user ON public.search_logs(user_id, created_at DESC);
CREATE INDEX idx_search_logs_created ON public.search_logs(created_at DESC);

-- 8. scrape_queue
CREATE TABLE public.scrape_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  scraped_data jsonb,
  triggered_by text NOT NULL DEFAULT 'auto',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
ALTER TABLE public.scrape_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved scrapes are public" ON public.scrape_queue
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone create pending scrape" ON public.scrape_queue
  FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY "Managers manage scrapes" ON public.scrape_queue
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'manager'));
