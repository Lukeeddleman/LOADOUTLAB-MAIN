'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type Turnstile = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    action: string;
    theme: 'dark';
    size: 'flexible';
    appearance: 'interaction-only';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
    'timeout-callback': () => void;
    'unsupported-callback': () => void;
  }) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};

declare global {
  interface Window { turnstile?: Turnstile }
}

export default function ContactVerification({ siteKey, onToken }: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!ready) {
      const timer = window.setTimeout(() => {
        setError('Verification could not load. Please reload this page or use the email address on this page.');
      }, 15000);
      return () => window.clearTimeout(timer);
    }
    const api = window.turnstile;
    if (!api || !container.current) return;

    function clearToken() {
      onToken('');
      setVerified(false);
    }

    widget.current = api.render(container.current, {
      sitekey: siteKey,
      action: 'contact',
      theme: 'dark',
      size: 'flexible',
      appearance: 'interaction-only',
      callback: token => {
        onToken(token);
        setVerified(true);
        setError('');
      },
      'expired-callback': clearToken,
      'timeout-callback': clearToken,
      'error-callback': () => {
        clearToken();
        setError('Verification failed. Please retry, or use the email address on this page.');
      },
      'unsupported-callback': () => {
        clearToken();
        setError('Verification is not supported by this browser. Please use another browser or email us directly.');
      },
    });

    return () => {
      if (widget.current !== null) api.remove(widget.current);
      widget.current = null;
      onToken('');
    };
  }, [ready, siteKey, onToken]);

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
        onError={() => setError('Verification could not load. Please reload this page or use the email address on this page.')}
      />
      <div ref={container} />
      {error ? (
        <div role="alert" className="text-red-400 text-sm">
          <p>{error}</p>
          {ready && (
            <button type="button" className="mt-1 underline" onClick={() => {
              onToken('');
              setVerified(false);
              setError('');
              if (widget.current !== null) window.turnstile?.reset(widget.current);
            }}>Retry verification</button>
          )}
        </div>
      ) : (
        <p role="status" className="text-gray-500 text-xs">
          {verified ? 'Spam protection ready.' : 'Checking your browser for spam protection…'}
        </p>
      )}
    </div>
  );
}
