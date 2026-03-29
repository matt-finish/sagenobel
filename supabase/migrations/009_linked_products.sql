ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS linked_product_ids jsonb DEFAULT '[]';
