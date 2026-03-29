-- Add focal point data for cover images
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image_focal jsonb;
ALTER TABLE public.free_guides ADD COLUMN IF NOT EXISTS cover_image_focal jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image_focal jsonb;
