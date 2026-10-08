import { absoluteUrl } from '../lib/site'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/cart/checkout',
        '/checkout',
        '/orders',
        '/order-confirmation',
        '/kitchen',
        '/signin',
        '/favorites',
        '/api/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
