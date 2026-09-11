-- ==============================================================================
-- PZT FRUIT POS & DURIAN SEASONAL MANAGEMENT - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 0. APP USERS (พนักงานและผู้ใช้งานระบบ)
create table if not exists public.app_users (
  id text primary key,
  name text not null,
  username text not null unique,
  phone text,
  pin text not null,
  role text not null default 'worker' check (role in ('worker', 'super_admin')),
  avatar_emoji text default '👷‍♂️',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert Default Demo Users
insert into public.app_users (id, name, username, phone, pin, role, avatar_emoji)
values 
  ('u-admin', 'เถ้าแก่ (เจ้าของร้าน)', 'admin', '081-234-5678', '1234', 'super_admin', '👑'),
  ('u-worker-1', 'สมชาย (แคชเชียร์/คนงาน)', 'worker', '089-999-8888', '1111', 'worker', '👷‍♂️')
on conflict (id) do nothing;

-- 1. SEASONS (รอบฤดูกาลผลไม้)
create table if not exists public.seasons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  year integer not null default extract(year from current_date),
  start_date date not null default current_date,
  end_date date,
  status text not null default 'active' check (status in ('active', 'closed')),
  budget numeric(12, 2) default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS (สายพันธุ์และสินค้า)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references public.seasons(id) on delete set null,
  name text not null,
  category text not null default 'ทุเรียน',
  unit_type text not null default 'kg' check (unit_type in ('kg', 'piece', 'box', 'tray')),
  price_per_unit numeric(10, 2) not null default 0,
  cost_per_unit numeric(10, 2) not null default 0,
  current_stock numeric(10, 2) not null default 0,
  image_emoji text default '🍈',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INBOUND LOTS (ล็อตการรับซื้อผลไม้จากสวน / ต้นทุนรอบ)
create table if not exists public.inbound_lots (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references public.seasons(id) on delete cascade,
  lot_number text not null,
  source_name text not null, -- สวน/ชาวสวน/แปลง
  purchase_date date not null default current_date,
  variety text not null,     -- สายพันธุ์
  grade text not null default 'เกรด A',
  initial_weight_kg numeric(10, 2) not null default 0,
  cost_total numeric(12, 2) not null default 0,
  cost_per_kg numeric(10, 2) generated always as (
    case when initial_weight_kg > 0 then round(cost_total / initial_weight_kg, 2) else 0 end
  ) stored,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. EXPENSES (ค่าใช้จ่ายแฝง: ค่าจ้างคนงานตัด, ค่าขนส่ง, ค่าบรรจุภัณฑ์)
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references public.seasons(id) on delete cascade,
  lot_id uuid references public.inbound_lots(id) on delete set null,
  title text not null,
  category text not null check (category in ('labor', 'transport', 'packaging', 'stall_rent', 'utilities', 'other')),
  amount numeric(10, 2) not null default 0,
  expense_date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. WASTE RECORDS (บันทึกของเสีย / ผลเน่าเสีย / ตกเกรด / เปลือกทิ้ง เพื่อคำนวณ Yield)
create table if not exists public.waste_records (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references public.seasons(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variety text not null,
  waste_type text not null check (waste_type in ('spoilage', 'damaged', 'peel_loss', 'grade_drop')),
  weight_kg numeric(10, 2) not null default 0,
  estimated_loss_value numeric(10, 2) default 0,
  reason text,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ORDERS (บิลขาย)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  season_id uuid references public.seasons(id) on delete set null,
  customer_name text not null default 'ลูกค้าหน้าร้าน',
  customer_phone text,
  customer_type text not null default 'retail' check (customer_type in ('retail', 'wholesale', 'regular')),
  subtotal numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  payment_method text not null check (payment_method in ('cash', 'promptpay', 'transfer', 'credit')),
  payment_status text not null default 'paid' check (payment_status in ('paid', 'pending', 'partial')),
  cash_received numeric(10, 2),
  change_given numeric(10, 2),
  due_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ORDER ITEMS (รายการสินค้าในบิลขาย)
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_type text not null default 'kg',
  unit_price numeric(10, 2) not null default 0,
  quantity_or_weight numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  item_cost numeric(10, 2) not null default 0,
  notes text
);

-- 8. DEBT PAYMENTS (ประวัติการชำระบิลค้างจ่าย/ลูกหนี้)
create table if not exists public.debt_payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  amount_paid numeric(10, 2) not null default 0,
  payment_method text not null check (payment_method in ('cash', 'promptpay', 'transfer')),
  paid_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text
);

-- 9. STORE SETTINGS
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null,
  branch text,
  phone text,
  promptpay_id text not null,
  promptpay_type text not null default 'mobile' check (promptpay_type in ('mobile', 'national_id')),
  address text,
  receipt_footer text,
  tax_id text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEXES FOR PERFORMANCE
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_inbound_lots_purchase_date on public.inbound_lots(purchase_date desc);
create index if not exists idx_expenses_expense_date on public.expenses(expense_date desc);

-- ROW LEVEL SECURITY (RLS)
alter table public.seasons enable row level security;
alter table public.products enable row level security;
alter table public.inbound_lots enable row level security;
alter table public.expenses enable row level security;
alter table public.waste_records enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.debt_payments enable row level security;
alter table public.store_settings enable row level security;
alter table public.app_users enable row level security;

-- Public / Anonymous access policies for simple POS terminal usage (Idempotent)
drop policy if exists "Allow all operations for anon" on public.seasons;
create policy "Allow all operations for anon" on public.seasons for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.products;
create policy "Allow all operations for anon" on public.products for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.inbound_lots;
create policy "Allow all operations for anon" on public.inbound_lots for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.expenses;
create policy "Allow all operations for anon" on public.expenses for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.waste_records;
create policy "Allow all operations for anon" on public.waste_records for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.orders;
create policy "Allow all operations for anon" on public.orders for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.order_items;
create policy "Allow all operations for anon" on public.order_items for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.debt_payments;
create policy "Allow all operations for anon" on public.debt_payments for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.store_settings;
create policy "Allow all operations for anon" on public.store_settings for all using (true) with check (true);

drop policy if exists "Allow all operations for anon" on public.app_users;
create policy "Allow all operations for anon" on public.app_users for all using (true) with check (true);
