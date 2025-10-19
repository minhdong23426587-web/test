import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(12)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:";'<>?,./]).{12,}$/);

describe('password policy', () => {
  it('accepts a strong password', () => {
    expect(() => passwordSchema.parse('Str0ng!Passw0rd')).not.toThrow();
  });

  it('rejects short password', () => {
    expect(() => passwordSchema.parse('weak')).toThrow();
  });
});
