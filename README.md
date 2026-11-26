# Cognex — Ecommerce Website (in progress)

Original repo description: "This is a experimental sales webpage."

Status: **Phase 1 in progress.** Scaffold is in place, `npm run build` passes, and the project is in a Git repo with an initial commit. The GitHub remote is `Sales-Website-Estan`.

## Done
- React + TypeScript + Vite scaffold (Vite 8, React, TS). Run `npm install` then `npm run dev`.
- Brand name set to **Cognex** (`index.html` title).
- `public/assets/logo-placeholder.webp`: logo supplied in chat. It is still a placeholder until the final logo is confirmed.
- `src/styles/tokens.css`: spec palette as CSS variables (Chalk, Stone, Graphite, Signal Orange, Near-black).
- Local Git repo on branch `main`, with the GitHub remote connected and the existing repo README merged in.
- Installed on this machine: Node.js v26.13.1, npm 11.20.0, Git 2.56.1.

## Payments (decided, not yet integrated)
- **PayPal**: payment links and checkout.
- **GCash via QRPh**: QR Ph payment. Needs a merchant or payment-provider account and credentials before it can be tested. Nothing is verified yet.
- Payment status is marked paid only after a verified webhook from the provider (spec section 15).

## Cart (built, tested)
- Cart state saved in the browser (`localStorage`), slide-out drawer, quantity controls, subtotal.
- Tested with two temporary products, then removed. The catalog in `src/data/products.ts` is empty.
- Prices are shown from the catalog only. The server must re-check prices at checkout (spec section 10). That is not built yet.

## Accounts (built, NOT yet connected)
- Pages: `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/account` (protected: redirects to login when signed out).
- Built on Supabase Auth. Pages show a "not connected yet" notice and buttons are disabled until the environment variables are set.
- Tested only in the unconfigured state. **Real sign-up, login, email verification, and password reset have not been tested** because no Supabase project exists yet.
- Google sign-in needs a Google provider enabled in Supabase.

### To connect accounts
1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (publishable/anon key only).
3. Enable Email auth and turn on email confirmation in Supabase.
4. Set the Site URL and redirect URLs in Supabase to your local and Cloudflare domains. The app redirects to `/login`, `/account`, and `/reset-password`.
5. Optional: enable the Google provider in Supabase and add the Google OAuth credentials.
6. Run `npm run dev` and test register, verify, login, and password reset.

Cloudflare Pages: `public/_redirects` sends all routes to `index.html`. Set the environment variables in the Pages project settings, not in the repo.

## Checkout (built, partly tested)
- `/checkout` requires a signed-in customer. Signed-out visitors are sent to `/login`.
- Shows the cart summary, a shipping form for physical items, a service-request note, and a digital-delivery note.
- Validates the shipping form before continuing. Nothing is saved, charged, or placed as an order.
- PayPal and GCash QRPh are listed as **not enabled**. "Place order" is disabled.
- **Tested:** the redirect for signed-out visitors. **Not tested:** the form itself, because it sits behind login, which is not connected yet.

## Not done yet
- Server-side order creation and price checks, database tables and Row Level Security, the customer dashboard content (orders, downloads, services), the admin dashboard, payments (PayPal, GCash QRPh), and transactional email (sections 5–27 of the spec).

## Information still needed (spec sections 3, 25)
- Tagline and business description for Cognex.
- Logo colors do not match the spec palette. The supplied logo uses warm orange, green, and red. Confirm whether the spec palette should replace the logo colors.
- Services list and product types to sell.
- PayPal and QRPh merchant credentials, once accounts are set up.

## Tool choices from the setup list (to confirm)
| Tool | Use | Note |
|---|---|---|
| GitHub | Source control | Free tier |
| Cloudflare Pages | Public hosting | Free tier |
| PayPal | Payment links and checkout | Transaction fees apply |
| Google Fonts | Typography | Free |
| Lucide | Icons | Free, open source |

The spec also requires Supabase (database, auth, storage) and a transactional email service. Neither is in the setup list yet.
