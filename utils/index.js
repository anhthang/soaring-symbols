import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import slugify from 'slugify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function toSlug(name) {
    return slugify(name, {
        lower: true,
        strict: true,
    })
}

const extractColorsFromSvg = (filePath) => {
    const content = readFileSync(filePath, 'utf8')
    const colorRegex = /fill="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})"/gi
    const matches = [...content.matchAll(colorRegex)]
    const colors = [...new Set(matches.map((match) => match[1]))]
    return colors.length > 0 ? colors : null
}

const determineColorModel = (colors) => {
    if (!colors) return null
    return colors.length > 1 ? 'multi' : 'single'
}

const assetTypes = ['icon', 'logo', 'tail']
const assetsDir = join(__dirname, '..', 'assets')

const getAirlineAssets = (slug) => {
    const airlineDir = join(assetsDir, slug)

    const assets = {}
    assetTypes.forEach((assetType) => {
        const colorAssetPath = join(airlineDir, `${assetType}.svg`)
        const monoAssetPath = join(airlineDir, `${assetType}-mono.svg`)
        const colorAssetExists = existsSync(colorAssetPath)
        const monoAssetExists = existsSync(monoAssetPath)

        if (colorAssetExists) {
            const colors = extractColorsFromSvg(colorAssetPath)
            const color_model = determineColorModel(colors)
            assets[assetType] = {
                has_mono_file: monoAssetExists,
            }
            if (color_model) {
                assets[assetType].color_model = color_model
                assets[assetType].colors = colors
            }
        } else if (monoAssetExists) {
            assets[assetType] = {
                has_mono_file: true,
            }
        }
    })

    return assets
}

export { toSlug, getAirlineAssets }

export default {
    toSlug,
    getAirlineAssets,
}
