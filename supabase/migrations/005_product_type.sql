-- Add product type and affiliate URL
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'custom' CHECK (product_type IN ('custom', 'affiliate'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS affiliate_url text;
-- Make price_cents nullable for affiliate products (they don't have a price on our site)
ALTER TABLE public.products ALTER COLUMN price_cents DROP NOT NULL;
