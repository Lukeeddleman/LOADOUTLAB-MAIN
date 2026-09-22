'use client';

import { useCallback, useEffect, useState } from 'react';
import { LOW_STOCK_THRESHOLD } from '@/lib/stock-config';

const inputClass =
  'w-full bg-[#111111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-[#f05a1a] focus:outline-none transition-colors placeholder:text-gray-700';
const labelClass =
  'block text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-1';
const buttonClass =
  'w-full bg-[#f05a1a] hover:bg-[#c44a12] disabled:bg-[#2a2a2a] disabled:text-gray-600 text-white font-[family-name:var(--font-display)] font-black tracking-widest py-3 transition-colors';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [stock, setStock] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [waitlist, setWaitlist] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stock');
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setAuthed(true);
      setStock(data.stock);
      setDraft(data.stock === null ? '' : String(data.stock));
      setWaitlist(data.waitlist ?? []);
      setConfig(data.config ?? '');
    } finally {
      setChecking(false);
    }
  }, []);

  // The session cookie is httpOnly, so the only way to know whether we're still
  // signed in is to ask the server.
  useEffect(() => {
    load();
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      setPassword('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(draft) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save.');
      setStock(data.stock);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthed(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <p className="text-gray-600 text-sm font-[family-name:var(--font-display)] tracking-widest">
          LOADING…
        </p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
        <form onSubmit={login} className="w-full max-w-sm">
          <h1 className="font-[family-name:var(--font-display)] font-black text-3xl tracking-tight mb-6">
            STOCK ADMIN
          </h1>
          <label className={labelClass}>PASSWORD</label>
          <input
            autoFocus
            required
            type="password"
            className={inputClass}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          <button type="submit" disabled={busy} className={`${buttonClass} mt-4`}>
            {busy ? 'CHECKING…' : 'SIGN IN'}
          </button>
        </form>
      </div>
    );
  }

  const count = Number(draft);
  const preview = Number.isInteger(count) && count >= 0 ? count : null;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-8">
        <div className="max-w-xl mx-auto px-4 flex items-end justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] font-black text-4xl tracking-tight">
              STOCK
            </h1>
            <p className="text-gray-500 text-sm mt-1">Packs on hand</p>
          </div>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-white text-xs font-[family-name:var(--font-display)] tracking-widest"
          >
            SIGN OUT
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-8">
          <p className="text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-2">
            CURRENTLY LIVE
          </p>
          <p className="font-[family-name:var(--font-display)] font-black text-6xl tracking-tight">
            {stock === null ? '—' : stock}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            {stock === null
              ? 'No count set yet — the shop is selling without a limit.'
              : stock === 0
                ? 'Shop is showing SOLD OUT and collecting restock emails.'
                : stock <= LOW_STOCK_THRESHOLD
                  ? 'Shop is showing the low-stock urgency message.'
                  : 'Shop is showing the normal in-stock badge.'}
          </p>
          {config && (
            <p className="text-gray-700 text-xs mt-3 border-t border-[#1a1a1a] pt-3">
              Storage: {config}
            </p>
          )}
        </div>

        <form onSubmit={save} className="mb-10">
          <label className={labelClass}>SET NEW COUNT</label>
          <input
            required
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className={inputClass}
            value={draft}
            onChange={e => {
              setDraft(e.target.value);
              setSaved(false);
            }}
          />
          {preview !== null && (
            <p className="text-gray-600 text-xs mt-2">
              {preview === 0
                ? 'Shop will show SOLD OUT.'
                : preview <= LOW_STOCK_THRESHOLD
                  ? `Shop will show “HURRY — ONLY ${preview} LEFT”.`
                  : 'Shop will show the normal in-stock badge.'}
            </p>
          )}
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          {saved && <p className="text-[#f05a1a] text-xs mt-2">Saved — the shop is updated.</p>}
          <button type="submit" disabled={busy} className={`${buttonClass} mt-4`}>
            {busy ? 'SAVING…' : 'UPDATE STOCK'}
          </button>
        </form>

        <div className="border-t border-[#1a1a1a] pt-8">
          <p className="text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-3">
            RESTOCK WAITLIST — {waitlist.length}
          </p>
          {waitlist.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Nobody waiting. Emails collected while you&apos;re sold out show up here.
            </p>
          ) : (
            <>
              <div className="bg-[#111111] border border-[#1a1a1a] p-4 max-h-64 overflow-y-auto mb-3">
                {waitlist.map(email => (
                  <p key={email} className="text-gray-400 text-sm font-mono">
                    {email}
                  </p>
                ))}
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(waitlist.join(', '))}
                className="text-[#f05a1a] hover:underline text-xs font-[family-name:var(--font-display)] tracking-widest"
              >
                COPY ALL
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
