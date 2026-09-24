/**
 * Free end-to-end dry run of the order → label → print pipeline.
 *
 * Simulates a completed Stripe checkout and delivers it to the local webhook
 * TWICE, which is the thing worth proving: the second delivery must be ignored
 * rather than buying and printing a second label.
 *
 * Nothing here costs money — it refuses to run unless both Stripe and Shippo
 * are pointed at their test environments.
 *
 * Usage (with `npm run dev` running in another terminal):
 *   npm run dry-run
 *   npm run dry-run -- --degraded   # simulate Shippo being down at checkout
 */

import Stripe from 'stripe';

const WEBHOOK_URL = process.env.DRY_RUN_URL || 'http://localhost:3000/api/webhook';
const DEGRADED = process.argv.includes('--degraded');

const SHIP_TO = {
  name: 'Dry Run Customer',
  street1: '1600 Pennsylvania Ave NW',
  city: 'Washington',
  state: 'DC',
  zip: '20500',
  country: 'US',
};

const green = s => `\x1b[32m${s}\x1b[0m`;
const red = s => `\x1b[31m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const bold = s => `\x1b[1m${s}\x1b[0m`;
const dim = s => `\x1b[2m${s}\x1b[0m`;

function fail(message) {
  console.error(`\n${red('✗ ' + message)}\n`);
  process.exit(1);
}

// ── Safety: refuse anything that could spend real money ────────────────────
const stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
const shippoKey = process.env.SHIPPO_API_KEY ?? '';

if (!stripeKey.startsWith('sk_test_')) {
  fail(
    'STRIPE_SECRET_KEY is not a test key.\n' +
      '  Expected it to start with "sk_test_".\n' +
      '  Refusing to run so this cannot charge a real card.',
  );
}
if (!shippoKey.startsWith('shippo_test_')) {
  fail(
    'SHIPPO_API_KEY is not a test token.\n' +
      '  Expected it to start with "shippo_test_".\n' +
      '  Refusing to run so this cannot buy a real shipping label.',
  );
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  fail('STRIPE_WEBHOOK_SECRET is not set. Any value works locally, e.g. whsec_local_dry_run.');
}

const stripe = new Stripe(stripeKey);

console.log(bold('\nKineticube — order pipeline dry run'));
console.log(dim('Test mode only. No real money, no real postage.\n'));

// ── 1. Get a Shippo test rate, exactly as checkout would ───────────────────
let rateId = '';

if (DEGRADED) {
  console.log('1. Skipping the rate lookup to simulate Shippo being down at checkout.');
  console.log(dim('   The webhook should recover by re-quoting on its own.\n'));
} else {
  process.stdout.write('1. Asking Shippo for a test rate... ');
  const shipmentRes = await fetch('https://api.goshippo.com/shipments/', {
    method: 'POST',
    headers: { Authorization: `ShippoToken ${shippoKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address_from: {
        name: 'Kineticube',
        street1: process.env.SHIP_FROM_STREET1 ?? '1007 Hometown Pkwy',
        city: 'Kyle',
        state: 'TX',
        zip: process.env.SHIP_FROM_ZIP ?? '78640',
        country: 'US',
      },
      address_to: SHIP_TO,
      parcels: [
        { length: '9', width: '6', height: '1.5', weight: '6', distance_unit: 'in', mass_unit: 'oz' },
      ],
      async: false,
    }),
  });

  if (!shipmentRes.ok) fail(`Shippo returned ${shipmentRes.status}: ${await shipmentRes.text()}`);

  const shipment = await shipmentRes.json();
  const rates = (shipment.rates ?? [])
    .filter(r => r.provider === 'USPS' && parseFloat(r.amount ?? '0') > 0)
    .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));

  if (!rates.length) fail('Shippo returned no USPS rates for the test address.');

  rateId = rates[0].object_id;
  console.log(green(`${rates[0].servicelevel.name} — $${rates[0].amount}`));
}

