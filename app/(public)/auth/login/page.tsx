'use client';

import { useState } from 'react';
import { initiateLogin } from '@/lib/security/public-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const response = await initiateLogin({ email, password, otp });
    if (response.ok) {
      setMessage('Authenticated successfully');
    } else {
      setMessage(response.error ?? 'Authentication failed');
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 p-10">
      <h1 className="text-3xl font-semibold">Secure sign-in</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900/60 p-2 text-slate-100"
            type="email"
            required
            autoComplete="username"
          />
        </label>
        <label className="text-sm font-medium">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900/60 p-2 text-slate-100"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <label className="text-sm font-medium">
          2FA Code
          <input
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900/60 p-2 text-slate-100"
            type="text"
            inputMode="numeric"
            pattern="\\d{6}"
            placeholder="000000"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Sign in
        </button>
      </form>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}
