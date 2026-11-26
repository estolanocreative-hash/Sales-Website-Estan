-- Cognex initial schema (spec section 25).
-- STATUS: written but NOT YET APPLIED. It has not been run against a real Supabase database.
-- Money is stored as integer centavos (PHP x 100) to avoid floating-point rounding.
-- Every table has Row Level Security (RLS) enabled. Access is granted only by the policies below.

create extension if not exists pgcrypto;

-- ============================================================
-- Customer profiles (1:1 with auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  city text not null,
  province text not null,
  postal_code text not null check (postal_code ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Administrators, roles, and permissions
-- ============================================================
create table public.role_permissions (
  role text not null check (role in ('owner', 'manager', 'product_editor', 'order_manager', 'support_staff')),
  permission text not null,
  primary key (role, permission)
);

create table public.admin_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'product_editor', 'order_manager', 'support_staff')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  is_owner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exactly one primary owner account.
create unique index admin_members_single_owner on public.admin_members (is_owner) where is_owner;

-- Extra permissions granted to one administrator beyond their role (custom permissions).
create table public.admin_permission_grants (
  user_id uuid not null references public.admin_members (user_id) on delete cascade,
  permission text not null,
  primary key (user_id, permission)
);

create table public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null check (role in ('manager', 'product_editor', 'order_manager', 'support_staff')),
  token_hash text not null unique,      -- store a hash of the token, never the raw token
  expires_at timestamptz not null,
  used_at timestamptz,
  invited_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Audit trail. Insert-only for administrators. No update or delete policy exists.
create table public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id),
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Catalog
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  kind text not null check (kind in ('physical', 'digital', 'service')),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_centavos integer not null check (price_centavos >= 0),
  is_active boolean not null default false,   -- off until the business publishes it
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Variations (size, color, etc.). Each has its own SKU, optional price override, and stock.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  attributes jsonb not null default '{}'::jsonb,
  price_centavos integer check (price_centavos is null or price_centavos >= 0),
  stock integer not null default 0 check (stock >= 0),  -- physical products only
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now()
);

