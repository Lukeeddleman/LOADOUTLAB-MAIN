import { siteUrl } from './site';

type Verification = 'valid' | 'invalid' | 'unavailable';

const testSecrets = new Set([
  '1x0000000000000000000000000000000AA',
  '2x0000000000000000000000000000000AA',
  '3x0000000000000000000000000000000AA',
]);

/** Only a successful, server-verified token can authorize a contact email. */
export async function verifyContactToken(token: unknown): Promise<Verification> {
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    return 'invalid';
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const isTestSecret = !!secret && testSecrets.has(secret);
  if (!secret || (process.env.NODE_ENV === 'production' && isTestSecret)) {
    console.error('[contact] Turnstile secret is missing or is a production test key.');
    return 'unavailable';
  }

  try {
    // Do not derive the allowlist from a caller-controlled Host/Origin header.
    const allowedHosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || new URL(siteUrl()).hostname)
      .split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!response.ok) return 'unavailable';

    const result = await response.json();
    if (!result || typeof result !== 'object' || typeof result.success !== 'boolean') {
      return 'unavailable';
    }
    if (!result.success) {
      if (result['error-codes']?.some((code: string) =>
        ['missing-input-secret', 'invalid-input-secret', 'internal-error'].includes(code))) {
        return 'unavailable';
      }
      return 'invalid';
    }
    // Cloudflare's dummy keys return a fixed action rather than the widget action.
    // This exception is only for the explicit test secrets, blocked above in production.
    if (!isTestSecret && result.action !== 'contact') return 'invalid';
    if (typeof result.hostname !== 'string' || !allowedHosts.includes(result.hostname.toLowerCase())) {
      return 'invalid';
    }
    return 'valid';
  } catch {
    console.error('[contact] Turnstile verification service unavailable.');
    return 'unavailable';
  }
}
