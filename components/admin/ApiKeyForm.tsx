"use client";

import { useFormState } from "react-dom";
import type { createApiKey } from "@/app/admin/(protected)/api-keys/actions";

const initialState = { error: undefined, token: undefined } as Awaited<ReturnType<typeof createApiKey>>;

export function ApiKeyForm({ action }: { action: typeof createApiKey }) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required />
      <label htmlFor="userId">User ID (optional)</label>
      <input id="userId" name="userId" />
      <label htmlFor="scopes">Scopes (comma separated)</label>
      <input id="scopes" name="scopes" placeholder="read:data,write:data" required />
      <label htmlFor="rateLimit">Rate limit per hour</label>
      <input id="rateLimit" name="rateLimit" type="number" defaultValue={1000} min={1} />
      <button type="submit">Issue API key</button>
      {state?.error && <p className="alert">{state.error}</p>}
      {state?.token && (
        <p className="alert">
          Store this token securely: <code>{state.token}</code>
        </p>
      )}
    </form>
  );
}
