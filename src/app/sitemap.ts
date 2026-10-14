import { MetadataRoute } from 'next';
import { TOOLS } from '@/config/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pixelkit.dev';

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: tool.isPopular ? 0.9 : 0.8
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/image-tools',
    '/pdf-tools',
    '/ai-tools',
    '/document-tools',
    '/design-tools',
    '/file-tools',
    '/all-tools',
    '/pricing',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8
  }));

  return [...staticRoutes, ...toolRoutes];
}
