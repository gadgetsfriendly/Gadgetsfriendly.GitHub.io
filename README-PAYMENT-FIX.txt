GadgetsFriendly — Payment Fix

Replace the existing index.html in the GitHub repository with the index.html in this ZIP.

What was fixed:
- Purchase is saved to Supabase before Paystack starts.
- Purchase uses a UUID generated client-side, avoiding SELECT-after-INSERT/RLS problems.
- Paystack is initialized through the Supabase Edge Function paystack-initialize.
- The Paystack secret key is NOT in index.html.
- The callback URL carries the purchase_id; Paystack appends the transaction reference.
- The actual Paystack reference returned by initialization is saved to purchases.payment_reference when available.
- Customer is redirected with window.location.href to Paystack's authorization URL.
- Payment return calls paystack-verify with the Paystack reference and purchase_id.
- Cart is cleared only after successful verification.
- Existing dark GadgetsFriendly layout/navigation/repair/search/cart flow is retained.

Important:
The Supabase Edge Functions paystack-initialize and paystack-verify must be deployed and their CORS/secret configuration must be correct. PAYSTACK_SECRET_KEY must remain in Supabase Edge Function secrets, not GitHub.
