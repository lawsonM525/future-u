/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/quests',
        destination: '/dashboard?tab=quests',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
