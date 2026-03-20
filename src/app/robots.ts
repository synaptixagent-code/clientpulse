import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/upgrade'] },
    ],
    sitemap: 'https://clientpulse.dev/sitemap.xml',
  };
}
