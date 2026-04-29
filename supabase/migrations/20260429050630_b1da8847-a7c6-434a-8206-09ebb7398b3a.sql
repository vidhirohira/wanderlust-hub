ALTER TABLE public.tour_plans ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';