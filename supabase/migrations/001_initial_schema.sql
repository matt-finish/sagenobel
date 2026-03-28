-- ============================================
-- Sage Nobel - Database Schema
-- ============================================

-- ============================================
-- PROFILES (created first so is_admin() can reference it)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  totp_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Helper function: check if current user is admin
-- (defined after profiles table exists)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$ language sql security definer;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile (non-admin fields)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
    and totp_verified = (select totp_verified from public.profiles where id = auth.uid())
  );

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- BLOG POSTS
-- ============================================
create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content jsonb default '{}',
  excerpt text,
  cover_image_url text,
  is_featured boolean default false,
  is_published boolean default false,
  author_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts enable row level security;

create policy "Anyone can view published posts"
  on public.blog_posts for select
  using (is_published = true);

create policy "Admins can view all posts"
  on public.blog_posts for select
  using (public.is_admin());

create policy "Admins can create posts"
  on public.blog_posts for insert
  with check (public.is_admin());

create policy "Admins can update posts"
  on public.blog_posts for update
  using (public.is_admin());

create policy "Admins can delete posts"
  on public.blog_posts for delete
  using (public.is_admin());

-- Ensure only one featured blog post at a time
create or replace function public.ensure_single_featured_blog()
returns trigger as $$
begin
  if new.is_featured = true then
    update public.blog_posts
    set is_featured = false
    where id != new.id and is_featured = true;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger enforce_single_featured_blog
  before insert or update on public.blog_posts
  for each row execute function public.ensure_single_featured_blog();

-- ============================================
-- PRODUCTS
-- ============================================
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  images jsonb default '[]',
  custom_fields jsonb default '[]',
  is_active boolean default true,
  stripe_price_id text,
  inventory_count integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy "Admins can view all products"
  on public.products for select
  using (public.is_admin());

create policy "Admins can create products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ============================================
-- ORDERS
-- ============================================
create type public.order_status as enum (
  'pending', 'paid', 'in_progress', 'fulfilled', 'complete'
);

create table public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique,
  user_id uuid references public.profiles(id),
  email text not null,
  full_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip_code text not null,
  status public.order_status default 'pending',
  total_cents integer not null check (total_cents >= 0),
  stripe_session_id text unique,
  tracking_number text,
  tracking_carrier text,
  tracking_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

-- Orders are created by the service role (webhook), so no insert policy for users

-- Generate order number
create or replace function public.generate_order_number()
returns trigger as $$
declare
  seq_num integer;
begin
  select count(*) + 1 into seq_num
  from public.orders
  where created_at::date = now()::date;

  new.order_number := 'SN-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq_num::text, 4, '0');
  return new;
end;
$$ language plpgsql security definer;

create trigger set_order_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- Auto-generate tracking URL
create or replace function public.generate_tracking_url()
returns trigger as $$
begin
  if new.tracking_number is not null and new.tracking_carrier is not null then
    new.tracking_url := case lower(new.tracking_carrier)
      when 'usps' then 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' || new.tracking_number
      when 'ups' then 'https://www.ups.com/track?tracknum=' || new.tracking_number
      when 'fedex' then 'https://www.fedex.com/fedextrack/?trknbr=' || new.tracking_number
      else null
    end;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger set_tracking_url
  before insert or update on public.orders
  for each row execute function public.generate_tracking_url();

-- ============================================
-- ORDER ITEMS
-- ============================================
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  product_name text not null,
  product_price_cents integer not null,
  quantity integer not null default 1 check (quantity > 0),
  custom_field_values jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.order_items enable row level security;

create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

-- ============================================
-- FREE GUIDES
-- ============================================
create table public.free_guides (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  file_url text,
  content jsonb,
  guide_type text not null default 'download' check (guide_type in ('download', 'article')),
  download_count integer default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.free_guides enable row level security;

create policy "Anyone can view published guides"
  on public.free_guides for select
  using (is_published = true);

create policy "Admins can view all guides"
  on public.free_guides for select
  using (public.is_admin());

create policy "Admins can create guides"
  on public.free_guides for insert
  with check (public.is_admin());

create policy "Admins can update guides"
  on public.free_guides for update
  using (public.is_admin());

create policy "Admins can delete guides"
  on public.free_guides for delete
  using (public.is_admin());

-- ============================================
-- SITE SETTINGS
-- ============================================
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

create policy "Anyone can read settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update settings"
  on public.site_settings for update
  using (public.is_admin());

create policy "Admins can insert settings"
  on public.site_settings for insert
  with check (public.is_admin());

-- Default settings
insert into public.site_settings (key, value) values
  ('hero', '{"title": "Curating Experiences & Environments", "subtitle": "Travel, hosting, home decor, and inspiration for intentional living.", "cta_text": "Explore the Blog", "cta_link": "/blog"}'),
  ('site_name', '"Sage Nobel"');

-- ============================================
-- INDEXES
-- ============================================
create index idx_blog_posts_slug on public.blog_posts(slug);
create index idx_blog_posts_published on public.blog_posts(is_published, created_at desc);
create index idx_blog_posts_featured on public.blog_posts(is_featured) where is_featured = true;
create index idx_products_slug on public.products(slug);
create index idx_products_active on public.products(is_active, created_at desc);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_number on public.orders(order_number);
create index idx_order_items_order on public.order_items(order_id);
create index idx_free_guides_slug on public.free_guides(slug);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger set_free_guides_updated_at before update on public.free_guides
  for each row execute function public.set_updated_at();
create trigger set_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
