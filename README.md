# Lets Eat

Responsive food-shop storefront for Monrovia and Brewerville. The front end is plain HTML, CSS, and JavaScript; GitHub Pages hosts the static files. Supabase provides the shared menu, administrator sign-in, protected order data, checkout, and order tracking.

## Supabase setup

Create a Supabase project, then:

1. In **Project Settings → API**, copy the **Project URL** and the **publishable key** (or legacy `anon` key). These are public browser settings; the anon key is not an admin credential.
2. Open `app.js` and set `CONFIG.supabaseUrl` and `CONFIG.supabaseAnonKey`. Do not add a service-role key or an administrator password here.
3. Open **SQL Editor** in Supabase, paste and run [`supabase/schema.sql`](./supabase/schema.sql). It creates the sample menu, delivery zones, admin-only RLS policies, order tables, and the server-only `place_order` database function.
4. In **Authentication → Users**, create the owner’s email/password account. In **Authentication → Settings**, disable public sign-ups; create future admin accounts from the dashboard.
   Choose a strong, unique password in Supabase. If you choose `Ricky2006`, enter it only in Supabase Auth; never put it in the repository. A longer, randomly generated password is safer.
5. In SQL Editor, authorize the owner account (replace the email with its Supabase Auth email):

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where lower(email) = lower('owner@example.com')
   on conflict (user_id) do nothing;
   ```

6. Configure Edge Function secrets in **Project Settings → Edge Functions → Secrets**. Supabase normally provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to functions. If they are not present in your project, set them there. Use the same public key configured in `app.js` for `SUPABASE_ANON_KEY`. The service-role key is secret: keep it only in Supabase function secrets, never in the website, GitHub, or chat.
7. Install/use the Supabase CLI and authenticate locally (the CLI opens its own sign-in flow; do not paste credentials into chat). From the project folder, link the project and deploy both functions:

   ```powershell
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy place-order
   npx supabase functions deploy track-order
   ```

   Find `YOUR_PROJECT_REF` in the Supabase project URL (`https://YOUR_PROJECT_REF.supabase.co`). The functions deliberately disable platform JWT verification and validate the public API key themselves; checkout calls a database function available only to the service role.
8. Add the deployed website URL in **Authentication → URL Configuration → Redirect URLs**:

   ```text
   https://rickyageorge7-create.github.io/-lets-eat/**
   ```

9. Commit and push the updated `app.js`, then enable/update GitHub Pages as described below. The public menu and delivery zones load from Supabase. Admin sign-in uses Supabase Auth; RLS permits menu/order management only for the user listed in `admin_users`. Checkout totals and menu availability are recalculated in PostgreSQL. Tracking requires both the random order number and the phone number used at checkout.

### Security notes

- There is no admin password in the website code. The customer's Auth password is sent directly to Supabase Auth over HTTPS and is not stored by this app.
- The frontend URL and publishable/anon key are public by design. **Never** use or publish a service-role/secret key in `app.js`; the Edge Functions use it server-side.
- Row-level security prevents public clients from reading customer orders. Public order placement and tracking go through Edge Functions; tracking returns only status after matching the order number and phone.
- This is a starter integration. Before taking real orders, add abuse protection/rate limiting or CAPTCHA for public checkout, configure operational order notifications, and test the payment instructions. Orange Money and MTN MoMo remain manual instructions, not payment processing.

## Run locally

With Supabase configured, serve the project directory over HTTP (for example, `python -m http.server 8000`) and visit `http://localhost:8000`. Without Supabase values, the site shows sample menu data and local demo checkout; admin is disabled and local demo orders do not sync or track across browsers.

## Shop and menu settings

The `CONFIG` object at the top of `app.js` contains the business phone/WhatsApp number, email, pickup address, hours, USD/LRD display rate, payment instructions, social links, and public Supabase configuration. The `zones` in `supabase/schema.sql` define shared delivery areas and fees. After signing into Admin, manage menu names, categories, prices, photo URLs, availability, and order statuses from the dashboard.

Replace sample reviews and remote Unsplash photography with real, permissioned shop content before launch. Keep menu photo URLs on HTTPS and compressed for mobile.

## Publish on GitHub Pages

This project is plain HTML/CSS/JS; it has no package install or build step. In the GitHub repository, open **Settings → Pages → Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/(root)**, then click **Save**. The site URL is:

<https://rickyageorge7-create.github.io/-lets-eat/>

After each change, commit and push the static files to `main`. Supabase SQL changes and Edge Function deployments are managed separately from GitHub Pages.
