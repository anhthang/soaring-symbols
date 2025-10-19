const { readFileSync, existsSync, writeFileSync } = require('fs')
const sortBy = require('lodash.sortby')
const { join } = require('path')
const { toSlug } = require('./utils.js')

const airlinesPath = join(__dirname, '../airlines.json')
const airlines = JSON.parse(readFileSync(airlinesPath, 'utf-8'))

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

const assetsDir = join(__dirname, '..', 'assets')

const sorted = sortBy(airlines, (a) => a.name.toLowerCase())

const getFlagEmoji = (isoCode) => {
    if (!isoCode) return '🏴'

    if (isoCode === 'GB-ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    if (isoCode === 'GB-WLS') return '🏴󠁧󠁢󠁷󠁬󠁳󠁿'
    if (isoCode === 'GB-SCT') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
    if (isoCode === 'GB-NIR') return '🇬🇧'

    return isoCode
        .toUpperCase()
        .replace(/./g, (char) =>
            String.fromCodePoint(127397 + char.charCodeAt(0))
        )
}

let md = `# Soaring Symbols: Airlines

This file provides an overview of the airlines included in the Soaring Symbols project.

| Airline | Country | IATA | ICAO | Alliance | Primary Color | Icon | Logo | Tail |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
`

const assetTypes = ['icon', 'logo', 'tail']

sorted.forEach((airline) => {
    const slug = toSlug(airline.name)

    const airlineDir = join(assetsDir, slug)
    const assets = {}
    const includedStates = []

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

    Object.assign(airline.branding, {
        primary_color: airline.branding.primary_color.toLowerCase(),
        assets,
    })

    const {
        name,
        iata,
        website,
        icao,
        country,
        alliance,
        flag_carrier,
        branding: { primary_color },
        subsidiaries,
    } = airline

    let airlineName = website ? `[${name}](${website})` : name

    if (flag_carrier) {
        const countries = country.split(',')
        countries.forEach((code) => {
            airlineName += ` ${getFlagEmoji(code)}`
        })
    }

    assetTypes.forEach((type) => {
        const assetInfo = assets[type]

        if (!assetInfo) {
            includedStates.push('')
            return
        }

        const isComplete =
            (assetInfo.has_mono_file &&
                Array.isArray(assetInfo.colors) &&
                assetInfo.colors.length) ||
            assetInfo.color_model === 'single'

        if (isComplete) {
            includedStates.push('✅')
        } else {
            includedStates.push('☑️')
        }
    })

    const colorSquare = primary_color
        ? `![${primary_color}](https://place-hold.it/10x10/${primary_color.replace(
              '#',
              ''
          )}/${primary_color.replace('#', '')}.png)`
        : ''

    md += `| ${airlineName} | ${country || ''} | ${iata || ''} | ${
        icao || ''
    } | ${alliance || ''} | ${colorSquare} | ${includedStates.join(' | ')} |\n`

    if (Array.isArray(subsidiaries)) {
        subsidiaries.forEach((sub) => {
            let subsidiaryAirlineName = sub.name
            if (sub.flag_carrier) {
                subsidiaryAirlineName += ` ${getFlagEmoji(sub.country)}`
            }

            md += `| ${subsidiaryAirlineName} | ${sub.country || ''} | ${
                sub.iata || ''
            } | ${sub.icao || ''} | ${
                sub.alliance || ''
            } | ${colorSquare} | ${includedStates.join(' | ')} |\n`
        })
    }
})

writeFileSync('airlines.json', JSON.stringify(sorted, null, 4))
writeFileSync('OVERVIEW.md', md)

console.log('✅ Successfully generated airlines.json and OVERVIEW.md')
