'use server';

import { z } from 'zod';

const payloadSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(12)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:";'<>?,./]).{12,}$/)
});

export async function registerUser(payload: unknown) {
  const parseResult = payloadSchema.safeParse(payload);
  if (!parseResult.success) {
    return { ok: false, error: 'Invalid payload' } as const;
  }
  try {
    const response = await fetch(
      `${process.env.APP_URL ?? 'http://localhost:3000'}/api/internal/${process.env.INTERNAL_ROUTE_PREFIX}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-route-key': process.env.INTERNAL_ROUTE_HEADER_SECRET ?? ''
        },
        body: JSON.stringify(parseResult.data),
        cache: 'no-store'
      }
    );
    if (!response.ok) {
      throw new Error('Registration request failed');
    }
    return { ok: true } as const;
  } catch (error) {
    console.error(error);
    return { ok: false, error: 'Registration failed' } as const;
  }
}
