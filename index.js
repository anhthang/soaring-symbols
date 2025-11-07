import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { toSlug, getAirlineAssets } from './utils/index.js'
import airlines from './airlines.json' assert { type: 'json' }

const __dirname = fileURLToPath(new URL('.', import.meta.url))

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

/**
 * Get airline asset content (SVG strings) by key (IATA, ICAO, name, or slug).
 * Returns null if airline not found or no assets available.
 */
function getAssetContent(key) {
    const airline = getAirline(key)
    if (!airline) return null

    const paths = getAssets(key)
    if (!paths) return null

    const result = {}

    for (const [variant, data] of Object.entries(paths)) {
        const {
            color: colorPath,
            monochrome: monoPath,
            color_model,
            colors,
        } = data
        let color = null
        let monochrome = null

        try {
            if (colorPath) {
                const fullPath = join(__dirname, colorPath)
                color = readFileSync(fullPath, 'utf8')
            }
            if (monoPath) {
                const fullPath = join(__dirname, monoPath)
                monochrome = readFileSync(fullPath, 'utf8')
            }
            if (color || monochrome) {
                result[variant] = {
                    color,
                    monochrome,
                    color_model,
                    colors,
                }
            }
        } catch (err) {
            console.warn(
                `Warning: Could not read SVG file for ${airline.name} ${variant}:`,
                err.message
            )
        }
    }

    return Object.keys(result).length > 0 ? result : null
}

export { listAirlines, getAirline, getAssets, getAssetContent }

export default {
    listAirlines,
    getAirline,
    getAssets,
    getAssetContent,
}
