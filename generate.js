const fs = require('fs')
const sortBy = require('lodash.sortby')
const { default: slugify } = require('slugify')
const path = require('path')

const airlines = require('./airlines.json')

const extractColorsFromSvg = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    const colorRegex = /fill="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})"/gi
    const matches = [...content.matchAll(colorRegex)]
    const colors = [...new Set(matches.map((match) => match[1].toUpperCase()))]
    return colors.length > 0 ? colors : null
}

const determineColorModel = (colors) => {
    if (!colors) return null
    return colors.length > 1 ? 'multi' : 'single'
}

const assetsDir = path.join(__dirname, 'assets')

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

This file provides an overview of the airlines included in the Soaring Symbols project and the types of logos available for each one.

> [!NOTE]
>
> * This list is not exhaustive and will be updated as new airlines are added to the project.
> * Flag next to airline name often means it's the national carrier.

| Airline | IATA | ICAO | Country | Alliance | Primary Color | Icon | Mono Icon | Logo | Mono Logo |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
`

const assetTypes = ['icon', 'logo']

sorted.forEach((airline) => {
    const slug = slugify(airline.name, {
        lower: true,
        strict: true,
    })

    const airlineDir = path.join(assetsDir, slug)
    const assets = {}
    const includedStates = []

    if (!fs.existsSync(airlineDir)) {
        md += `| ${airline.name} | ${airline.iata} | ${airline.icao} | ${
            airline.country
        } | ${airline.alliance || ''} | | | | | |\n`
        return
    }

    assetTypes.forEach((assetType) => {
        const colorAssetPath = path.join(airlineDir, `${assetType}.svg`)
        const monoAssetPath = path.join(airlineDir, `${assetType}-mono.svg`)

        const colorAssetExists = fs.existsSync(colorAssetPath)
        const monoAssetExists = fs.existsSync(monoAssetPath)

        let color_model = null
        let colors = null

        if (colorAssetExists) {
            colors = extractColorsFromSvg(colorAssetPath)
            color_model = determineColorModel(colors)
        }

        // A mono version is available if a mono file exists OR if the asset is a single-color model.
        const isMonoAvailable =
            monoAssetExists || (colorAssetExists && color_model === 'single')

        includedStates.push(colorAssetExists ? '✓' : '')
        includedStates.push(isMonoAvailable ? '✓' : '')

        if (colorAssetExists) {
            assets[assetType] = {
                has_mono_file: monoAssetExists,
            }
            if (color_model) {
                assets[assetType].color_model = color_model
                assets[assetType].colors = colors
            }
        }
    })

    airline.branding.assets = assets

    const {
        name,
        iata,
        website,
        icao,
        country,
        alliance,
        flag_carrier,
        branding: { primary_color },
    } = airline

    let airlineName = website ? `[${name}](${website})` : name

    if (flag_carrier) {
        const countries = country.split(',')
        countries.forEach((code) => {
            airlineName += ` ${getFlagEmoji(code)}`
        })
    }

    const colorSquare = primary_color
        ? `![${primary_color}](https://place-hold.it/10x10/${primary_color.replace(
              '#',
              ''
          )}/${primary_color.replace('#', '')}.png)`
        : ''

    md += `| ${airlineName} | ${iata || ''} | ${icao || ''} | ${
        country || ''
    } | ${alliance || ''} | ${colorSquare} | ${includedStates.join(' | ')} |\n`
})

fs.writeFileSync('airlines.json', JSON.stringify(sorted, null, 4))
fs.writeFileSync('AIRLINES.md', md)

console.log('✅ Successfully generated airlines.json and AIRLINES.md')
