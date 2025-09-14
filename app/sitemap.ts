import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://future-u.app'

  const routes: string[] = [
    '',
    'why-future-u',
    'team',
    'cookie-policy',
    'careers',
    'careers/animator',
    'careers/illustrator',
    'contact',
    'feature-request',
    'roadmap',
  ]

  const now = new Date()

  return routes.map((route) => ({
    url: route ? `${baseUrl}/${route}` : baseUrl,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.6,
  }))
}
