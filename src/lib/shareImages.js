/** Bases Unsplash (sans paramètres de requête) pour héros et partage social. */
export const HERO_UNSPLASH_HOME = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811'
export const HERO_UNSPLASH_BUILDING = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
export const HERO_UNSPLASH_SKYLINE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'

/** Image ~1200×630 recommandée pour og:image / Twitter summary_large_image. */
export function ogImageFromUnsplashBase(baseUrl) {
  const b = String(baseUrl).split('?')[0]
  return `${b}?w=1200&h=630&fit=crop&q=80&auto=format`
}

export const DEFAULT_OG_IMAGE_URL = ogImageFromUnsplashBase(HERO_UNSPLASH_HOME)
