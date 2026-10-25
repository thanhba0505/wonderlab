import type { NextConfig } from 'next';
import rootPkg from '../package.json';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: rootPkg.version,
  },
};

export default nextConfig;
