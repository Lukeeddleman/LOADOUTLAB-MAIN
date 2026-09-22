import { Resend } from 'resend';

/** Resend accepts at most 100 messages per batch request. */
const BATCH_SIZE = 100;

export interface RestockSendResult {
  sent: number;
  failed: number;
  error?: string;
}

function restockHtml(shopUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;color:#222;">
      <h2 style="color:#f05a1a;letter-spacing:1px;margin-bottom:4px;">BACK IN STOCK 🎯</h2>
      <hr style="border-color:#eee;margin-bottom:16px;" />

      <p style="font-size:16px;line-height:1.6;">
        A fresh batch of KinetiCube™ reactive powder targets just came off the line —
        made in small runs right here in Texas.
      </p>
      <p style="font-size:16px;line-height:1.6;">
        You asked us to let you know the moment they were back. They tend to go quickly.
      </p>

      <p style="margin:28px 0;">
        <a href="${shopUrl}"
           style="background:#f05a1a;color:#ffffff;padding:14px 32px;text-decoration:none;
                  font-weight:bold;letter-spacing:2px;display:inline-block;font-size:16px;">
          SHOP NOW
        </a>
      </p>

      <hr style="border-color:#eee;margin:24px 0 12px;" />
      <p style="color:#999;font-size:12px;line-height:1.5;">
        You're getting this because you signed up to be notified when KinetiCube was
        restocked. This is a one-time notice — you've been taken off the list and
        won't receive anything else from us.
      </p>
    </div>
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kineticube.shop';
  const html = restockHtml(`${baseUrl}/shop`);

  let sent = 0;
  let failed = 0;
  let firstError: string | undefined;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    try {
      const result = await resend.batch.send(
        chunk.map(to => ({
          from: 'KinetiCube <noreply@kineticube.shop>',
          to,
          subject: 'Back in stock — KinetiCube™ reactive targets',
          html,
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
