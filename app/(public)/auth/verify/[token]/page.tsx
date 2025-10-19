import { verifyEmailToken } from '@/lib/security/user-service';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

interface Props {
  params: { token: string };
  searchParams: { r?: string };
}

export default async function VerifyEmailPage({ params, searchParams }: Props) {
  const redirectUri = searchParams?.r ?? '/auth/login';
  const result = await verifyEmailToken(params.token);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 p-10 text-center">
      {result.ok ? (
        <>
          <h1 className="text-3xl font-semibold text-brand-accent">Email verified</h1>
          <p className="text-sm text-slate-300">
            You may now <a href={redirectUri}>sign in</a> with your credentials. For your safety, this link
            expires shortly.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold text-red-400">Verification failed</h1>
          <p className="text-sm text-slate-300">{result.error ?? 'Token invalid or expired.'}</p>
        </>
      )}
    </div>
  );
}
