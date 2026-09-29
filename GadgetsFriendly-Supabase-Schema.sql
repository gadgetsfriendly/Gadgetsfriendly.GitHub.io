-- GadgetsFriendly production database
-- Supabase/PostgreSQL
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Public product catalogue. NEVER put serial/IMEI values in this table.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('mac','apple','accessories')),
  price numeric(14,2) not null default 0 check (price >= 0),
  description text not null default '',
  is_new boolean not null default false,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Private inventory identifiers. Separate table so public catalogue reads
-- can never expose serial/IMEI values.
create table if not exists public.product_private (
  product_id uuid primary key references public.products(id) on delete cascade,
  identifier_type text not null check (identifier_type in ('none','serial','imei')),
  identifier text,
  updated_at timestamptz not null default now()
);

create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  device text not null,
  model text not null,
  problem text not null,
  preferred_date date,
  status text not null default 'new'
    check (status in ('new','in-progress','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  note text not null default '',
  items jsonb not null default '[]'::jsonb,
  total numeric(14,2) not null default 0 check (total >= 0),
  status text not null default 'new'
    check (status in ('new','in-progress','completed')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional audit trail for important admin actions.
create table if not exists public.admin_audit (
  id bigint generated always as identity primary key,
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Admin role: create an Auth user in Supabase, then add app_metadata.role='admin'.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists product_private_updated_at on public.product_private;
create trigger product_private_updated_at
before update on public.product_private
for each row execute function public.set_updated_at();

drop trigger if exists repairs_updated_at on public.repairs;
create trigger repairs_updated_at
before update on public.repairs
for each row execute function public.set_updated_at();

drop trigger if exists purchases_updated_at on public.purchases;
create trigger purchases_updated_at
before update on public.purchases
for each row execute function public.set_updated_at();

-- Enable RLS.
alter table public.products enable row level security;
alter table public.product_private enable row level security;
alter table public.repairs enable row level security;
alter table public.purchases enable row level security;
alter table public.admin_audit enable row level security;

-- PRODUCTS
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using (public.is_admin());

-- PRIVATE IDENTIFIERS: admins only.
drop policy if exists "Admins can read private identifiers" on public.product_private;
create policy "Admins can read private identifiers"
on public.product_private for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert private identifiers" on public.product_private;
create policy "Admins can insert private identifiers"
on public.product_private for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update private identifiers" on public.product_private;
create policy "Admins can update private identifiers"
on public.product_private for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete private identifiers" on public.product_private;
create policy "Admins can delete private identifiers"
on public.product_private for delete
to authenticated
using (public.is_admin());

-- REPAIRS: visitors can submit; only admins can read/manage.
drop policy if exists "Visitors can submit repairs" on public.repairs;
create policy "Visitors can submit repairs"
on public.repairs for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read repairs" on public.repairs;
create policy "Admins can read repairs"
on public.repairs for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update repairs" on public.repairs;
create policy "Admins can update repairs"
on public.repairs for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete repairs" on public.repairs;
create policy "Admins can delete repairs"
on public.repairs for delete
to authenticated
using (public.is_admin());

-- PURCHASES: visitors can submit; only admins can read/manage.
drop policy if exists "Visitors can submit purchases" on public.purchases;
create policy "Visitors can submit purchases"
on public.purchases for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read purchases" on public.purchases;
create policy "Admins can read purchases"
on public.purchases for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update purchases" on public.purchases;
create policy "Admins can update purchases"
on public.purchases for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete purchases" on public.purchases;
create policy "Admins can delete purchases"
on public.purchases for delete
to authenticated
using (public.is_admin());

-- AUDIT: admin only.
drop policy if exists "Admins can read audit" on public.admin_audit;
create policy "Admins can read audit"
on public.admin_audit for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert audit" on public.admin_audit;
create policy "Admins can insert audit"
on public.admin_audit for insert
to authenticated
with check (public.is_admin());

-- Storage bucket for product images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- Helpful indexes.
create index if not exists products_category_idx on public.products(category);
create index if not exists products_new_idx on public.products(is_new);
create index if not exists repairs_status_idx on public.repairs(status);
create index if not exists purchases_status_idx on public.purchases(status);
create index if not exists purchases_payment_status_idx on public.purchases(payment_status);
create index if not exists purchases_created_at_idx on public.purchases(created_at desc);
