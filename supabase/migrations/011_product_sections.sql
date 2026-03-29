-- Product sections for grouping products on the shop page
CREATE TABLE public.product_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible sections" ON public.product_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can view all sections" ON public.product_sections FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can create sections" ON public.product_sections FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update sections" ON public.product_sections FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete sections" ON public.product_sections FOR DELETE USING (public.is_admin());

CREATE TRIGGER set_product_sections_updated_at BEFORE UPDATE ON public.product_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add section_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.product_sections(id) ON DELETE SET NULL;
