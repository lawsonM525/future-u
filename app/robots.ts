import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://future-u.app'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // App-only or gated areas
        '/dashboard',
        '/results/',
        '/login',
        '/signup',
        '/auth',
        '/auth/*',
        '/api',
        '/api/*',
        '/customize-avatar',
        '/quests',
        '/quiz-selection',
        '/account',
        '/account/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
