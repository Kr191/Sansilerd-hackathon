export interface Property {
  id: string
  name: string
  price: number
  pricePerSqm: number
  location: string
  district: string
  province: string
  image: string
  type: 'condo' | 'house' | 'townhouse'
  size: number
  bedrooms: number
  bathrooms: number
  nearBTS?: string
  nearMRT?: string
  amenities: string[]
  developer: string
  completionYear: number
  rentalYield: number
  capitalGainProjection: {
    year3: number
    year5: number
    year10: number
  }
  occupancyRate: number
  averageRent: number
  locationScore: number
  liquidityScore: number
  coordinates?: {
    lat: number
    lng: number
  }
}


export function searchProperties(criteria: {
  budget_min: number
  budget_max: number
  goal: 'rent' | 'flip'
  location?: string
  type?: string
}, properties: Property[] = []): Property[] {
  return properties.filter(property => {
    // Budget filter
    if (property.price < criteria.budget_min || property.price > criteria.budget_max) {
      return false
    }

    // Location filter (optional)
    if (criteria.location) {
      const locationLower = criteria.location.toLowerCase()
      const matchLocation =
        property.location.toLowerCase().includes(locationLower) ||
        property.district.toLowerCase().includes(locationLower) ||
        property.province.toLowerCase().includes(locationLower)

      if (!matchLocation) return false
    }

    return true
  })
}

//Real Sansiri API Integration
const SANSIRI_API_URL = 'https://prd-apigateway.sansiri.com/api/projectList'
const SANSIRI_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5MzEwODZjLWY0NjMtNGQ4Ni04ZTVjLTU2NmVmODhlMjVkZiIsImlhdCI6MTU0OTk1MTA4N30.ypF3f7RwVbTJ1_0UWCDszf0DJd1upvssZ5ecXgjzqPU'
const SANSIRI_CDN = 'https://assets.sansiri.com'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

let _cachedProperties: Property[] | null = null
let _cacheTimestamp = 0

// Map Sansiri API propertyCategory our type
function mapCategory(cat: string): 'condo' | 'house' | 'townhouse' {
  const c = (cat || '').toLowerCase()
  if (c.includes('condo') || c.includes('condominium')) return 'condo'
  if (c.includes('townhome') || c.includes('townhouse') || c.includes('town')) return 'townhouse'
  return 'house'
}

// Estimate financial metrics from price when not available from API
function estimateFinancials(price: number, type: 'condo' | 'house' | 'townhouse', locationScore: number) {
  // rental yield improves for lower-priced properties and better locations
  const baseYield = type === 'condo' ? 5.5 : type === 'house' ? 4.5 : 5.0
  const priceAdjust = price > 10_000_000 ? -1.0 : price > 5_000_000 ? -0.3 : price < 2_000_000 ? 0.8 : 0
  const locAdjust = locationScore > 90 ? -0.2 : locationScore < 75 ? 0.4 : 0
  const rentalYield = Math.max(3.5, Math.min(9.0, baseYield + priceAdjust + locAdjust))

  const averageRent = Math.round((price * rentalYield) / 100 / 12)

  const capitalGain = {
    year3: Math.round(locationScore * 0.15),
    year5: Math.round(locationScore * 0.27),
    year10: Math.round(locationScore * 0.55),
  }

  const occupancyRate = Math.min(97, Math.round(75 + locationScore * 0.22))
  return { rentalYield, averageRent, capitalGainProjection: capitalGain, occupancyRate }
}

// Compute locationScore and liquidityScore from POI data
function scoreFromPoi(poi: any[]): { locationScore: number; liquidityScore: number; nearBTS?: string; nearMRT?: string } {
  let locationScore = 72
  let liquidityScore = 72
  let nearBTS: string | undefined
  let nearMRT: string | undefined

  if (!Array.isArray(poi)) return { locationScore, liquidityScore }

  for (const p of poi) {
    const name: string = (p.poiNameEN || p.poiName || '').toUpperCase()
    const dist: number = p.distance ?? 9999

    if ((name.includes('BTS') || name.includes('SKYTRAIN')) && dist < 1500) {
      locationScore = Math.min(99, locationScore + (dist < 500 ? 18 : dist < 1000 ? 10 : 5))
      liquidityScore = Math.min(99, liquidityScore + 8)
      if (!nearBTS) nearBTS = p.poiNameEN || p.poiName
    }
    if ((name.includes('MRT') || name.includes('SUBWAY') || name.includes('METRO')) && dist < 1500) {
      locationScore = Math.min(99, locationScore + (dist < 500 ? 15 : dist < 1000 ? 8 : 4))
      liquidityScore = Math.min(99, liquidityScore + 6)
      if (!nearMRT) nearMRT = p.poiNameEN || p.poiName
    }
    if (name.includes('MALL') || name.includes('CENTRAL') || name.includes('TERMINAL')) {
      locationScore = Math.min(99, locationScore + 4)
    }
    if (name.includes('HOSPITAL') || name.includes('SCHOOL') || name.includes('UNIVERSITY')) {
      locationScore = Math.min(99, locationScore + 2)
    }
  }

  return { locationScore, liquidityScore, nearBTS, nearMRT }
}

