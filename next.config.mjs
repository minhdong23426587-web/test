import { createSecureHeaders } from 'next-safe';

const securityHeaders = createSecureHeaders({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.NEXT_PUBLIC_WS_BASE ?? ''],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  permissionsPolicy: {
    camera: [],
    geolocation: [],
    microphone: [],
    fullscreen: ['self']
  },
  referrerPolicy: 'same-origin'
});

const nextConfig = {
  experimental: {
    serverActions: true,
    typedRoutes: true
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'same-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'off' },
        { key: 'Permissions-Policy', value: securityHeaders['Permissions-Policy'] ?? '' },
        { key: 'Content-Security-Policy', value: securityHeaders['Content-Security-Policy'] ?? '' }
      ]
    }
  ]
};

export default nextConfig;
