/**
 * Escape untrusted text for interpolation into our transactional email HTML.
 * These emails land in our own inbox, so this is about not mangling the
 * layout when a name or address contains & or <.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
