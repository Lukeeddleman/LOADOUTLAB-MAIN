# Contact form spam protection

The contact form uses Cloudflare Turnstile in Managed mode with
`appearance: interaction-only`. Verification starts in the background. Customers
only see the widget if Cloudflare needs interaction. A hidden honeypot discards
simple form-filling bots. No contact email is sent without server-side verification.

## Enable on Vercel

1. Create a Cloudflare account, then open **Turnstile → Add widget**.
2. Name it `Loadout Lab contact` and choose **Managed** mode. Leave pre-clearance
   disabled (this integration does not need clearance cookies).
3. Add the hostnames that actually serve the form: `www.loadoutlab.com` and
   `loadoutlab.com`. The legacy kineticube.shop contact page redirects to
   loadoutlab.com, so the widget does not need the legacy hostname.
4. In the Vercel project, add these environment variables for Production:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Widget's public site key |
   | `TURNSTILE_SECRET_KEY` | Widget's private secret key |
   | `TURNSTILE_ALLOWED_HOSTNAMES` | `www.loadoutlab.com,loadoutlab.com` |

5. Keep the existing `RESEND_API_KEY` and email settings. Never commit the secret
   key or put it in a `NEXT_PUBLIC_` variable.
6. Redeploy **after** adding the variables: Next.js embeds the public site key
   at build time. The change intentionally blocks email if verification is missing
   or unavailable, rather than allowing bots through.
7. In a preview deployment first, verify a legitimate message arrives and that
   a direct POST without `turnstileToken` returns 403. Use a dedicated preview
   widget with its exact hostname and matching `TURNSTILE_ALLOWED_HOSTNAMES`.
   Add preview keys to Vercel's Preview environment and redeploy that preview.
8. After production deployment, send one legitimate message and check delivery.
   Bot rejection is best effort; a CAPTCHA cannot guarantee that all spam stops.

If verification cannot load (for example, a browser extension blocks it), the
form explains the issue and the direct email address remains available on the page.
Messages stay in the form after an unsuccessful attempt. Expired challenges
refresh automatically, and submission retries get a new widget/token.

## Local testing, without sending email

Cloudflare publishes dummy keys specifically for testing. In an ignored
`.env.local`, use:

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
TURNSTILE_ALLOWED_HOSTNAMES=localhost,example.com
```

Start with `npm run dev` and open `http://localhost:3000/contact`.
These are public test values, not real credentials. Cloudflare's dummy verifier
can return `example.com` as its hostname, so the local-only test allowlist includes
it. Do **not** deploy these test settings.
The server refuses dummy secrets in production. A dummy-key exception for the
fixed test action is confined to non-production environments; real keys must
return action `contact` and a hostname in the configured allowlist.

To exercise the server without credentials, emails, or Cloudflare calls:

```sh
node --test tests/contact.test.mjs
```

This tests the real contact handler and verifier with mocked external services,
including invalid/expired/reused tokens, wrong hostname/action, provider failure,
honeypot submissions, malformed fields, and missing configuration.

Official documentation:
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/turnstile/troubleshooting/testing/
