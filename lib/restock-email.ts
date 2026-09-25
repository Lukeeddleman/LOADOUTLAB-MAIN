import { Resend } from 'resend';
import { restockFrom, supportTo } from './email-config';
import { siteUrl } from './site';

/** Resend accepts at most 100 messages per batch request. */
const BATCH_SIZE = 100;

export interface RestockSendResult {
  sent: number;
  failed: number;
  error?: string;
}

export const RESTOCK_SUBJECT = 'Kineticube is back in stock';

// Email clients mostly ignore @font-face, so the brand's Barlow Condensed will
// only load in a few (Apple Mail). The condensed fallbacks keep the tall,
// narrow feel elsewhere, and the weight + letter-spacing carry the rest.
const DISPLAY_FONT =
  "'Barlow Condensed','Oswald','Arial Narrow',Arial,Helvetica,sans-serif";
const BODY_FONT = "'Barlow','Helvetica Neue',Helvetica,Arial,sans-serif";

const ORANGE = '#f05a1a';
const BG = '#0d0d0d';
const PANEL = '#111111';
const BORDER = '#1f1f1f';

/**
 * Built on tables with inline styles and explicit bgcolor attributes, because
 * Outlook ignores most modern CSS and would otherwise drop the dark background
 * and leave black text on black.
 *
 * Everything lives inside one self-contained dark card. Gmail strips <body>
 * and re-wraps the message, so the page background can't be relied on — but a
 * card that carries its own background renders the same whatever surrounds it.
 * On Gmail that reads as a dark card on white; where the page background does
 * survive it's seamless. Both look deliberate, and no text is ever left
 * sitting on a colour it can't be read against.
 */
export function restockHtml(baseUrl: string): string {
  const shopUrl = `${baseUrl}/kineticube/shop`;
  const businessLocation = process.env.BUSINESS_ADDRESS || 'Kyle, Texas, USA';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${RESTOCK_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};">

<!-- Inbox preview line: shown next to the subject, hidden in the body. -->
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  Stick it. Shoot it. See it. A fresh batch just came off the printers in Texas.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};">
<tr>
<td align="center" bgcolor="${BG}" style="background-color:${BG};padding:28px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${PANEL}" style="width:100%;max-width:600px;background-color:${PANEL};border:1px solid ${BORDER};">

    <!-- Wordmark, inside the card so it never lands on an unknown background.
         The orange mark is used rather than the white one: it reads either way. -->
    <tr>
      <td align="center" bgcolor="${PANEL}" style="background-color:${PANEL};padding:28px 16px 24px 16px;">
        <img src="${baseUrl}/logo-orange.png" width="40" height="40" alt=""
             style="display:block;border:0;outline:none;margin:0 auto 10px auto;" />
        <div style="font-family:${DISPLAY_FONT};font-size:26px;font-weight:900;letter-spacing:5px;color:#ffffff;text-transform:uppercase;">
          KINETICUBE
        </div>
        <div style="font-family:${BODY_FONT};font-size:11px;letter-spacing:3px;color:${ORANGE};text-transform:uppercase;padding-top:5px;">
          Stick it. Shoot it. See it.
        </div>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td bgcolor="${PANEL}" style="background-color:${PANEL};">

        <!-- Product shot: if images are blocked, the headline below still carries it -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" bgcolor="${PANEL}" style="background-color:${PANEL};padding:0;">
              <img src="${baseUrl}/email-cube-red.jpg" width="598" alt="A red Kineticube reactive powder target"
                   style="display:block;border:0;outline:none;width:100%;max-width:598px;height:auto;" />
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td bgcolor="${PANEL}" style="background-color:${PANEL};padding:32px 32px 8px 32px;">

              <div style="display:inline-block;background-color:${ORANGE};color:#ffffff;font-family:${DISPLAY_FONT};font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 12px;">
                Restocked
              </div>

              <h1 style="margin:18px 0 0 0;font-family:${DISPLAY_FONT};font-size:46px;line-height:1.02;font-weight:900;letter-spacing:-0.5px;color:#ffffff;text-transform:uppercase;">
                Back in<br>stock
              </h1>

              <p style="margin:18px 0 0 0;font-family:${BODY_FONT};font-size:16px;line-height:1.65;color:#b5b5b5;">
                A fresh batch of reactive powder targets just came off the printers.
                One-inch cubes, six vivid colors, a burst of powder on every hit —
                made in small runs right here in Texas.
              </p>

              <p style="margin:14px 0 0 0;font-family:${BODY_FONT};font-size:16px;line-height:1.65;color:#b5b5b5;">
                You asked us to let you know the moment they were back. Batches are
                small and they tend to move quickly.
              </p>

            </td>
          </tr>

          <!-- Bulletproof button: table-based so Outlook renders the orange block -->
          <tr>
            <td bgcolor="${PANEL}" style="background-color:${PANEL};padding:26px 32px 34px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="${ORANGE}" style="background-color:${ORANGE};">
                    <a href="${shopUrl}"
                       style="display:inline-block;padding:16px 42px;font-family:${DISPLAY_FONT};font-size:17px;font-weight:900;letter-spacing:3px;color:#ffffff;text-decoration:none;text-transform:uppercase;">
                      Grab a pack
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Reassurance strip -->
    <tr>
      <td align="center" bgcolor="${BG}" style="background-color:${BG};padding:14px 16px;font-family:${BODY_FONT};font-size:11px;letter-spacing:2px;color:#8a8a8a;text-transform:uppercase;">
        Made in the USA &nbsp;·&nbsp; Ships USPS from Texas &nbsp;·&nbsp; Non-explosive
      </td>
    </tr>

    <!-- Footer, also inside the card -->
    <tr>
      <td bgcolor="${PANEL}" style="background-color:${PANEL};padding:20px 32px 26px 32px;">
        <p style="margin:0 0 10px 0;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:#8a8a8a;">
          You're receiving this because you asked
          <a href="${shopUrl}" style="color:${ORANGE};text-decoration:none;">Loadout Lab</a>
          to tell you when Kineticube came back in stock. This is a one-time notice —
          you've already been removed from that list and won't get anything else from us.
        </p>
        <p style="margin:0 0 10px 0;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:#8a8a8a;">
          Questions? Just reply to this email — it reaches us directly.
        </p>
        <p style="margin:0;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:#6a6a6a;">
          Kineticube · ${businessLocation}
        </p>
      </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>`;
}

/** Plain-text alternative. Its absence is itself a spam signal. */
export function restockText(baseUrl: string): string {
  const businessLocation = process.env.BUSINESS_ADDRESS || 'Kyle, Texas, USA';
  return `KINETICUBE — STICK IT. SHOOT IT. SEE IT.

