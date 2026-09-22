'use client';

import { useEffect, useState } from 'react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const PRODUCT_PRICE = 12.99;

interface Address {
  name: string;
  email: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
}

interface Rate {
  id: string;
  provider: string;
  service: string;
  /** Stable servicelevel token — the only part of the rate the server trusts. */
  token: string;
  amount: string;
  currency: string;
  estimated_days: number | null;
}

const inputClass =
  'w-full bg-[#111111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-[#f05a1a] focus:outline-none transition-colors placeholder:text-gray-700';
const labelClass =
  'block text-xs font-[family-name:var(--font-display)] tracking-label text-gray-500 mb-1';

export default function CheckoutPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState<Address>({
    name: '', email: '', street1: '', street2: '', city: '', state: '', zip: '',
  });
  const [quantity, setQuantity] = useState(1);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /** True when live rates were unavailable and we're quoting a flat rate. */
  const [degraded, setDegraded] = useState(false);
  /** Packs available, or null when there's no limit we know of. */
  const [available, setAvailable] = useState<number | null>(null);

  // Cap the quantity picker to what's actually in stock, so nobody fills in a
  // whole address only to be rejected at the last step.
  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => {
        if (typeof data.stock === 'number') setAvailable(data.stock);
      })
      .catch(() => {});
  }, []);

  const maxQuantity = available === null ? 10 : Math.min(10, available);

  // Shipping is quoted for a specific quantity (the parcel size depends on it),
  // and the server re-prices against the quantity it's given. Changing quantity
  // after quoting would show one shipping price and charge another, so send the
  // customer back to re-quote.
  function changeQuantity(next: number) {
    setQuantity(next);
    if (step === 2) {
      setStep(1);
      setRates([]);
      setSelectedRate(null);
      setError('Quantity changed — please confirm your address to update shipping.');
    }
  }

  const subtotal = PRODUCT_PRICE * quantity;
  const shipping = selectedRate ? parseFloat(selectedRate.amount) : null;
  const total = shipping !== null ? subtotal + shipping : subtotal;

  async function fetchRates(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...address, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get rates');
      if (!data.rates || data.rates.length === 0) throw new Error('No USPS rates available for that address');
      setDegraded(Boolean(data.degraded));
      setRates(data.rates);
      setSelectedRate(data.rates[0]);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!selectedRate) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          serviceToken: selectedRate.token,
          quantity,
          // Only consulted if Shippo is down when the server re-prices, so the
          // customer isn't charged less than the figure they were just shown.
          // The server clamps it to its own floor — it can't be tampered down.
          quotedShippingCents: Math.round(parseFloat(selectedRate.amount) * 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="font-[family-name:var(--font-display)] font-black text-4xl tracking-tight">
            CHECKOUT
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? 'Enter your shipping address' : 'Select shipping & confirm'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Order Summary Card */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-5 mb-8">
          <p className="text-xs font-[family-name:var(--font-display)] tracking-label text-gray-500 mb-4">ORDER SUMMARY</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">KinetiCube™ 6-Pack</p>
              <p className="text-gray-600 text-xs mt-0.5">Reactive Powder Targets</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1">
                <button
                  onClick={() => changeQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-500 hover:text-white w-5 text-center select-none"
                >−</button>
                <span className="text-white text-sm w-5 text-center">{quantity}</span>
                <button
                  onClick={() => changeQuantity(Math.min(maxQuantity, quantity + 1))}
                  className="text-gray-500 hover:text-white w-5 text-center select-none"
                >+</button>
              </div>
              <span className="text-white font-bold w-16 text-right">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {available !== null && available > 0 && available <= 10 && (
            <p className="text-[#f05a1a] text-sm font-[family-name:var(--font-display)] font-semibold tracking-label mt-3">
              ONLY {available} PACK{available === 1 ? '' : 'S'} LEFT IN THIS BATCH
            </p>
          )}

          {step === 2 && selectedRate && (
            <>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-3 mt-3 border-t border-[#1a1a1a]">
                <span>Shipping</span>
                <span>${parseFloat(selectedRate.amount).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-white font-bold pt-2 mt-2 border-t border-[#2a2a2a]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/40 border border-red-700/40 text-red-300 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ── STEP 1: Address Form ── */}
        {step === 1 && (
          <form onSubmit={fetchRates} className="space-y-4">
            <div>
              <label className={labelClass}>FULL NAME</label>
              <input
                required
                className={inputClass}
                placeholder="John Smith"
                value={address.name}
                onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>EMAIL</label>
              <input
                required
                type="email"
                className={inputClass}
                placeholder="you@example.com"
                value={address.email}
                onChange={e => setAddress(a => ({ ...a, email: e.target.value }))}
              />
              <p className="text-gray-700 text-xs mt-1">
                For your shipping confirmation and tracking updates.
              </p>
            </div>
            <div>
              <label className={labelClass}>ADDRESS LINE 1</label>
              <input
                required
                className={inputClass}
                placeholder="123 Main St"
                value={address.street1}
                onChange={e => setAddress(a => ({ ...a, street1: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>ADDRESS LINE 2 <span className="text-gray-700">(optional)</span></label>
              <input
                className={inputClass}
                placeholder="Apt 4B"
                value={address.street2}
                onChange={e => setAddress(a => ({ ...a, street2: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3">
                <label className={labelClass}>CITY</label>
                <input
                  required
                  className={inputClass}
                  placeholder="Austin"
                  value={address.city}
                  onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                />
              </div>
              <div className="col-span-1">
                <label className={labelClass}>STATE</label>
                <select
                  required
                  className={inputClass + ' cursor-pointer'}
                  value={address.state}
                  onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                >
                  <option value="">—</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>ZIP CODE</label>
                <input
                  required
                  className={inputClass}
                  placeholder="78701"
                  maxLength={10}
                  value={address.zip}
                  onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f05a1a] hover:bg-[#c44a12] disabled:opacity-40 text-white font-[family-name:var(--font-display)] font-black tracking-widest text-lg py-4 transition-colors mt-2"
            >
              {loading ? 'CALCULATING RATES...' : 'GET SHIPPING RATES →'}
            </button>
          </form>
        )}

        {/* ── STEP 2: Rate Selection ── */}
        {step === 2 && (
          <div>
            {/* Address recap + edit link */}
            <div className="bg-[#111111] border border-[#1a1a1a] px-4 py-3 mb-6">
              <div className="flex items-start justify-between">
                <div className="text-sm">
                  <p className="text-xs font-[family-name:var(--font-display)] tracking-label text-gray-500 mb-1">SHIPPING TO</p>
                  <p className="text-white">{address.name}</p>
                  <p className="text-gray-400">{address.street1}{address.street2 ? `, ${address.street2}` : ''}</p>
                  <p className="text-gray-400">{address.city}, {address.state} {address.zip}</p>
                </div>
                <button
                  onClick={() => { setStep(1); setRates([]); setSelectedRate(null); }}
                  className="text-[#f05a1a] hover:text-[#c44a12] text-xs font-[family-name:var(--font-display)] tracking-label shrink-0 ml-4 mt-0.5"
                >
                  EDIT
                </button>
              </div>
            </div>

            <p className="text-xs font-[family-name:var(--font-display)] tracking-label text-gray-500 mb-3">SELECT SHIPPING METHOD</p>
            <div className="space-y-3 mb-8">
              {degraded && (
                <p className="text-gray-500 text-xs mb-1">
                  Live carrier rates are temporarily unavailable, so we&apos;re quoting our
                  standard flat rate. Your order ships as normal.
                </p>
              )}
              {rates.map(rate => (
                <button
                  key={rate.id}
                  onClick={() => setSelectedRate(rate)}
                  className={`w-full flex items-center justify-between px-4 py-4 border text-left transition-colors ${
                    selectedRate?.id === rate.id
                      ? 'border-[#f05a1a] bg-[#f05a1a]/10'
                      : 'border-[#2a2a2a] bg-[#111111] hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                      selectedRate?.id === rate.id ? 'border-[#f05a1a] bg-[#f05a1a]' : 'border-[#444]'
                    }`} />
                    <div>
                      <p className="text-white text-sm font-medium">USPS {rate.service}</p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {rate.estimated_days
                          ? `Est. ${rate.estimated_days} business day${rate.estimated_days !== 1 ? 's' : ''}`
                          : 'Estimated delivery varies'}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${selectedRate?.id === rate.id ? 'text-[#f05a1a]' : 'text-white'}`}>
                    ${parseFloat(rate.amount).toFixed(2)}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !selectedRate}
              className="w-full bg-[#f05a1a] hover:bg-[#c44a12] disabled:opacity-40 text-white font-[family-name:var(--font-display)] font-black tracking-widest text-xl py-5 transition-colors"
            >
              {loading ? 'REDIRECTING TO PAYMENT...' : `PAY $${total.toFixed(2)} →`}
            </button>
            <p className="text-gray-700 text-xs text-center mt-3">
              Secure checkout powered by Stripe
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
