-- Lets Eat shared menu, delivery zones, administrator access, and orders.
-- Apply this file in the Supabase SQL Editor before deploying the Edge Functions.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key,
  name text not null check (char_length(name) between 1 and 70),
  category text not null check (category in ('Fast Food', 'Local Dishes', 'Drinks', 'Snacks', 'Combos & Deals')),
  price numeric(10, 2) not null check (price > 0),
  description text not null check (char_length(description) between 1 and 140),
  photo text not null check (photo ~* '^https://'),
  badge text not null default '' check (char_length(badge) <= 22),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_zones (
  name text primary key,
  fee numeric(10, 2) not null check (fee >= 0),
  note text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (order_number ~ '^LE-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$'),
  name text not null,
  phone text not null check (phone ~ '^[0-9]{8,15}$'),
  order_type text not null check (order_type in ('Delivery', 'Pickup')),
  zone text references public.delivery_zones (name),
  address text,
  payment_method text not null check (payment_method in ('Cash on Delivery', 'Orange Money', 'MTN MoMo')),
  notes text not null default '',
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  status text not null default 'Received' check (status in ('Received', 'Preparing', 'On the way', 'Delivered')),
  created_at timestamptz not null default now(),
  constraint delivery_details_match_order check (
    (order_type = 'Delivery' and zone is not null and address is not null and char_length(address) between 1 and 180)
    or (order_type = 'Pickup' and zone is null and address is null and delivery_fee = 0)
  )
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id text not null,
  name text not null,
  unit_price numeric(10, 2) not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 50)
);

alter table public.admin_users enable row level security;
alter table public.menu_items enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on public.admin_users from public, anon, authenticated;

grant select on public.menu_items, public.delivery_zones to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant update (status) on public.orders to authenticated;

drop policy if exists "Anyone can read menu" on public.menu_items;
create policy "Anyone can read menu"
  on public.menu_items for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert menu" on public.menu_items;
create policy "Admins can insert menu"
  on public.menu_items for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update menu" on public.menu_items;
create policy "Admins can update menu"
  on public.menu_items for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete menu" on public.menu_items;
create policy "Admins can delete menu"
  on public.menu_items for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Anyone can read active delivery zones" on public.delivery_zones;
create policy "Anyone can read active delivery zones"
  on public.delivery_zones for select
  to anon, authenticated
  using (active or (select public.is_admin()));

drop policy if exists "Admins can manage delivery zones" on public.delivery_zones;
create policy "Admins can manage delivery zones"
  on public.delivery_zones for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
  on public.orders for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can update order status" on public.orders;
create policy "Admins can update order status"
  on public.orders for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where public.orders.id = order_items.order_id
        and (select public.is_admin())
    )
  );

