-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Destinations
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  type TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  entry_fee_indian TEXT,
  entry_fee_foreigner TEXT,
  timings TEXT,
  best_time TEXT,
  description TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Admins write destinations" ON public.destinations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Hotels
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT NOT NULL,
  price_per_night INTEGER NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  contact TEXT,
  near TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admins write hotels" ON public.hotels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Restaurants
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  price_range TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  specialty TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Admins write restaurants" ON public.restaurants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Transport
CREATE TABLE public.transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  mode TEXT NOT NULL,
  operator TEXT,
  duration TEXT NOT NULL,
  cost_min INTEGER NOT NULL,
  cost_max INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read transport" ON public.transport FOR SELECT USING (true);
CREATE POLICY "Admins write transport" ON public.transport FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
