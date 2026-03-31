-- Add multi-file support to guides and projects
ALTER TABLE public.free_guides ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]';
