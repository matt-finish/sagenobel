-- Add promoted flag for projects (homepage featured)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_promoted boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_projects_promoted ON public.projects(is_promoted) WHERE is_promoted = true;

-- Insert default section visibility setting
INSERT INTO public.site_settings (key, value)
VALUES ('sections', '{"blog": true, "projects": true, "products": true, "guides": true}')
ON CONFLICT (key) DO NOTHING;