create table public.inventory_adjustments (
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  change integer not null,
  reason text not null,
  actor_id uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Digital files live in a PRIVATE storage bucket. Only a short-lived signed URL is ever issued.
create table public.digital_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,           -- path inside the private bucket, never a public URL
  file_name text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Orders, payments, fulfillment
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  status text not null default 'pending' check (status in ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  currency text not null default 'PHP',
  subtotal_centavos integer not null check (subtotal_centavos >= 0),
  shipping_centavos integer not null default 0 check (shipping_centavos >= 0),
  total_centavos integer not null check (total_centavos >= 0),
  shipping_address jsonb,              -- set only for orders with physical items
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  kind text not null check (kind in ('physical', 'digital', 'service')),
  name_snapshot text not null,          -- name and price copied at purchase time
  unit_price_centavos integer not null check (unit_price_centavos >= 0),
  quantity integer not null check (quantity > 0),
  personalization jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Provider payment records. An order is marked paid ONLY from a verified provider webhook.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null check (provider in ('paypal', 'gcash_qrph')),
  provider_reference text unique,
  status text not null default 'created' check (status in ('created', 'pending', 'succeeded', 'failed', 'refunded')),
  amount_centavos integer not null check (amount_centavos >= 0),
  currency text not null default 'PHP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Records every processed webhook so a repeated delivery does nothing the second time.
create table public.webhook_events (
  provider text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);

-- Download permissions for digital purchases.
create table public.download_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  digital_file_id uuid not null references public.digital_files (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  expires_at timestamptz,               -- null means no expiry, if the business chooses that
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Services and bookings
-- ============================================================
create table public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid not null references auth.users (id),
  product_id uuid references public.products (id) on delete set null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  preferred_at timestamptz,
  confirmed_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Notifications and site content
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('account', 'order', 'payment', 'delivery', 'digital', 'booking')),
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.site_content (
  key text primary key,                 -- for example: hero.heading, faq.1.question
  value jsonb not null,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

create table public.business_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Helper functions used by the policies
-- ============================================================
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_members m
    where m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function public.has_permission(p text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_members m
    where m.user_id = auth.uid()
      and m.status = 'active'
      and (
        exists (select 1 from public.role_permissions rp where rp.role = m.role and rp.permission = p)
        or exists (select 1 from public.admin_permission_grants g where g.user_id = m.user_id and g.permission = p)
      )
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_members m
    where m.user_id = auth.uid() and m.is_owner and m.status = 'active'
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.role_permissions enable row level security;
alter table public.admin_members enable row level security;
alter table public.admin_permission_grants enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.activity_logs enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.digital_files enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.download_grants enable row level security;
alter table public.service_bookings enable row level security;
alter table public.notifications enable row level security;
alter table public.site_content enable row level security;
alter table public.business_settings enable row level security;

-- Customers: own profile and addresses only.
create policy profiles_own_select on public.profiles for select using (id = auth.uid());
create policy profiles_own_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_own_insert on public.profiles for insert with check (id = auth.uid());

create policy addresses_own_all on public.saved_addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Customers: own orders, items, payments, bookings, downloads, notifications.
create policy orders_own_select on public.orders for select using (user_id = auth.uid());
create policy order_items_own_select on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy payments_own_select on public.payments for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy bookings_own_select on public.service_bookings for select using (user_id = auth.uid());
create policy downloads_own_select on public.download_grants for select using (
  user_id = auth.uid() and revoked_at is null and (expires_at is null or expires_at > now())
);
create policy notifications_own_select on public.notifications for select using (user_id = auth.uid());
create policy notifications_own_mark_read on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Public catalog: anyone can read ACTIVE products and their variants, not drafts.
create policy categories_public_read on public.categories for select using (true);
create policy products_public_read on public.products for select using (is_active or public.has_permission('products.view'));
create policy variants_public_read on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.has_permission('products.view')))
);
-- Digital file records are never public. Downloads go through download_grants + signed URLs.
create policy site_content_public_read on public.site_content for select using (true);

-- Administrators: each table is gated by a specific permission.
create policy admin_members_self_read on public.admin_members for select using (user_id = auth.uid());
create policy admin_members_owner_all on public.admin_members for all
  using (public.is_owner()) with check (public.is_owner());
create policy role_permissions_read on public.role_permissions for select using (public.is_active_admin());
create policy grants_owner_all on public.admin_permission_grants for all
  using (public.is_owner()) with check (public.is_owner());
create policy invitations_owner_all on public.admin_invitations for all
  using (public.is_owner()) with check (public.is_owner());
create policy activity_read on public.activity_logs for select using (public.has_permission('activity.view'));
create policy activity_insert on public.activity_logs for insert with check (public.is_active_admin());
-- No update or delete policy on activity_logs: audit records cannot be changed or removed by administrators.

create policy categories_manage on public.categories for all
  using (public.has_permission('products.edit')) with check (public.has_permission('products.edit'));
create policy products_manage on public.products for all
  using (public.has_permission('products.edit')) with check (public.has_permission('products.edit'));
create policy variants_manage on public.product_variants for all
  using (public.has_permission('products.edit') or public.has_permission('inventory.manage'))
  with check (public.has_permission('products.edit') or public.has_permission('inventory.manage'));
create policy inventory_adjustments_manage on public.inventory_adjustments for all
  using (public.has_permission('inventory.manage')) with check (public.has_permission('inventory.manage'));
create policy digital_files_manage on public.digital_files for all
  using (public.has_permission('digital.manage')) with check (public.has_permission('digital.manage'));

create policy orders_admin_read on public.orders for select using (public.has_permission('orders.view'));
-- Admins may only move an order to fulfilled or cancelled, and only change status and tracking.
-- 'paid', 'refunded', and payment_status are set by the server after the provider confirms the payment.
create policy orders_admin_update on public.orders for update
  using (public.has_permission('orders.update'))
  with check (public.has_permission('orders.update') and status in ('fulfilled', 'cancelled'));
revoke update on public.orders from authenticated, anon;
grant update (status, tracking_number) on public.orders to authenticated;
create policy order_items_admin_read on public.order_items for select using (public.has_permission('orders.view'));
create policy payments_admin_read on public.payments for select using (public.has_permission('orders.view'));
create policy bookings_admin_manage on public.service_bookings for all
  using (public.has_permission('bookings.manage')) with check (public.has_permission('bookings.manage'));
create policy downloads_admin_manage on public.download_grants for all
  using (public.has_permission('digital.manage')) with check (public.has_permission('digital.manage'));
create policy customers_admin_read on public.profiles for select using (public.has_permission('customers.view'));
create policy site_content_manage on public.site_content for all
  using (public.has_permission('content.edit')) with check (public.has_permission('content.edit'));
create policy business_settings_owner on public.business_settings for all
  using (public.is_owner()) with check (public.is_owner());

-- Orders, payments, and webhook events are written by SERVER functions using the service role,
-- never directly from the browser. Customers and admins have read access only (above).
-- Notifications are created by server functions too, so there is no insert policy for clients.

-- ============================================================
-- Updated-at maintenance
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger admin_members_touch before update on public.admin_members
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
create trigger payments_touch before update on public.payments
  for each row execute function public.touch_updated_at();
create trigger bookings_touch before update on public.service_bookings
  for each row execute function public.touch_updated_at();

-- The owner record cannot be deleted, demoted, or suspended. Enforced here, not just in the UI.
create or replace function public.protect_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_owner then raise exception 'The owner account cannot be removed.'; end if;
    return old;
  end if;
  if old.is_owner and (new.is_owner = false or new.role <> 'owner' or new.status <> 'active') then
    raise exception 'The owner account cannot be demoted or suspended.';
  end if;
  return new;
end;
$$;

create trigger admin_members_protect_owner
  before update or delete on public.admin_members
  for each row execute function public.protect_owner();

-- ============================================================
-- Seed: default role permissions (matches src/admin/permissions.ts)
-- ============================================================
insert into public.role_permissions (role, permission) values
  ('owner', 'products.view'), ('owner', 'products.edit'), ('owner', 'inventory.manage'),
  ('owner', 'orders.view'), ('owner', 'orders.update'), ('owner', 'customers.view'),
  ('owner', 'digital.manage'), ('owner', 'bookings.manage'), ('owner', 'content.edit'),
  ('owner', 'reports.view'), ('owner', 'activity.view'), ('owner', 'admins.manage'),
  ('owner', 'settings.edit'),
  ('manager', 'products.view'), ('manager', 'products.edit'), ('manager', 'inventory.manage'),
  ('manager', 'orders.view'), ('manager', 'orders.update'), ('manager', 'customers.view'),
  ('manager', 'digital.manage'), ('manager', 'bookings.manage'), ('manager', 'content.edit'),
  ('manager', 'reports.view'), ('manager', 'activity.view'),
  ('product_editor', 'products.view'), ('product_editor', 'products.edit'),
  ('product_editor', 'inventory.manage'), ('product_editor', 'digital.manage'), ('product_editor', 'content.edit'),
  ('order_manager', 'orders.view'), ('order_manager', 'orders.update'),
  ('order_manager', 'customers.view'), ('order_manager', 'bookings.manage'),
  ('support_staff', 'orders.view'), ('support_staff', 'customers.view'), ('support_staff', 'bookings.manage')
on conflict do nothing;
