# Let's Eat oo

Responsive food-shop storefront for Monrovia and Brewerville. The front end is plain HTML, CSS, and JavaScript; GitHub Pages hosts the static files. Supabase provides the shared menu, administrator sign-in, protected order data, checkout, and order tracking.

## Supabase setup

The existing Let's Eat oo project URL and public publishable key are configured in `app.js`. The tables and policies have been installed in the Supabase project. Re-run the checked-in schema after updates to install the latest database functions:

1. In Supabase, open **SQL Editor**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**. It sets up sample menu and delivery zones, row-level security, and server-calculated order/tracking RPCs. Re-running it preserves existing menu items and orders while updating policies and the order functions.
2. In **Authentication → Users**, create the owner’s email/password account if needed. A database password is not an Auth user password. In **Authentication → Settings**, disable public sign-ups.
   Choose a strong, unique password in Supabase Auth. Never put it in the repository or website.
3. In SQL Editor, authorize the owner account (replace the email with its Supabase Auth email):

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where lower(email) = lower('owner@example.com')
   on conflict (user_id) do nothing;
   ```

4. Add the deployed website URL in **Authentication → URL Configuration → Redirect URLs**:

   ```text
   https://rickyageorge7-create.github.io/-lets-eat/**
   ```

5. Commit and push site changes to `main`. The public menu and delivery zones load from Supabase. Admin sign-in uses Supabase Auth; RLS permits menu/order management only for the user listed in `admin_users`. The `place_order` database function recalculates prices and totals in PostgreSQL. The `track_order` database function returns only status after matching both the random order number and checkout phone. No Edge Function or service-role key is required by this site.

### Security notes

- There is no admin password in the website code. The customer's Auth password is sent directly to Supabase Auth over HTTPS and is not stored by this app.
- The frontend URL and publishable/anon key are public by design. **Never** use or publish a service-role/secret key in `app.js`.
- Row-level security prevents public clients from reading customer orders. Public order placement and tracking run through narrow `SECURITY DEFINER` database functions; direct public table access to private customer orders remains blocked.
- This is a starter integration. Before taking real orders, add abuse protection/rate limiting or CAPTCHA for public checkout, configure operational order notifications, and test the payment instructions. Orange Money and MTN MoMo remain manual instructions, not payment processing.

## Run locally

With Supabase configured, serve the project directory over HTTP (for example, `python -m http.server 8000`) and visit `http://localhost:8000`. Without Supabase values, the site shows sample menu data and local demo checkout; admin is disabled and local demo orders do not sync or track across browsers.

## Shop and menu settings

The `CONFIG` object at the top of `app.js` contains the shop name, order WhatsApp number (`phoneDisplay` / `phoneDigits`), separate customer-care call number (`customerCarePhoneDisplay` / `customerCarePhoneDigits`), email, pickup city, hours, USD/LRD display rate, payment instructions, social links, and public Supabase configuration. Phone digits for `wa.me` and `tel:` links use Liberia's country code `231` without the local leading zero. The shop currently uses `0775399168` for WhatsApp orders and `0555112722` for customer-care calls. Its pickup point is in Monrovia; contact the shop for directions. The creator portrait is `img/ricky.jpg`. The `zones` in `supabase/schema.sql` define shared delivery areas and fees. After signing into Admin, manage menu names, categories, prices, photo URLs, availability, and order statuses from the dashboard.

Replace remote Unsplash photography with real, permissioned shop content before launch. Keep menu photo URLs on HTTPS and compressed for mobile.

## Customer reviews

Customers can submit a name, optional neighborhood, 1–5 star rating, and review from the Reviews section. New submissions stay private as **Pending** until an administrator signs in, opens **Admin → Reviews**, and approves or rejects them. Only approved reviews are returned to the public site; row-level security prevents anonymous visitors from reading pending reviews or changing review status.

Before enabling submissions on a fresh or existing Supabase project, run the updated `supabase/schema.sql` in the SQL Editor using the setup steps above. The script adds the review table, validation functions, and admin-only moderation permissions without deleting existing reviews or orders.

## Publish on GitHub Pages

This project is plain HTML/CSS/JS; it has no package install or build step. In the GitHub repository, open **Settings → Pages → Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/(root)**, then click **Save**. The site URL is:

<https://rickyageorge7-create.github.io/-lets-eat/>

After each change, commit and push the static files to `main`. Apply database updates in the Supabase SQL Editor; static hosting and Supabase are configured separately.
