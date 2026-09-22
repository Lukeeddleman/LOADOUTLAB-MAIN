import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'kc_admin';

/**
 * The cookie holds an HMAC of a fixed phrase keyed by ADMIN_SECRET — never the
 * password itself. It's httpOnly, so page scripts can't read it back out, and
 * it changes if the secret is ever rotated.
 */
function expectedToken(): string | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;
  return createHmac('sha256', secret).update('kineticube-admin-v1').digest('hex');
}

/** Constant-time compare, so a wrong guess doesn't leak how close it was. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(password: unknown): string | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || typeof password !== 'string' || !password) return null;
  if (!safeEqual(password, secret)) return null;
  return expectedToken();
}

/** True when the caller presents a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, expected);
}
