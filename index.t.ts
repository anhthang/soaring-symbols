// index.d.ts
export interface AirlineBranding {
    primary_color?: string
    tagline?: string
    guidelines?: string
}

export interface Airline {
    name: string
    iata?: string // 2-letter IATA code (e.g., "VN")
    icao?: string // 3-letter ICAO code (e.g., "HVN")
    country?: string // ISO 3166-1 alpha-2 code (e.g., "VN")
    flag_carrier?: boolean // true if national flag carrier
    website?: string // Official website URL
    alliance?: string // e.g., "oneworld" | "SkyTeam" | "Star Alliance"
}

export interface AirlineMeta extends Airline {
    branding?: AirlineBranding
    subsidiaries?: Airline[]
    slug?: string
}

export type AssetPaths = {
    color: string
    monochrome: string | null
    color_model?: 'single' | 'multi'
    colors?: string[]
}

export type ResolvedAssets = {
    icon?: AssetPaths
    logo?: AssetPaths
    tail?: AssetPaths
}

export function listAirlines(): AirlineMeta[]
export function getAirline(key: string): AirlineMeta | null
export function getAssets(key: string): ResolvedAssets | null

declare const _default: {
    listAirlines: typeof listAirlines
    getAirline: typeof getAirline
    getAssets: typeof getAssets
}

export default _default
