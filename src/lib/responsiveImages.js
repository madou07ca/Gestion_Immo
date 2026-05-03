export function isUnsplashImageUrl(src) {
  return Boolean(src && String(src).includes('images.unsplash.com'))
}

function stripQuery(url) {
  return String(url).split('?')[0]
}

/** Héros plein écran : srcset largeur, LCP possible avec fetchPriority high. */
export function heroCoverImageAttrs(baseUrl, { fetchPriority } = {}) {
  const b = stripQuery(baseUrl)
  const widths = [640, 960, 1280, 1920]
  const srcSet = widths.map((w) => `${b}?w=${w}&q=80&auto=format&fit=crop ${w}w`).join(', ')
  return {
    src: `${b}?w=960&q=80&auto=format&fit=crop`,
    srcSet,
    sizes: '100vw',
    width: 1920,
    height: 1080,
    decoding: 'async',
    ...(fetchPriority === 'high' ? { fetchPriority: 'high' } : {}),
  }
}

/** Carte bien (grille ~2–3 colonnes). */
export function propertyCardImageAttrs(src) {
  const b = stripQuery(src)
  if (!isUnsplashImageUrl(src)) {
    return {
      src,
      width: 800,
      height: 600,
      decoding: 'async',
      loading: 'lazy',
    }
  }
  const widths = [400, 640, 800, 1200]
  const srcSet = widths.map((w) => `${b}?w=${w}&q=80&auto=format&fit=max ${w}w`).join(', ')
  return {
    src: `${b}?w=640&q=80&auto=format&fit=max`,
    srcSet,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, min(380px, 33vw)',
    width: 800,
    height: 600,
    decoding: 'async',
    loading: 'lazy',
  }
}

/** Image principale galerie fiche bien (≈16/10). */
export function propertyGalleryMainAttrs(src, { highPriority } = {}) {
  const out = {
    decoding: 'async',
    width: 1920,
    height: 1200,
    ...(highPriority ? { fetchPriority: 'high' } : {}),
  }
  if (!isUnsplashImageUrl(src)) {
    return { ...out, src }
  }
  const b = stripQuery(src)
  const widths = [640, 960, 1280, 1920]
  const srcSet = widths.map((w) => `${b}?w=${w}&q=80&auto=format&fit=max ${w}w`).join(', ')
  return {
    ...out,
    src: `${b}?w=960&q=80&auto=format&fit=max`,
    srcSet,
    sizes: '(max-width: 1024px) 100vw, min(1152px, 100vw)',
  }
}
