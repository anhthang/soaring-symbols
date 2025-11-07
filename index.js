import airlines from './airlines.json' assert { type: 'json' }
import { toSlug, getAirlineAssets } from './utils/index.js'

// assets/<slug>/<variant>.svg or <variant>-mono.svg
const ASSETS_BASE = 'assets'

const byIata = new Map()
const byIcao = new Map()
const byName = new Map()
const bySlug = new Map()

for (const a of airlines) {
    // If airlines.json doesn’t have slug, compute it now
    const slug = a.slug ? a.slug : toSlug(a.name)
    a.slug = slug

    if (a.iata) byIata.set(String(a.iata).toUpperCase(), a)
    if (a.icao) byIcao.set(String(a.icao).toUpperCase(), a)
    if (a.name) byName.set(String(a.name).toLowerCase(), a)
    bySlug.set(slug, a)
}

// Build path for a variant, respecting has_mono_file
function buildVariantPaths(slug, variant, assetsMeta) {
    const { color_model, colors, has_mono_file } = assetsMeta || {}

    const baseDir = `${ASSETS_BASE}/${slug}`
    const color = `${baseDir}/${variant}.svg`
    const monochrome = has_mono_file ? `${baseDir}/${variant}-mono.svg` : null

    return { color, monochrome, color_model, colors }
}

function resolveAssets(a) {
    const assetsMeta = getAirlineAssets(a.slug)
    const out = {}

    for (const variant of ['icon', 'logo', 'tail']) {
        const vm = assetsMeta[variant]
        if (!vm) continue
        out[variant] = buildVariantPaths(a.slug, variant, vm)
    }

    return out
}

/**
 * List all airlines (with computed slug).
 */
function listAirlines() {
    return airlines
}

/**
 * Get airline by IATA, ICAO, slug, or name.
 */
function getAirline(key) {
    if (!key) return null
    const s = String(key)
    const iata = s.toUpperCase()
    const icao = s.toUpperCase()
    const name = s.toLowerCase()
    const slug = toSlug(s)

    return (
        byIata.get(iata) ||
        byIcao.get(icao) ||
        bySlug.get(slug) ||
        byName.get(name) ||
        null
    )
}

/**
 * Get resolved asset paths for an airline key.
 * {
 *   icon?: { color: 'assets/<slug>/icon.svg', monochrome: 'assets/<slug>/icon-mono.svg' | null },
 *   logo?: { ... },
 *   tail?: { ... }
 * }
 */
function getAssets(key) {
    const airline = getAirline(key)
    if (!airline) return null
    return resolveAssets(airline)
}

export { listAirlines, getAirline, getAssets }

export default {
    listAirlines,
    getAirline,
    getAssets,
}
