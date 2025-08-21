-- Полная очистка и создание схемы проекта
end;
$$;

-- Голос за продукт + автоаппрув при >= 5
create or replace function vote_for_product(p_product_id uuid) returns int
language plpgsql security definer
as $$
declare
votes_count int;
begin
insert into product_votes(product_id, user_id)
values (p_product_id, auth.uid())
on conflict do nothing;

select count(*) into votes_count from product_votes where product_id = p_product_id;

if votes_count >= 5 then
update products set status = 'approved', approved_at = now() where id = p_product_id and status = 'voting';
end if;

return votes_count;
end;
$$;

-- Повышение в админы (запускается один раз для admin@picnic.local)
create or replace function promote_admin(admin_email text) returns void
language sql security definer
as $$
update profiles set is_admin = true where email = admin_email;
$$;

-- Включаем RLS и политики
alter table profiles enable row level security;
alter table equipment enable row level security;
alter table products enable row level security;
alter table product_votes enable row level security;
alter table shopping_items enable row level security;
alter table picnic_location enable row level security;

-- Profiles
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_self_or_admin" on profiles for update using (id = auth.uid() or is_admin());

-- Equipment
create policy "equipment_select_all" on equipment for select using (true);
create policy "equipment_insert_user_propose" on equipment for insert with check (proposed_by = auth.uid() or proposed_by is null);
create policy "equipment_update_take_return" on equipment for update using ((taken_by is null) or (taken_by = auth.uid()) or is_admin());
create policy "equipment_delete_admin" on equipment for delete using (is_admin());

-- Products
create policy "products_select_all" on products for select using (true);
create policy "products_insert_any_user" on products for insert with check (true);
create policy "products_update_admin" on products for update using (is_admin());

-- Votes
create policy "votes_select_all" on product_votes for select using (true);
create policy "votes_insert_authenticated" on product_votes for insert with check (true);
create policy "votes_delete_admin" on product_votes for delete using (is_admin());

-- Shopping items
create policy "shopping_select_public_or_admin" on shopping_items for select using (approved = true or is_admin());
create policy "shopping_insert_any_user" on shopping_items for insert with check (true);
create policy "shopping_update_admin" on shopping_items for update using (is_admin());
create policy "shopping_delete_admin" on shopping_items for delete using (is_admin());

-- Picnic location
create policy "loc_select_all" on picnic_location for select using (true);
create policy "loc_upsert_admin" on picnic_location for insert with check (is_admin());
create policy "loc_update_admin" on picnic_location for update using (is_admin());

commit;