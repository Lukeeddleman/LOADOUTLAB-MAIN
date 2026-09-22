'use client';

import { useState } from 'react';

export default function RestockNotify() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="border border-[#f05a1a]/40 bg-[#f05a1a]/10 px-4 py-4 mb-4 text-center">
        <p className="font-[family-name:var(--font-display)] font-black tracking-widest text-sm text-[#f05a1a]">
          YOU&apos;RE ON THE LIST
        </p>
        <p className="text-gray-400 text-xs mt-1">
          We&apos;ll email you the moment the next batch is ready.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mb-4">
      <label className="block text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-2">
        GET NOTIFIED WHEN WE RESTOCK
      </label>
      <div className="flex gap-2">
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 bg-[#111111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-[#f05a1a] focus:outline-none transition-colors placeholder:text-gray-700"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="bg-[#f05a1a] hover:bg-[#c44a12] disabled:bg-[#2a2a2a] disabled:text-gray-600 text-white font-[family-name:var(--font-display)] font-black tracking-widest text-sm px-6 transition-colors"
        >
          {state === 'sending' ? '...' : 'NOTIFY ME'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </form>
  );
}
