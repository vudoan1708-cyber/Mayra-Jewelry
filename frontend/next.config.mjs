import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const publicBucketUrl = process.env.CLOUDFLARE_PUBLIC_BUCKET_URL;
const publicBucketHostname = publicBucketUrl ? new URL(publicBucketUrl).hostname : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: './build',
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        port: '',
        pathname: '/platform/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      ...(publicBucketHostname
        ? [{ protocol: 'https', hostname: publicBucketHostname }]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
