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

## Not done yet
- Pushing the merged commit to GitHub (done from your own terminal; see the repo state).
- Storefront, cart, checkout, auth, customer dashboard, admin dashboard, database, and integrations (sections 5–27 of the spec).

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
