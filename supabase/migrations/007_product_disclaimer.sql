ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_disclaimer boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS disclaimer text;
