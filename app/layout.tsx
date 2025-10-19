import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Enterprise Security Platform',
  description: 'Mission-critical web platform with defense-in-depth security.',
  robots: {
    follow: false,
    index: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className="antialiased">
        <Suspense fallback={<div className="p-8">Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  );
}