BACK IN STOCK

A fresh batch of reactive powder targets just came off the printers.
One-inch cubes, six vivid colors, a burst of powder on every hit — made
in small runs right here in Texas.

You asked us to let you know the moment they were back. Batches are small
and they tend to move quickly.

Grab a pack: ${baseUrl}/kineticube/shop

Made in the USA · Ships USPS from Texas · Non-explosive

---
You're receiving this because you asked Loadout Lab to tell you when
Kineticube came back in stock. This is a one-time notice — you've
already been removed from that list and won't get anything else from us.

Questions? Just reply to this email.

Kineticube · ${businessLocation}
`;
}

/**
 * Email everyone waiting for a restock, one message each.
 *
 * Uses the batch API rather than one message with many recipients, so nobody
 * sees anyone else's address.
 */
export async function sendRestockEmails(emails: string[]): Promise<RestockSendResult> {
  if (emails.length === 0) return { sent: 0, failed: 0 };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = siteUrl();
  const html = restockHtml(baseUrl);
  const text = restockText(baseUrl);

  let sent = 0;
  let failed = 0;
  let firstError: string | undefined;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    try {
      const result = await resend.batch.send(
        chunk.map(to => ({
          from: restockFrom(),
          // A monitored reply address is both useful and a trust signal.
          replyTo: supportTo(),
          to,
          subject: RESTOCK_SUBJECT,
          html,
          text,
          // Mailbox providers treat bulk mail that offers a machine-readable
          // opt-out more favourably than mail that doesn't, even when the list
          // is one-shot like this one.
          headers: {
            'List-Unsubscribe': `<mailto:${supportTo()}?subject=unsubscribe>`,
          },
        })),
      );

      // Resend reports API failures in `error` rather than throwing.
      if (result.error) {
        failed += chunk.length;
        firstError ??= result.error.message ?? JSON.stringify(result.error);
      } else {
        sent += chunk.length;
      }
    } catch (err) {
      failed += chunk.length;
      firstError ??= err instanceof Error ? err.message : String(err);
    }
  }

  return { sent, failed, error: firstError };
}
