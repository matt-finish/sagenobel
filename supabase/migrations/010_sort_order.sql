-- Add sort_order to all content tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.free_guides ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
