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
    ],
  },
};
 
export default nextConfig;
