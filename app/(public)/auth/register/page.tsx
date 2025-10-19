'use client';

import { useState } from 'react';
import { registerUser } from '@/app/(public)/actions/register-user';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const result = await registerUser({ email, password });
    if (result.ok) {
      setMessage('Check your inbox for a verification link.');
    } else {
      setMessage(result.error ?? 'Registration failed');
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 p-10">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900/60 p-2 text-slate-100"
            type="email"
            required
            autoComplete="off"
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
            autoComplete="new-password"
            minLength={12}
          />
        </label>
        <button
          type="submit"
          className="rounded bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Register
        </button>
      </form>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}
