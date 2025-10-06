/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: './build',
  devIndicators: false,
  images: {
    remotePatterns: [new URL('https://pixabay.com/**')],
  },
};
 
export default nextConfig;