// Map a raw Sansiri API result item at our Property interface
function mapApiProperty(raw: any): Property | null {
  try {
    // startingPrice from API is in THB (e.g. 1850000), specialPrice is in million THB (e.g. 1.85)
    const price = raw.startingPrice > 0
      ? raw.startingPrice
      : raw.minPrice > 0
        ? raw.minPrice
        : raw.specialPrice > 0
          ? Math.round(raw.specialPrice * 1_000_000)
          : 0
    if (price <= 0) return null // skip projects with no price info

    const type = mapCategory(raw.propertyCategoryEN || raw.propertyCategory || '')

    const poi: any[] = Array.isArray(raw.projectPoi) ? raw.projectPoi : []
    const { locationScore, liquidityScore, nearBTS, nearMRT } = scoreFromPoi(poi)

    const financials = estimateFinancials(price, type, locationScore)

    const amenities: string[] = poi
      .filter((p: any) => !((p.poiNameEN || '').toUpperCase().includes('BTS') || (p.poiNameEN || '').toUpperCase().includes('MRT')))
      .slice(0, 6)
      .map((p: any) => p.poiNameEN || p.poiName || '')
      .filter(Boolean)

    // Build image URL â€” ensure a slash separator between CDN base and path
    function buildCdnUrl(path: string): string {
      if (!path) return ''
      if (path.startsWith('http')) return path
      const sep = path.startsWith('/') ? '' : '/'
      return `${SANSIRI_CDN}${sep}${path}`
    }
    const image = buildCdnUrl(raw.homeLandscapeL || raw.projectLandscapeL || '')
      || (type === 'condo'
        ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
        : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800')

    const province = raw.zoneEN || raw.regionEN || raw.locationGroupEN || raw.locationEN || 'Thailand'
    const district = raw.locationEN || raw.location || ''
    const location = raw.locationEN || district

    const size = raw.startUsageArea || raw.maxUsageArea || (type === 'condo' ? 28 : 100)
    const bedrooms = raw.startBedroomNumber || raw.minBedroomID || (type === 'condo' ? 1 : 3)
    const bathrooms = raw.startToiletNumber || bedrooms
    const completionYear = raw.readyYear ? parseInt(raw.readyYear) : new Date().getFullYear()

    return {
      id: `sansiri-${raw.projectId || raw.UnprojectId}`,
      name: raw.projectNameEN || raw.projectFullName || raw.projectName || 'Sansiri Project',
      price,
      pricePerSqm: size > 0 ? Math.round(price / size) : 0,
      location,
      district,
      province,
      image,
      type,
      size,
      bedrooms,
      bathrooms,
      nearBTS,
      nearMRT,
      amenities,
      developer: raw.brandTitleEN || raw.brandTitle || 'Sansiri',
      completionYear,
      ...financials,
      locationScore,
      liquidityScore,
      coordinates: raw.latitude && raw.longitude
        ? { lat: parseFloat(raw.latitude), lng: parseFloat(raw.longitude) }
        : undefined,
    }
  } catch {
    return null
  }
}

/**
 * Fetches live property listings from the Sansiri internal API.
 * - Returns cached data immediately if fresh (< 1 hour old)
 * - Returns fallback local data instantly if cache is empty
 * - Fetches live data in background with 4s timeout; updates cache when done
 */
export async function fetchSansiriProperties(): Promise<Property[]> {
  const { FALLBACK_PROPERTIES } = await import('./fallbackData')

  // Return from cache if still fresh
  if (_cachedProperties && Date.now() - _cacheTimestamp < CACHE_TTL_MS) {
    return _cachedProperties
  }

  // Kick off live fetch in background (don't await — fire and forget to update cache)
  fetchLiveInBackground()

  // Return fallback immediately so UI renders without waiting
  return FALLBACK_PROPERTIES
}

/** Fetches from Sansiri API with a 4s timeout and updates the in-memory cache */
async function fetchLiveInBackground(): Promise<void> {
  try {
    const url = `${SANSIRI_API_URL}?api_type=filter&lang=en&size=500&sortBy=projectFullName|asc`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        token: SANSIRI_API_TOKEN,
        origin: 'https://www.sansiri.com',
        referer: 'https://www.sansiri.com/',
      },
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      console.warn(`[sansiriData] Live API returned ${res.status}, keeping fallback`)
      return
    }

    const json = await res.json()
    if (json.status !== 'success' || !Array.isArray(json.result)) {
      console.warn('[sansiriData] Unexpected API response shape, keeping fallback')
      return
    }

    const mapped = json.result
      .map(mapApiProperty)
      .filter((p: Property | null): p is Property => p !== null)

    if (mapped.length === 0) {
      console.warn('[sansiriData] API returned 0 mappable properties, keeping fallback')
      return
    }

    console.log(`[sansiriData] Live cache updated: ${mapped.length} properties`)
    _cachedProperties = mapped
    _cacheTimestamp = Date.now()
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('[sansiriData] Live API timed out after 4s, using fallback')
    } else {
      console.error('[sansiriData] Live fetch failed, using fallback:', err)
    }
  }
}

