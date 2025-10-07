const fs = require('fs')
const sortBy = require('lodash.sortby')
const { default: slugify } = require('slugify')
const path = require('path')

const airlines = require('./airlines.json')

const extractColorsFromSvg = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    const colorRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g
    const colors = [...new Set(content.match(colorRegex) || [])]
    return colors.length > 0 ? colors : null
}

const determineColorMode = (colors) => {
    if (!colors) return null
    return colors.length > 1 ? 'multi' : 'single'
}

const assetsDir = __dirname + '/assets'

const sorted = sortBy(airlines, (a) => a.name.toLowerCase())

const getFlagEmoji = (isoCode) => {
    if (!isoCode) return '🏴'

    if (isoCode === 'GB-ENG') {
        return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    }
    if (isoCode === 'GB-WLS') {
        return '🏴󠁧󠁢󠁷󠁬󠁳󠁿'
    }
    if (isoCode === 'GB-SCT') {
        return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
    }
    if (isoCode === 'GB-NIR') {
        // The only official flag in Northern Ireland is the Union Flag of the United Kingdom.
        return '🇬🇧'
    }

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

| Airline | IATA | ICAO | Country | Alliance | Primary Color | Icon | Color Icon | Logo | Color Logo |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
`

sorted.forEach((airline) => {
    const slug = slugify(airline.name, {
        lower: true,
    })

    const includedStates = []
    const airlineDir = `${assetsDir}/${slug}`
    const assets = {}

    if (!fs.existsSync(airlineDir)) {
        includedStates.push('', '', '', '')
        return
    }

    // Check and process icon
    const iconPath = path.join(airlineDir, 'icon.svg')
    if (fs.existsSync(iconPath)) {
        assets.icon = true
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }

    // Check and process icon_color
    const iconColorPath = path.join(airlineDir, 'icon_color.svg')
    if (fs.existsSync(iconColorPath)) {
        const colors = extractColorsFromSvg(iconColorPath)
        if (colors) {
            assets.icon_color = {
                color_mode: determineColorMode(colors),
                colors: colors
            }
        }

        assets.icon_color = !!colors?.length // FIXME: remove later once model is stable
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }

    // Check and process logo
    const logoPath = path.join(airlineDir, 'logo.svg')
    if (fs.existsSync(logoPath)) {
        assets.logo = true
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }

    // Check and process logo_color
    const logoColorPath = path.join(airlineDir, 'logo_color.svg')
    if (fs.existsSync(logoColorPath)) {
        const colors = extractColorsFromSvg(logoColorPath)
        if (colors) {
            assets.logo_color = {
                color_mode: determineColorMode(colors),
                colors: colors
            }
        }

        assets.logo_color = !!colors?.length // FIXME: remove later once model is stable
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }

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

    md += `| ${airlineName} | ${iata} | ${icao} | ${country} | ${
        alliance || ''
    } | ${`![${primary_color}](https://place-hold.it/10x10/${primary_color.replace(
        '#',
        ''
    )}?text=)`} | ${includedStates.join(' | ')} |\n`
})

fs.writeFileSync('airlines.json', JSON.stringify(sorted, null, 4))
fs.writeFileSync('AIRLINES.md', md)