create or replace function public.place_order(
  p_order_number text,
  p_name text,
  p_phone text,
  p_order_type text,
  p_zone text,
  p_address text,
  p_payment_method text,
  p_notes text,
  p_promo_code text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_line jsonb;
  v_item public.menu_items%rowtype;
  v_quantity integer;
  v_quantity_text text;
  v_subtotal numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_delivery_fee numeric(10, 2) := 0;
  v_total numeric(10, 2);
  v_order_id uuid;
  v_order_items jsonb := '[]'::jsonb;
begin
  if p_order_number !~ '^LE-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$' then
    raise exception 'Invalid order reference.';
  end if;
  if char_length(trim(coalesce(p_name, ''))) not between 1 and 80 then
    raise exception 'Enter a name between 1 and 80 characters.';
  end if;
  if p_phone !~ '^[0-9]{8,15}$' then
    raise exception 'Enter a valid phone number.';
  end if;
  if p_order_type not in ('Delivery', 'Pickup') then
    raise exception 'Choose delivery or pickup.';
  end if;
  if p_payment_method not in ('Cash on Delivery', 'Orange Money', 'MTN MoMo') then
    raise exception 'Choose a supported payment method.';
  end if;
  if char_length(coalesce(p_notes, '')) > 250 then
    raise exception 'Order notes are too long.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'Add between 1 and 30 menu items.';
  end if;

  if p_order_type = 'Delivery' then
    if char_length(trim(coalesce(p_address, ''))) not between 1 and 180 then
      raise exception 'Enter a delivery address.';
    end if;
    select fee into v_delivery_fee
      from public.delivery_zones
      where name = p_zone and active = true;
    if not found then
      raise exception 'That delivery area is unavailable.';
    end if;
  elsif p_zone is not null or p_address is not null then
    raise exception 'Pickup orders cannot include delivery details.';
  end if;

  for v_line in
    select value from jsonb_array_elements(p_items) as item(value)
  loop
    v_quantity_text := v_line ->> 'quantity';
    if v_quantity_text !~ '^[0-9]{1,2}$' then
      raise exception 'Menu quantities must be between 1 and 50.';
    end if;
    v_quantity := v_quantity_text::integer;
    if v_quantity not between 1 and 50 then
      raise exception 'Menu quantities must be between 1 and 50.';
    end if;

    select * into v_item
      from public.menu_items
      where id = v_line ->> 'id'
      for share;
    if not found or not v_item.available then
      raise exception 'One of those menu items is unavailable.';
    end if;

    v_subtotal := v_subtotal + v_item.price * v_quantity;
    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
      'id', v_item.id,
      'name', v_item.name,
      'price', v_item.price,
      'quantity', v_quantity
    ));
  end loop;

  v_subtotal := round(v_subtotal, 2);
  if upper(trim(coalesce(p_promo_code, ''))) = 'LETSEAT10' then
    v_discount := round(v_subtotal * 0.10, 2);
  elsif char_length(trim(coalesce(p_promo_code, ''))) > 0 then
    raise exception 'That promo code is invalid.';
  end if;
  v_total := v_subtotal - v_discount + v_delivery_fee;

  insert into public.orders (
    order_number, name, phone, order_type, zone, address, payment_method,
    notes, subtotal, discount, delivery_fee, total
  ) values (
    p_order_number, trim(p_name), p_phone, p_order_type, p_zone,
    nullif(trim(coalesce(p_address, '')), ''), p_payment_method,
    coalesce(p_notes, ''), v_subtotal, v_discount, v_delivery_fee, v_total
  ) returning id into v_order_id;

  insert into public.order_items (order_id, menu_item_id, name, unit_price, quantity)
  select
    v_order_id,
    item ->> 'id',
    item ->> 'name',
    (item ->> 'price')::numeric,
    (item ->> 'quantity')::integer
  from jsonb_array_elements(v_order_items) as snapshot(item);

  return jsonb_build_object(
    'orderNumber', p_order_number,
    'name', trim(p_name),
    'phone', p_phone,
    'orderType', p_order_type,
    'zone', p_zone,
    'address', p_address,
    'paymentMethod', p_payment_method,
    'notes', coalesce(p_notes, ''),
    'items', v_order_items,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'deliveryFee', v_delivery_fee,
    'total', v_total,
    'status', 'Received'
  );
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, text, text, text, text, jsonb)
  to service_role;

insert into public.delivery_zones (name, fee, note, sort_order) values
  ('Brewerville', 4, 'Local delivery', 1),
  ('Monrovia Central', 3, 'Central Monrovia', 2),
  ('Nearby areas', 5, 'Greater Monrovia', 3)
on conflict (name) do nothing;

insert into public.menu_items (id, name, category, price, description, photo, badge, available) values
  ('classic-burger', 'Classic Burger', 'Fast Food', 7.50, 'Juicy beef, crisp lettuce, tomato & house sauce.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=70', 'BEST SELLER', true),
  ('crispy-chicken', 'Crispy Chicken', 'Fast Food', 8.00, 'Golden crunchy chicken with a little kick.', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=70', 'CRUNCHY', true),
  ('pepperoni-pizza', 'Pepperoni Pizza', 'Fast Food', 12.00, 'Cheesy, saucy, and topped with pepperoni.', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=70', '', true),
  ('jollof-rice', 'Jollof Rice', 'Local Dishes', 8.50, 'Smoky, rich tomato rice with tasty spices.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=70', 'LOCAL FAVORITE', true),
  ('pepper-chicken', 'Pepper Chicken', 'Local Dishes', 10.00, 'Tender chicken with a bold pepper sauce.', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=700&q=70', 'SPICY', true),
  ('fried-plantain', 'Fried Plantain', 'Local Dishes', 4.00, 'Sweet plantain, golden at the edges.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=70', '', true),
  ('chilled-soda', 'Chilled Soda', 'Drinks', 2.00, 'An ice-cold fizzy favorite.', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=700&q=70', 'ICE COLD', true),
  ('fresh-lemonade', 'Fresh Lemonade', 'Drinks', 3.00, 'Bright, fresh and made to cool you down.', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=700&q=70', '', true),
  ('crispy-fries', 'Crispy Fries', 'Snacks', 3.50, 'Hot, golden fries with a pinch of salt.', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=70', 'A CLASSIC', true),
  ('chicken-wings', 'Chicken Wings', 'Snacks', 6.00, 'Saucy wings made for sharing (or not).', 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=700&q=70', '', true),
  ('burger-combo', 'Burger Combo', 'Combos & Deals', 11.00, 'Classic burger, crispy fries & a chilled soda.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=70', 'GREAT VALUE', true),
  ('jollof-combo', 'Jollof Chicken Combo', 'Combos & Deals', 13.00, 'Jollof rice, pepper chicken & sweet plantain.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=70', 'HOUSE PICK', true)
on conflict (id) do nothing;
