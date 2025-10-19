export async function fetcher(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'x-requested-with': 'enterprise-client'
    }
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  });
}

export async function initiateLogin(payload: { email: string; password: string; otp?: string }) {
  try {
    const response = await fetch('/api/internal/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-route-key': process.env.NEXT_PUBLIC_INTERNAL_HEADER ?? ''
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      return { ok: false, error: 'Failed' } as const;
    }
    return { ok: true } as const;
  } catch (error) {
    console.error(error);
    return { ok: false, error: 'Network error' } as const;
  }
}
