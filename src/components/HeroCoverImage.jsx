import { heroCoverImageAttrs, isUnsplashImageUrl } from '../lib/responsiveImages'

/**
 * Image de fond héros. `catalogHeroSrc` : photo du catalogue (URL complète) ;
 * sinon `baseUrl` (base Unsplash sans query) pour srcset optimisé.
 */
export default function HeroCoverImage({ baseUrl, catalogHeroSrc, alt, priority = false }) {
  const src = catalogHeroSrc || ''
  if (src && !isUnsplashImageUrl(src)) {
    return (
      <img
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }

  const unsplashBase = src && isUnsplashImageUrl(src) ? src.split('?')[0] : baseUrl
  const attrs = heroCoverImageAttrs(unsplashBase, {
    fetchPriority: priority ? 'high' : undefined,
  })
  return (
    <img
      {...attrs}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover object-center"
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}
