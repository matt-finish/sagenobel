ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_focal jsonb;
