-- Add hero CTA settings
INSERT INTO public.site_settings (key, value)
VALUES ('hero_cta', '{"text": "Explore the Blog", "link": "/blog"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES ('hero_cta_secondary', '{"text": "Shop Products", "link": "/products"}')
ON CONFLICT (key) DO NOTHING;
