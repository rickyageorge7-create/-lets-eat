# Lets Eat

A responsive, no-build storefront for a Monrovia-area takeaway and delivery shop. The site is plain HTML, CSS, and JavaScript, so it can be previewed locally and hosted as a static site.

## Run it locally

1. Open `index.html` in a modern browser, or serve the folder with any static web server. For example, from this folder run `python -m http.server 8000` and visit `http://localhost:8000`.
2. Browse the menu, add items to the cart, and submit a test checkout. Orders, menu edits, and tracking statuses persist in that browser's local storage.
3. Open **Admin** in the footer. The demo password is `letseat2026`.

No package install or build step is required.

## Before you publish

Edit the `CONFIG` object near the top of `app.js`:

- `phoneDisplay`: the phone number shown on the site.
- `phoneDigits`: the WhatsApp number in international format, digits only (for example, `231XXXXXXXXX`; do not include `+`). This configures order and contact message links.
- `email`, `address`, and `hours`: your real business details.
- `socials`: your Instagram, Facebook, and TikTok profile URLs (HTTPS URLs are shown in the footer).
- `lrdPerUsd`: the USD-to-LRD display conversion rate. This is a manually maintained estimate, not a live exchange rate.
- `mobileMoney.orange` and `mobileMoney.mtn`: the wallet numbers and payment instructions customers see at checkout.
- `adminPassword`: the demo password. Changing it does not make the static site's admin secure.

The delivery zones and fees are in the `ZONES` array in `app.js`. Menu items, daily offer copy, currency styling, and initial sample prices are also in `app.js`. The first visit seeds the menu into local storage; after that, the local admin dashboard can add, edit, remove, and mark items sold out.

Sample menu photography uses optimized, remotely hosted Unsplash images. Replace the `photo` URLs in `INITIAL_MENU` with your own compressed, HTTPS food photos when available. Customer reviews on the page are clearly marked as samples and should be replaced with real, permissioned reviews before launch.

## Free static hosting

Deploy the folder as a static site on Netlify, Vercel, or GitHub Pages:

1. Upload or push the project files (including `index.html`, `style.css`, and `app.js`) to your chosen static host.
2. Set the publish/root directory to this folder. There is no build command; the output directory is the project root.
3. Set the deployed site's home page to `index.html`, then open the HTTPS URL and test menu search, currency toggle, checkout, and WhatsApp links on a phone.

## Important production limitations

This is a working **single-browser demo**, not a production ordering backend:

- The dashboard password is present in the public JavaScript. Anyone can inspect or change it. Orders and menu edits are stored only in the browser that created them; they are not shared with the owner or other customers, and clearing browser data removes them.
- Order placement saves a local confirmation but does not silently notify the shop. The customer must tap **Send order on WhatsApp** to open a pre-filled message. Add the real WhatsApp number to `CONFIG.phoneDigits`.
- Orange Money and MTN MoMo are instruction-only options; this site does not initiate or verify payments. Add your actual wallet instructions before accepting orders.
- For a real public launch, connect a protected backend or a configured service such as Supabase/Firebase for shared menu, orders, tracking, and admin authentication. Keep admin credentials and payment secrets on the server, require HTTPS, validate prices and delivery fees server-side, and configure order notifications there. Do not use local storage as the authoritative order record.

The optional customer-account feature is not included; it requires the same shared, authenticated backend.
