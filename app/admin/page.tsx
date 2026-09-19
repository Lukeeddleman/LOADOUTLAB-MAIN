'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [newStock, setNewStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch current stock once authenticated
  useEffect(() => {
    if (!authed) return;
    fetch('/api/stock')
      .then(r => r.json())
      .then(d => {
        setCurrentStock(d.stock);
        if (d.stock !== null) setNewStock(String(d.stock));
      })
      .catch(() => setError('Could not load stock — check Upstash Redis is connected in Vercel.'));
  }, [authed]);

  // Verify password against server before granting access
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Incorrect password');
      }
      setAuthed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Incorrect password');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, stock: parseInt(newStock) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setCurrentStock(data.stock);
      setNewStock(String(data.stock));
      setMessage(`Stock updated to ${data.stock} pack${data.stock !== 1 ? 's' : ''}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setAuthed(false);
    setSecret('');
    setMessage('');
    setError('');
    setCurrentStock(null);
    setNewStock('');
  }

  const inputClass =
    'w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-[#f05a1a] focus:outline-none transition-colors placeholder:text-gray-700';

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-widest text-xs mb-2">
            KINETICUBE
          </p>
          <h1 className="font-[family-name:var(--font-display)] font-black text-3xl tracking-wide">
            STOCK ADMIN
          </h1>
        </div>

        {!authed ? (
          /* ── Password gate ── */
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-1">
                ADMIN PASSWORD
              </label>
              <input
                type="password"
                required
                autoFocus
                className={inputClass}
                placeholder="••••••••"
                value={secret}
                onChange={e => setSecret(e.target.value)}
              />
            </div>
            {error && (
              <div className="bg-red-950/40 border border-red-700/40 text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !secret.trim()}
              className="w-full bg-[#f05a1a] hover:bg-[#c44a12] disabled:opacity-40 text-white font-[family-name:var(--font-display)] font-black tracking-widest py-3 transition-colors"
            >
              {loading ? 'CHECKING...' : 'ENTER →'}
            </button>
          </form>
        ) : (
          /* ── Stock manager ── */
          <form onSubmit={handleUpdate} className="space-y-6">

            {/* Current stock display */}
            <div className="bg-[#111111] border border-[#1a1a1a] px-5 py-4">
              <p className="text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-2">
                CURRENT STOCK
              </p>
              {currentStock === null && !error ? (
                <p className="text-gray-600 text-sm">Loading...</p>
              ) : (
                <p className={`font-[family-name:var(--font-display)] font-black text-4xl tracking-wide ${
                  currentStock === 0 ? 'text-red-400' : currentStock !== null && currentStock <= 20 ? 'text-yellow-400' : 'text-white'
                }`}>
                  {currentStock ?? '—'}
                  <span className="text-gray-600 text-lg font-normal tracking-normal ml-2">packs</span>
                </p>
              )}
              {currentStock === 0 && (
                <p className="text-red-400 text-xs mt-1 font-[family-name:var(--font-display)] tracking-widest">
                  BUY BUTTON IS DISABLED ON SITE
                </p>
              )}
            </div>

            {/* New stock input */}
            <div>
              <label className="block text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-1">
                SET NEW STOCK COUNT
              </label>
              <input
                type="number"
                required
                min={0}
                className={inputClass}
                placeholder="0"
                value={newStock}
                onChange={e => setNewStock(e.target.value)}
              />
            </div>

            {/* Feedback */}
            {message && (
              <div className="bg-green-950/40 border border-green-700/40 text-green-300 px-4 py-3 text-sm font-[family-name:var(--font-display)] tracking-wide">
                ✓ {message}
              </div>
            )}
            {error && (
              <div className="bg-red-950/40 border border-red-700/40 text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newStock}
              className="w-full bg-[#f05a1a] hover:bg-[#c44a12] disabled:opacity-40 text-white font-[family-name:var(--font-display)] font-black tracking-widest py-4 text-lg transition-colors"
            >
              {loading ? 'SAVING...' : 'UPDATE STOCK →'}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="w-full text-gray-700 hover:text-gray-400 text-xs font-[family-name:var(--font-display)] tracking-widest transition-colors py-1"
            >
              SIGN OUT
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
