-- Switch from single section_id to multi-section via junction table
CREATE TABLE IF NOT EXISTS public.product_section_items (
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  section_id uuid REFERENCES public.product_sections(id) ON DELETE CASCADE NOT NULL,
  sort_order integer DEFAULT 0,
  PRIMARY KEY (product_id, section_id)
);

ALTER TABLE public.product_section_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view section items" ON public.product_section_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage section items" ON public.product_section_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update section items" ON public.product_section_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete section items" ON public.product_section_items FOR DELETE USING (public.is_admin());

-- Migrate existing section_id data to junction table
INSERT INTO public.product_section_items (product_id, section_id)
SELECT id, section_id FROM public.products WHERE section_id IS NOT NULL
ON CONFLICT DO NOTHING;
