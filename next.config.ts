import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: "standalone"` here — @opennextjs/cloudflare manages its own
  // standalone-mode build internally, and setting it in this file conflicts
  // with its manifest loading (see opennextjs/opennextjs-cloudflare#1090).
  // The Dockerfile uses a plain `next start` image instead, for the same
  // reason.
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
