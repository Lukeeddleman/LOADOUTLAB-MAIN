# Kineticube — project notes

Working notes for anyone picking this up cold. Read this before changing the
order pipeline, the emails, or the typography — most of what's here was learned
by breaking something in production.

Also read `AGENTS.md`: this is Next.js 16, and the bundled docs in
`node_modules/next/dist/docs/` are the source of truth, not training data.

## What this is

A single-product storefront on Next.js 16 (App Router) + Tailwind v4, deployed
to Vercel from `master`. It sells one thing: a $12.99 six-pack of reactive
powder targets. Luke makes them in-house on a home 3D print farm, so throughput
is the real inventory ceiling — that's the context behind the stock counter and
the 10-pack quantity cap.

Luke is the founder and is not a developer. Explain things in terms of money,
sales and customers rather than architecture.

## How an order flows

1. `/checkout` collects name, email, address, quantity.
2. `POST /api/shipping-rates` → Shippo → live USPS rates for a server-sized parcel.
3. `POST /api/create-checkout` → **re-quotes shipping server-side**, then creates
   the Stripe Checkout Session. Address + rate id + quantity ride along in
   session metadata.
4. Stripe → `POST /api/webhook` → claims a duplicate guard → decrements stock →
   buys the Shippo label → sends the PDF to PrintNode → emails support@.
5. Shippo emails the customer their tracking (that's why no tracking email code
   exists here — it needs `address_to.email`, which is why checkout collects one).

## Principles baked into the code — don't "fix" these

These are deliberate business decisions, not oversights.

- **Never block a sale on a third party.** If Shippo is unreachable, checkout
  still completes at a flat $7 and the order is flagged. A sale that needs a
  hand-bought label beats a lost sale.
- **Unknown stock is not zero.** `getStock()` returns `null` when the counter is
  unreachable, and every caller keeps selling. Losing sight of inventory is not
  a reason to close the shop.
- **Claim before spending.** The webhook writes its duplicate guard to the
  PaymentIntent *before* buying a label, so a Stripe retry can never buy a
  second one.
- **Only a bought label closes an order.** A failed or died-mid-flight attempt
  stays retryable (`kc_fulfillment` = `failed`, stale `processing` claims expire
  after 10 min). One bad run must never strand a paid order forever.
- **Diagnostics go in the webhook's 200 response body.** Vercel's Hobby plan
  has no runtime logs, so Stripe's event view is the only log Luke can read.

## Deployment config that isn't in this repo

**The Stripe webhook endpoint must be `https://www.kineticube.shop/api/webhook`.**
The apex domain 308-redirects to `www`, and Stripe does not follow redirects —
it marks the delivery failed. This cost an afternoon.

Environment variables (Vercel → Settings → Environment Variables, **Production**).
Changes only take effect on a new deployment:

| Variable | Notes |
| --- | --- |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | |
| `SHIPPO_API_KEY` | |
| `SHIP_FROM_STREET1`, `SHIP_FROM_ZIP` | |
| `SHIP_FROM_PHONE` | **Required** — USPS refuses labels without it |
| `SHIP_FROM_EMAIL` | Optional, defaults to support@kineticube.shop |
| `PRINTNODE_API_KEY`, `PRINTNODE_PRINTER_ID` | |
| `RESEND_API_KEY` | |
| `ADMIN_SECRET` | Password for `/admin` |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | Or the `KV_REST_API_*` pair — either works |
| `NEXT_PUBLIC_BASE_URL` | |
| `IN_STOCK` | `false` force-closes the shop regardless of the counter |
| `BUSINESS_ADDRESS` | Optional, shown in the restock email footer |

## Gotchas, all learned the hard way

**USPS / Shippo**
- USPS will happily quote rates for a shipment with no sender email or phone,
  then refuse to sell the label for it. Both are required, and each failure
  surfaces one at a time, only on a real order.
- A rate stored at checkout can go bad later, so a failed purchase re-quotes
  and retries once.

**Email**
- Gmail strips `<html>`, `<head>` and `<body>` and re-wraps the content. A
  background set on `<body>` never survives. Put `bgcolor` **and** an inline
  `background-color` on every `<td>`.
- Resend resolves with `{ data, error }` and does **not** throw on API failures.
  A `try/catch` alone silently swallows them. Always check `.error`.
- WebP doesn't render in many email clients or in Stripe's checkout. Use the
  JPEG derivatives in `public/` (`email-cube-red.jpg`, `product-red.jpg`).
- The restock email is one self-contained dark card so it reads correctly
  whether or not the page background survives.

**Typography** (Barlow Condensed is narrow; both failure modes bit us)
- Tailwind has no numeric font-weight utilities. `font-600`/`700`/`800` emit no
  CSS at all — 15 of them were silently doing nothing. Use `font-semibold`/
  `font-bold`/`font-extrabold`.
- Small uppercase needs `tracking-label` (0.18em, defined in `globals.css`).
  Tailwind's `tracking-widest` is only 0.1em and letters run together.
- Large headings need `tracking-normal`, never `tracking-tight`. Negative
  tracking suits wide faces, not condensed ones.

**Tooling**
- `npm install` on Windows prunes Linux-only optional deps out of
  `package-lock.json`, which can break the Vercel build. Use
  `npm install --package-lock-only`, and check the diff before committing.
- The build must succeed with **no** env vars set. Construct SDK clients inside
  request handlers, never at module scope — both Stripe and Resend throw on a
  missing key, which at module scope fails the build instead of the request.

## Testing without spending money

```bash
npm run dry-run              # full pipeline, delivered twice to prove the duplicate guard
npm run dry-run -- --degraded  # simulates Shippo being down at checkout
```

Needs `.env.local` with **test** credentials. The script refuses to start unless
`STRIPE_SECRET_KEY` starts with `sk_test_` and `SHIPPO_API_KEY` with
`shippo_test_`, so it cannot charge a card or buy real postage.

`/admin` also has a **PREVIEW EMAIL** link that renders the restock email in a
browser without sending anything.

## Where things live

```
lib/
  parcel.ts        box sizing + quantity validation (shared, single source of truth)
  shippo.ts        rate lookup, address parsing, flat-rate fallback
  stock.ts         Upstash counter + waitlist; getStock() calls connection()
  stock-config.ts  LOW_STOCK_THRESHOLD — safe for client import
  restock-email.ts the back-in-stock email (HTML + plain text)
  admin-auth.ts    HMAC cookie, constant-time compare
  html.ts          escapeHtml for transactional email
app/api/
  shipping-rates/  quote (falls back to flat rate if Shippo is down)
  create-checkout/  re-prices server-side, enforces stock
  webhook/         fulfillment: guard → stock → label → print → email
  stock/           public count, so checkout can cap its quantity picker
  admin/           login, stock get/set, restock-preview
  notify/          restock waitlist signup
  test-fulfillment/ dev-only pipeline check
```

## Open items

- **3–10 pack parcel dimensions in `lib/parcel.ts` are estimates.** 1- and
  2-packs are real bubble-mailer numbers; above that it's a guess. Under-declared
  weight comes back as USPS postage adjustments on the Shippo bill.
- **Barlow (the body font) is loaded but never used.** `--font-body` is declared
  in `layout.tsx` and referenced nowhere; `globals.css` sets body text to Arial.
  Either wire it up or drop the download. Needs Luke's call — it changes how all
  body copy looks.
- **Flat-rate fallback is $7 at any quantity.** Under-recovers on large orders;
  accepted because orders are overwhelmingly 1–2 packs and outages are rare.
