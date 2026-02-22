// Données des biens (sera remplacé par l'API / back-office)
export const propertyTypes = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'magasin', label: 'Magasin' },
  { value: 'immeuble', label: 'Immeuble' },
  { value: 'terrain', label: 'Terrain' },
]

export const districts = [
  'Kaloum', 'Ratoma', 'Matam', 'Matoto', 'Dixinn', 'Kagbelen', 'Lambandji', 'Taouyah', 'Kipé',
]

export const properties = [
  {
    id: '1',
    slug: 'villa-prestige-kaloum-conakry',
    title: 'Villa prestige vue lagune',
    type: 'maison',
    operation: 'location',
    district: 'Kaloum',
    city: 'Conakry',
    price: 2500000,
    priceLabel: '2 500 000 GNF / mois',
    surface: 280,
    surfaceLand: 450,
    rooms: 6,
    bedrooms: 4,
    floor: 0,
    description: 'Magnifique villa d\'exception avec vue directe sur la lagune. Prestations haut de gamme : grande piscine, jardin paysager, garage double. Idéale pour expatriés ou familles exigeantes.',
    features: ['Piscine', 'Parking', 'Vue lagune', 'Jardin', 'Climatisation', 'Sécurité 24h'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    ],
    featured: true,
    available: true,
    reference: 'REF-2024-001',
    lat: 9.5092,
    lng: -13.7122,
  },
  {
    id: '2',
    slug: 'appartement-3-pieces-ratoma',
    title: 'Appartement 3 pièces standing',
    type: 'appartement',
    operation: 'location',
    district: 'Ratoma',
    city: 'Conakry',
    price: 850000,
    priceLabel: '850 000 GNF / mois',
    surface: 95,
    surfaceLand: null,
    rooms: 3,
    bedrooms: 2,
    floor: 3,
    description: 'Bel appartement lumineux dans résidence sécurisée. Cuisine équipée, salon spacieux, deux chambres avec dressing. Proche commodités.',
    features: ['Parking', 'Ascenseur', 'Gardien', 'Climatisation'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    ],
    featured: true,
    available: true,
    reference: 'REF-2024-002',
    lat: 9.55,
    lng: -13.68,
  },
  {
    id: '3',
    slug: 'local-commercial-dixinn',
    title: 'Local commercial avenue principale',
    type: 'magasin',
    operation: 'location',
    district: 'Dixinn',
    city: 'Conakry',
    price: 1200000,
    priceLabel: '1 200 000 GNF / mois',
    surface: 180,
    surfaceLand: null,
    rooms: 2,
    bedrooms: 0,
    floor: 0,
    description: 'Local commercial en pied d\'immeuble, grande vitrine, emplacement stratégique. Idéal boutique, agence ou restaurant.',
    features: ['Vitrine', 'Parking clients', 'Climatisation'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    ],
    featured: false,
    available: true,
    reference: 'REF-2024-003',
    lat: 9.52,
    lng: -13.70,
  },
  {
    id: '4',
    slug: 'terrain-constructible-matam',
    title: 'Terrain constructible 500 m²',
    type: 'terrain',
    operation: 'location',
    district: 'Matam',
    city: 'Conakry',
    price: 450000,
    priceLabel: '450 000 GNF / mois',
    surface: 0,
    surfaceLand: 500,
    rooms: 0,
    bedrooms: 0,
    floor: null,
    description: 'Terrain viabilisé, titre foncier en règle. Quartier en développement, proche axes principaux.',
    features: ['Viabilisé', 'Titre foncier'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
    ],
    featured: true,
    available: true,
    reference: 'REF-2024-004',
    lat: 9.54,
    lng: -13.69,
  },
  {
    id: '5',
    slug: 'duplex-penthouse-kaloum',
    title: 'Duplex penthouse avec terrasse',
    type: 'appartement',
    operation: 'location',
    district: 'Kaloum',
    city: 'Conakry',
    price: 3200000,
    priceLabel: '3 200 000 GNF / mois',
    surface: 220,
    surfaceLand: null,
    rooms: 5,
    bedrooms: 3,
    floor: 8,
    description: 'Exceptionnel duplex en dernier étage avec terrasse panoramique. Finitions luxe, domotique. Vue mer et ville.',
    features: ['Terrasse', 'Vue mer', 'Parking', 'Ascenseur', 'Climatisation', 'Domotique'],
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200',
    ],
    featured: true,
    available: true,
    reference: 'REF-2024-005',
    lat: 9.51,
    lng: -13.71,
  },
  {
    id: '6',
    slug: 'maison-familiale-matoto',
    title: 'Maison familiale 4 chambres',
    type: 'maison',
    operation: 'location',
    district: 'Matoto',
    city: 'Conakry',
    price: 1100000,
    priceLabel: '1 100 000 GNF / mois',
    surface: 160,
    surfaceLand: 300,
    rooms: 5,
    bedrooms: 4,
    floor: 0,
    description: 'Maison spacieuse avec jardin clôturé. Idéale pour famille. Quartier calme, école à proximité.',
    features: ['Jardin', 'Parking', 'Climatisation', 'Gardien'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
    ],
    featured: false,
    available: true,
    reference: 'REF-2024-006',
    lat: 9.56,
    lng: -13.65,
  },
]

export function getPropertyBySlug(slug) {
  return properties.find((p) => p.slug === slug)
}

export function getFeaturedProperties() {
  return properties.filter((p) => p.featured)
}

export function filterProperties(filters = {}) {
  let result = [...properties]
  if (filters.type) result = result.filter((p) => p.type === filters.type)
  if (filters.district) result = result.filter((p) => p.district === filters.district)
  if (filters.city) result = result.filter((p) => p.city === filters.city)
  if (filters.minPrice != null) result = result.filter((p) => p.price >= filters.minPrice)
  if (filters.maxPrice != null) result = result.filter((p) => p.price <= filters.maxPrice)
  if (filters.minSurface != null) result = result.filter((p) => (p.surface || p.surfaceLand || 0) >= filters.minSurface)
  if (filters.rooms != null) result = result.filter((p) => p.rooms >= filters.rooms)
  if (filters.featured) result = result.filter((p) => p.featured)
  return result
}
