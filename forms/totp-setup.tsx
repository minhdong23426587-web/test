'use client';

import { useState } from 'react';

export function TotpSetupForm() {
  const [secret, setSecret] = useState<string | null>(null);

  async function handleGenerate() {
    const response = await fetch('/api/internal/totp', {
      method: 'POST',
      headers: {
        'x-internal-route-key': process.env.NEXT_PUBLIC_INTERNAL_HEADER ?? ''
      }
    });
    if (response.ok) {
      const data = await response.json();
      setSecret(data.secret);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGenerate}
        className="rounded border border-slate-700 px-3 py-2 text-sm"
      >
        Generate TOTP Secret
      </button>
      {secret && <code className="block rounded bg-slate-900 p-3 text-xs">{secret}</code>}
    </div>
  );
}
