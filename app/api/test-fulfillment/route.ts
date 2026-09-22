import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getParcel } from '@/lib/parcel';

// ── DEV ONLY ─────────────────────────────────────────────────────────────────
// Runs the full fulfillment pipeline with stub order data so you can verify
// Shippo → PrintNode → email without needing a real Stripe purchase.
//
// Usage (with dev server running):
//   curl -X POST http://localhost:3000/api/test-fulfillment
// ─────────────────────────────────────────────────────────────────────────────

const STUB_ADDRESS = {
  name: 'Test Customer',
  street1: '123 Main St',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  country: 'US',
};

const SHIP_FROM = {
  name: 'KinetiCube',
  street1: process.env.SHIP_FROM_STREET1 ?? '1007 Hometown Pkwy',
  city: 'Kyle',
  state: 'TX',
  zip: process.env.SHIP_FROM_ZIP ?? '78640',
  country: 'US',
};

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const log: string[] = [];
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // ── 1. Create Shippo shipment + get rates ──────────────────────────────
    log.push('Creating Shippo shipment...');
    const shipmentRes = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_from: SHIP_FROM,
        address_to: STUB_ADDRESS,
        // Use the real 1-pack parcel so the test exercises production dimensions
        parcels: [getParcel(1)],
        async: false,
      }),
    });

    const shipment = await shipmentRes.json();
    const rates: { object_id: string; servicelevel: { name: string }; amount: string }[] =
      shipment.rates ?? [];

    if (!rates.length) {
      return NextResponse.json({ error: 'No Shippo rates returned', shipment }, { status: 500 });
    }

    // Pick cheapest USPS rate
    const rate = rates
      .filter(r => r.servicelevel?.name)
      .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0];

    log.push(`Got rate: ${rate.servicelevel.name} — $${rate.amount} (ID: ${rate.object_id})`);

    // ── 2. Purchase label ──────────────────────────────────────────────────
    log.push('Purchasing label...');
    const labelRes = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: rate.object_id,
        label_file_type: 'PDF_4x6',
        async: false,
      }),
    });

    const labelData = await labelRes.json();

    if (labelData.status !== 'SUCCESS' || !labelData.label_url) {
      return NextResponse.json({ error: 'Label purchase failed', labelData }, { status: 500 });
    }

    const labelUrl: string = labelData.label_url;
    const trackingNumber: string = labelData.tracking_number;
    const trackingUrlProvider: string = labelData.tracking_url_provider;
    log.push(`Label URL: ${labelUrl}`);
    log.push(`Tracking: ${trackingNumber}`);

    // ── 3. Send to PrintNode ───────────────────────────────────────────────
    log.push('Downloading label PDF...');
    const pdfRes = await fetch(labelUrl);
    const pdfBuffer = await pdfRes.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    log.push(`Sending to PrintNode (printer ${process.env.PRINTNODE_PRINTER_ID})...`);
    const printRes = await fetch('https://api.printnode.com/printjobs', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.PRINTNODE_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        printerId: Number(process.env.PRINTNODE_PRINTER_ID),
        title: `[TEST] KinetiCube — ${STUB_ADDRESS.name}`,
        contentType: 'pdf_base64',
        content: pdfBase64,
        source: 'kineticube-test',
      }),
    });

    const labelPrinted = printRes.ok;
    const printResult = await printRes.text();
    log.push(labelPrinted ? `PrintNode OK — job ID: ${printResult}` : `PrintNode FAILED: ${printResult}`);

    // ── 4. Send order email ────────────────────────────────────────────────
    log.push('Sending order email...');
    await resend.emails.send({
      from: 'KinetiCube Orders <noreply@kineticube.shop>',
      to: 'support@kineticube.shop',
      subject: `[TEST] New Order — ${STUB_ADDRESS.name} · 1 6-pack`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;color:#222;">
          <h2 style="color:#f05a1a;">🧪 TEST ORDER — do not fulfill</h2>
          <hr style="border-color:#eee;margin-bottom:16px;" />
          <p><strong>Customer:</strong> ${STUB_ADDRESS.name}</p>
          <p><strong>Ship to:</strong><br>${STUB_ADDRESS.street1}<br>${STUB_ADDRESS.city}, ${STUB_ADDRESS.state} ${STUB_ADDRESS.zip}</p>
          <p><strong>Tracking:</strong> <a href="${trackingUrlProvider}">${trackingNumber}</a></p>
          <hr style="border-color:#eee;margin:16px 0;" />
          <p>
            <a href="${labelUrl}"
               style="background:#f05a1a;color:white;padding:10px 20px;text-decoration:none;font-weight:bold;display:inline-block;">
              📦 Download Label
            </a>
          </p>
          <p style="color:#999;font-size:12px;">
            Label ${labelPrinted ? 'sent to printer ✅' : '⚠️ not sent to printer — print manually.'}
          </p>
        </div>
      `,
    });
    log.push('Email sent.');

    return NextResponse.json({ success: true, log, labelUrl, trackingNumber, labelPrinted });
  } catch (err) {
    log.push(`Error: ${String(err)}`);
    return NextResponse.json({ success: false, log, error: String(err) }, { status: 500 });
  }
}
