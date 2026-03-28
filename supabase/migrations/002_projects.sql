-- ============================================
-- PROJECTS
-- ============================================
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  gallery_images jsonb default '[]',
  video_urls jsonb default '[]',
  product_links jsonb default '[]',
  guide_ids jsonb default '[]',
  -- Section visibility toggles
  show_gallery boolean default true,
  show_videos boolean default true,
  show_guides boolean default true,
  show_products boolean default true,
  show_order_form boolean default false,
  show_reviews boolean default true,
  -- Order form config
  order_form_fields jsonb default '[]',
  order_form_instructions text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Anyone can view published projects"
  on public.projects for select
  using (is_published = true);

create policy "Admins can view all projects"
  on public.projects for select
  using (public.is_admin());

create policy "Admins can create projects"
  on public.projects for insert
  with check (public.is_admin());

create policy "Admins can update projects"
  on public.projects for update
  using (public.is_admin());

create policy "Admins can delete projects"
  on public.projects for delete
  using (public.is_admin());

create index idx_projects_slug on public.projects(slug);
create index idx_projects_published on public.projects(is_published, created_at desc);

create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- ============================================
-- PROJECT REVIEWS
-- ============================================
create table public.project_reviews (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  reviewer_name text not null,
  reviewer_email text not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  images jsonb default '[]',
  is_approved boolean default false,
  created_at timestamptz default now()
);

alter table public.project_reviews enable row level security;

create policy "Anyone can view approved reviews"
  on public.project_reviews for select
  using (is_approved = true);

create policy "Admins can view all reviews"
  on public.project_reviews for select
  using (public.is_admin());

create policy "Anyone can submit a review"
  on public.project_reviews for insert
  with check (true);

create policy "Admins can update reviews"
  on public.project_reviews for update
  using (public.is_admin());

create policy "Admins can delete reviews"
  on public.project_reviews for delete
  using (public.is_admin());

create index idx_reviews_project on public.project_reviews(project_id);
create index idx_reviews_approved on public.project_reviews(is_approved);

-- ============================================
-- PROJECT SUBMISSIONS (order form)
-- ============================================
create table public.project_submissions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  submitter_name text not null,
  submitter_email text not null,
  form_data jsonb default '{}',
  status text default 'new' check (status in ('new', 'reviewed', 'completed')),
  created_at timestamptz default now()
);

alter table public.project_submissions enable row level security;

create policy "Anyone can submit"
  on public.project_submissions for insert
  with check (true);

create policy "Admins can view submissions"
  on public.project_submissions for select
  using (public.is_admin());

create policy "Admins can update submissions"
  on public.project_submissions for update
  using (public.is_admin());

create index idx_submissions_project on public.project_submissions(project_id);