// ── 2. Create a test PaymentIntent (the duplicate guard is stored on it) ───
process.stdout.write('2. Creating a test payment... ');
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1299 + 700,
  currency: 'usd',
  payment_method_types: ['card'],
  description: 'Kineticube dry run',
});
console.log(green(paymentIntent.id));

// ── 3. Build the event Stripe would send us ────────────────────────────────
const payload = JSON.stringify({
  id: `evt_dry_run_${Date.now()}`,
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: `cs_dry_run_${Date.now()}`,
      object: 'checkout.session',
      payment_status: 'paid',
      payment_intent: paymentIntent.id,
      metadata: {
        ship_to_name: SHIP_TO.name,
        ship_to_street1: SHIP_TO.street1,
        ship_to_street2: '',
        ship_to_city: SHIP_TO.city,
        ship_to_state: SHIP_TO.state,
        ship_to_zip: SHIP_TO.zip,
        shippo_rate_id: rateId,
        ship_service_token: DEGRADED ? 'kc_flat_fallback' : '',
        shippo_degraded: DEGRADED ? 'true' : '',
        quantity: '1',
      },
    },
  },
});

const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: process.env.STRIPE_WEBHOOK_SECRET,
});

async function deliver(attempt) {
  let res;
  try {
    res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'stripe-signature': signature },
      body: payload,
    });
  } catch (err) {
    fail(
      `Could not reach ${WEBHOOK_URL}\n` +
        `  Is the dev server running? Start it with "npm run dev" in another terminal.\n` +
        `  (${err.message})`,
    );
  }
  const body = await res.text();
  console.log(dim(`   attempt ${attempt}: HTTP ${res.status} ${body}`));
  return body;
}

// ── 4. Deliver it twice — the second one is the real test ──────────────────
console.log('\n3. Delivering the order to your webhook...');
const first = await deliver(1);

console.log('\n4. Delivering the SAME order again, the way Stripe would on a retry...');
const second = await deliver(2);

// ── 5. Verdict ─────────────────────────────────────────────────────────────
console.log(bold('\n─────────────────────────────────────────────'));

const guarded = second.includes('already_fulfilled');
// Only a bought label closes an order — a failed attempt is meant to stay
// retryable. Without this distinction the run cried "DUPLICATE PROTECTION DID
// NOT KICK IN" whenever the first attempt couldn't buy a label, which is the
// guard behaving exactly as designed, and sent us hunting a bug that wasn't
// there.
const labelBought = first.includes('"label":"bought"');

if (guarded) {
  console.log(green(bold('✓ DUPLICATE PROTECTION WORKS')));
  console.log('  The repeat order was ignored. You will not be charged twice');
  console.log('  for postage, and only one label should have printed.');
} else if (!labelBought) {
  console.log(yellow(bold('— INCONCLUSIVE: the first attempt never bought a label')));
  console.log('  So the retry was SUPPOSED to run again — a failed order stays');
  console.log('  retryable on purpose, or one bad run would strand a paid order');
  console.log('  forever. This is not a duplicate-protection failure.');
  console.log('');
  console.log('  Fix the label error listed above, then run this again to');
  console.log('  actually test the guard. Usually a missing SHIP_FROM_ setting.');
} else {
  console.log(red(bold('✗ DUPLICATE PROTECTION DID NOT KICK IN')));
  console.log('  A label was bought, and the retry was processed anyway —');
  console.log('  meaning a Stripe retry would buy a SECOND label.');
  console.log('  Do not deploy this — send me the output above.');
}

console.log(`\n${bold('Now check:')}`);
console.log('  • Exactly ONE label came out of your printer');
console.log('  • ONE order email arrived at support@kineticube.shop');
console.log(dim('\n  (The label is a Shippo test label — not valid postage, costs nothing.)\n'));

if (!guarded) process.exit(1);
