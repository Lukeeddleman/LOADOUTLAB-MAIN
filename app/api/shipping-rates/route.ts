import { NextRequest, NextResponse } from 'next/server';

// ── Parcel dimensions by quantity ──────────────────────────────────────────
// 1 pack  → 6×9×1.5in bubble mailer
// 2 packs → 7.25×11×1.5in bubble mailer
// 3-10    → ⚠️  PLACEHOLDER — update when packaging is confirmed
function getParcel(quantity: number) {
  if (quantity === 1) {
    return { length: '9', width: '6', height: '1.5', weight: '6', distance_unit: 'in', mass_unit: 'oz' };
  }
  if (quantity === 2) {
    return { length: '11', width: '7.25', height: '1.5', weight: '11', distance_unit: 'in', mass_unit: 'oz' };
  }
  // TODO: finalize box dimensions for 3+ packs — these are rough estimates
  const weight = Math.ceil(quantity * 5.5 + 3); // ~5.5oz per pack + 3oz box
  return { length: '12', width: '10', height: '4', weight: String(weight), distance_unit: 'in', mass_unit: 'oz' };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, street1, street2, city, state, zip, quantity = 1 } = body;

  if (!name || !street1 || !city || !state || !zip) {
    return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
  }

  const shipmentPayload = {
    address_from: {
      name: 'KinetiCube',
      street1: process.env.SHIP_FROM_STREET1,
      city: 'Kyle',
      state: 'TX',
      zip: process.env.SHIP_FROM_ZIP,
      country: 'US',
    },
    address_to: {
      name,
      street1,
      street2: street2 || '',
      city,
      state,
      zip,
      country: 'US',
    },
    parcels: [getParcel(quantity)],
    async: false,
  };

  const res = await fetch('https://api.goshippo.com/shipments/', {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shipmentPayload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Shippo error:', err);
    return NextResponse.json({ error: 'Failed to fetch shipping rates' }, { status: 500 });
  }

  const data = await res.json();

  // Filter to USPS only, positive prices, sort cheapest first
  const rates = (data.rates || [])
    .filter((r: {
      provider: string;
      servicelevel?: { token?: string };
      amount?: string;
    }) =>
      r.provider === 'USPS' &&
      r.servicelevel?.token &&
      parseFloat(r.amount ?? '0') > 0
    )
    .sort((a: { amount?: string }, b: { amount?: string }) =>
      parseFloat(a.amount ?? '0') - parseFloat(b.amount ?? '0')
    )
    .map((r: {
      object_id: string;
      provider: string;
      servicelevel: { name: string };
      amount: string;
      currency: string;
      estimated_days?: number;
    }) => ({
      id: r.object_id,
      provider: r.provider,
      service: r.servicelevel.name,
      amount: r.amount,
      currency: r.currency,
      estimated_days: r.estimated_days ?? null,
    }));

  return NextResponse.json({ rates });
}
