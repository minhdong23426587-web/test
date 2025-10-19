import { SignJWT, jwtVerify } from 'jose';

const emailTokenSecret = new TextEncoder().encode(process.env.EMAIL_TOKEN_SECRET ?? 'change-me');

interface EmailTokenClaims {
  userId: string;
  email: string;
}

export async function signEmailVerificationToken(payload: EmailTokenClaims) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS512' })
    .setExpirationTime('30m')
    .setIssuedAt()
    .setAudience('email-verification')
    .setIssuer('enterprise-next-app')
    .sign(emailTokenSecret);
  return token;
}

export async function verifyEmailVerificationToken(token: string) {
  try {
    const { payload } = await jwtVerify<EmailTokenClaims>(token, emailTokenSecret, {
      audience: 'email-verification',
      issuer: 'enterprise-next-app'
    });
    return payload;
  } catch (error) {
    console.error('Failed email token verification', error);
    return null;
  }
}
