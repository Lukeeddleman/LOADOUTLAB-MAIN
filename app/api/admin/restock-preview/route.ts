import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { restockHtml } from '@/lib/restock-email';
import { siteUrl } from '@/lib/site';

/**
 * Renders the restock email in the browser so it can be checked without
 * sending anything. Admin-only — it's not secret, but it isn't public either.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = siteUrl();
  return new NextResponse(restockHtml(baseUrl), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
