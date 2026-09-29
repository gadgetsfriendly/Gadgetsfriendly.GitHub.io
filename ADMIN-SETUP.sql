-- GadgetsFriendly Admin Setup
-- 1) In Supabase Dashboard: Authentication -> Users -> Add user.
-- 2) Create the admin email/password you want to use.
-- 3) Replace the email below with that exact email and run this SQL.
-- 4) Sign out/in in admin.html so the refreshed JWT contains the admin role.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role','admin')
where email = 'YOUR-ADMIN-EMAIL-HERE';

-- Optional verification: the row should show role=admin.
select id, email, raw_app_meta_data->>'role' as role
from auth.users
where email = 'YOUR-ADMIN-EMAIL-HERE';
