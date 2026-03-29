-- Add tags to products, guides, and projects
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.free_guides ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- GIN indexes for fast array searches
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_guides_tags ON public.free_guides USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN (tags);
