import { createSecureHeaders } from "next-secure-headers";

const isProd = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'strict-dynamic' 'nonce-{{nonce}}'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self' https://ws.example.com",
  "frame-ancestors 'none'",
  "base-uri 'self'"
].join("; ");

const securityHeaders = createSecureHeaders({
  contentSecurityPolicy: {
    directives: contentSecurityPolicy
  },
  forceHTTPSRedirect: [true, { enableOnlocalhost: false, maxAge: 31536000, includeSubDomains: true, preload: true }],
  referrerPolicy: "same-origin",
  xssProtection: "block-rendering",
  frameGuard: "deny",
  noSniff: "nosniff",
  ieNoOpen: "noopen"
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  },
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: !isProd
  }
};

export default nextConfig;
