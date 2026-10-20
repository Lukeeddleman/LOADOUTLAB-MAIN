import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const submission = {
  name: 'Contact test', email: 'visitor@example.com', subject: 'General Question',
  message: 'A legitimate question.', website: '', turnstileToken: 'test-token',
};

// Run the real TypeScript route + helpers; replace only external services and env.
function fixture({ env = {}, verification = {}, serviceDown = false, mailError = false } = {}) {
  const calls = { verification: 0, emails: [] };
  const environment = {
    NODE_ENV: 'test', RESEND_API_KEY: 'test-only', TURNSTILE_SECRET_KEY: 'test-real-key',
    TURNSTILE_ALLOWED_HOSTNAMES: 'www.loadoutlab.com,loadoutlab.com', ...env,
  };
  const modules = new Map();
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const loadedModule = { exports: {} };
    modules.set(filename, loadedModule);
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const context = {
      module: loadedModule, exports: loadedModule.exports, process: { env: environment },
      URL, URLSearchParams, AbortSignal,
      console: { error() {} },
      fetch: async (url, options) => {
        calls.verification++;
        assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
        assert.equal(options.body.get('secret'), environment.TURNSTILE_SECRET_KEY);
        assert.equal(options.body.get('response'), 'test-token');
        if (serviceDown) throw new Error('Service unavailable');
        return Response.json({ success: true, hostname: 'www.loadoutlab.com', action: 'contact', ...verification });
      },
      require: name => {
        if (name === 'resend') return { Resend: class {
          emails = { send: async mail => {
            calls.emails.push(mail);
            return mailError ? { error: { message: 'Rejected' } } : { data: { id: 'test-mail' }, error: null };
          } };
        } };
        if (name.startsWith('@/')) return load(path.join(root, `${name.slice(2)}.ts`));
        if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`));
        return require(name);
      },
    };
    vm.runInNewContext(source, context, { filename });
    return loadedModule.exports;
  }
  const { POST } = load(path.join(root, 'app/api/contact/route.ts'));
  return { calls, post: body => POST(new Request('http://localhost/api/contact', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })), raw: body => POST(new Request('http://localhost/api/contact', { method: 'POST', body })) };
}

test('verified submission sends exactly one escaped email with visitor reply address', async () => {
  const f = fixture();
  const response = await f.post({ ...submission, message: '<script>alert(1)</script>' });
  assert.equal(response.status, 200);
  assert.equal(f.calls.verification, 1);
  assert.equal(f.calls.emails.length, 1);
  assert.equal(f.calls.emails[0].replyTo, submission.email);
  assert.ok(f.calls.emails[0].html.includes('&lt;script&gt;'));
});

for (const [description, token] of [['missing', undefined], ['empty', ''], ['non-string', {}], ['oversize', 'x'.repeat(2049)]]) {
  test(`${description} token cannot send mail or call verification`, async () => {
    const f = fixture();
    assert.equal((await f.post({ ...submission, turnstileToken: token })).status, 403);
    assert.equal(f.calls.verification, 0);
    assert.equal(f.calls.emails.length, 0);
  });
}

for (const verification of [
  { success: false, 'error-codes': ['invalid-input-response'] },
  { success: false, 'error-codes': ['timeout-or-duplicate'] },
  { hostname: 'attacker.example' }, { action: 'login' }, { action: undefined },
]) {
  test(`rejected verification cannot send mail: ${JSON.stringify(verification)}`, async () => {
    const f = fixture({ verification });
    assert.equal((await f.post(submission)).status, 403);
    assert.equal(f.calls.emails.length, 0);
  });
}

for (const options of [
  { serviceDown: true }, { env: { TURNSTILE_SECRET_KEY: '' } },
  { verification: { success: false, 'error-codes': ['invalid-input-secret'] } },
  { verification: { success: false, 'error-codes': ['internal-error'] } },
  { env: { NODE_ENV: 'production', TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' } },
]) {
  test(`unavailable/misconfigured verification fails closed: ${JSON.stringify(options)}`, async () => {
    const f = fixture(options);
    assert.equal((await f.post(submission)).status, 503);
    assert.equal(f.calls.emails.length, 0);
  });
}

test('honeypot is silently discarded without external calls', async () => {
  const f = fixture();
  assert.equal((await f.post({ ...submission, website: 'bot.example' })).status, 200);
  assert.equal(f.calls.verification, 0);
  assert.equal(f.calls.emails.length, 0);
});

for (const body of [null, [], { ...submission, name: {} }, { ...submission, message: ' ' },
  { ...submission, email: 'invalid' }, { ...submission, subject: 'a\nb' },
  { ...submission, message: 'x'.repeat(10001) }]) {
  test(`invalid payload is rejected: ${JSON.stringify(body)?.slice(0, 100)}`, async () => {
    const f = fixture();
    assert.equal((await f.post(body)).status, 400);
    assert.equal(f.calls.verification, 0);
    assert.equal(f.calls.emails.length, 0);
  });
}

test('malformed JSON returns 400', async () => {
  const f = fixture();
  assert.equal((await f.raw('{')).status, 400);
  assert.equal(f.calls.emails.length, 0);
});

test('email provider rejection does not report success', async () => {
  const f = fixture({ mailError: true });
  assert.equal((await f.post(submission)).status, 502);
  assert.equal(f.calls.emails.length, 1);
});

test('canonical host fallback works without explicit allowlist', async () => {
  const f = fixture({ env: { TURNSTILE_ALLOWED_HOSTNAMES: '' } });
  assert.equal((await f.post(submission)).status, 200);
});

test('Cloudflare dummy action works only with explicit non-production test secret', async () => {
  const f = fixture({
    env: { TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA', TURNSTILE_ALLOWED_HOSTNAMES: 'localhost' },
    verification: { hostname: 'localhost', action: 'test' },
  });
  assert.equal((await f.post(submission)).status, 200);
});
