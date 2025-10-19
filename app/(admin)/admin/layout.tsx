import type { Metadata } from 'next';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'Admin Console — Enterprise Security Platform',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-domain="admin">
      <body className="bg-slate-950 text-slate-100">
        <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-10">
          {children}
        </main>
      </body>
    </html>
  );
}
