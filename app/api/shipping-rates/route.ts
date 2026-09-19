import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, street1, street2, city, state, zip } = body;

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
    parcels: [
      {
        length: '3.75',
        width: '2.75',
        height: '1.5',
        distance_unit: 'in',
        weight: '5',  // oz — 95g product + ~50g packaging ≈ 5oz
        mass_unit: 'oz',
      },
    ],
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
