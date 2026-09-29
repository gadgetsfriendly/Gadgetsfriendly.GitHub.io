GADGETSFRIENDLY — SUPABASE FINAL PACKAGE

WHAT IS CONNECTED
- index.html reads products from Supabase.
- admin.html uses Supabase Auth + the admin role from app_metadata.
- Products, private serial/IMEI values, repairs and purchases use the Supabase tables from the schema you already ran.
- Product images are uploaded to the public product-images Storage bucket created by the schema.
- Repair requests and cart checkout requests are written directly to Supabase.
- Admin delete, status update and clear-completed actions operate on Supabase, not browser IndexedDB.
- The locked GadgetsFriendly visual template is preserved.

ONE-TIME ADMIN SETUP
1. In your Supabase project, open Authentication -> Users.
2. Add a user with the email/password you want for the store admin.
3. Open SQL Editor and run ADMIN-SETUP.sql after replacing YOUR-ADMIN-EMAIL-HERE with the same email.
4. Sign in at admin.html with that email and password.

IMPORTANT
- The publishable key in the HTML is safe for browser use; never put a Supabase secret/service-role key in index.html or admin.html.
- The current checkout records purchase requests and marks payment_status as unpaid. A real Paystack charge still requires a secure server/Edge Function and a Paystack secret key; do not paste that secret into the website.
- Do not rerun the schema unless you intentionally need to rebuild/alter the database.

FILES
- index.html — storefront
- admin.html — Supabase-backed admin portal
- GadgetsFriendly-Supabase-Schema.sql — database schema already run in your project
- ADMIN-SETUP.sql — one-time admin role setup
- repair-reference.jpg — repair section artwork
