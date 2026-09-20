'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  const inputClass =
    'w-full bg-[#111111] border border-[#2a2a2a] text-white text-sm px-4 py-3 focus:outline-none focus:border-[#f05a1a] transition-colors placeholder:text-gray-600';

  if (status === 'success') {
    return (
      <div className="bg-[#111111] border border-[#2a2a2a] px-8 py-12 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h3 className="font-[family-name:var(--font-display)] font-black text-2xl tracking-tight mb-2">
          MESSAGE SENT
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          We&apos;ve got it. Expect a reply within one business day.
        </p>
        <button
          onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }}
          className="mt-6 text-[#f05a1a] text-sm hover:underline font-[family-name:var(--font-display)] tracking-widest"
        >
          SEND ANOTHER
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-widest mb-1">
            NAME <span className="text-[#f05a1a]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="John Wick"
            className={inputClass}
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-widest mb-1">
            EMAIL <span className="text-[#f05a1a]">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-widest mb-1">
          SUBJECT
        </label>
        <select
          className={inputClass + ' cursor-pointer'}
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
        >
          <option value="">Select a topic...</option>
          <option value="Order Issue">Order Issue</option>
          <option value="Shipping Question">Shipping Question</option>
          <option value="Bulk / Wholesale">Bulk / Wholesale</option>
          <option value="Press / Media">Press / Media</option>
          <option value="General Question">General Question</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-widest mb-1">
          MESSAGE <span className="text-[#f05a1a]">*</span>
        </label>
        <textarea
          required
          rows={6}
          placeholder="What's on your mind..."
          className={inputClass + ' resize-none'}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#f05a1a] hover:bg-[#c44a12] disabled:bg-[#7a3010] disabled:cursor-not-allowed text-white font-[family-name:var(--font-display)] font-black tracking-widest py-4 text-sm transition-colors"
      >
        {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
      </button>
    </form>
  );
}
