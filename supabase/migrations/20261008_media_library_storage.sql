-- Public media library storage used by the admin Files page and media picker.
-- Objects are publicly readable for website/email embeds, but only admins may
-- create, replace, list, or remove objects through the authenticated client.

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public-media: admins can select" on storage.objects;
create policy "public-media: admins can select"
  on storage.objects for select to authenticated
  using (bucket_id = 'public-media' and public.is_admin());

drop policy if exists "public-media: admins can insert" on storage.objects;
create policy "public-media: admins can insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and public.is_admin());

drop policy if exists "public-media: admins can update" on storage.objects;
create policy "public-media: admins can update"
  on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and public.is_admin())
  with check (bucket_id = 'public-media' and public.is_admin());

drop policy if exists "public-media: admins can delete" on storage.objects;
create policy "public-media: admins can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and public.is_admin());
