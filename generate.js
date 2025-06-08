const fs = require('fs')
const sortBy = require('lodash.sortby')
const { default: slugify } = require('slugify')

const airlines = require('./airlines.json')

const icons = fs.readdirSync(__dirname + '/icons')
const logos = fs.readdirSync(__dirname + '/logos')

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

| Airline | IATA | ICAO | Country | Alliance | Primary Color | Icon | Mono Icon | Logo | Mono Logo |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
`

sorted.forEach((airline) => {
    const slug = slugify(airline.name, {
        lower: true,
    })

    const variations = []
    const includedStates = []

    if (icons.includes(`${slug}.svg`)) {
        variations.push('icon')
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }
    if (icons.includes(`${slug}_mono.svg`)) {
        variations.push('icon_mono')
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }
    if (logos.includes(`${slug}.svg`)) {
        variations.push('logo')
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }
    if (logos.includes(`${slug}_mono.svg`)) {
        variations.push('logo_mono')
        includedStates.push('✓')
    } else {
        includedStates.push('')
    }

    airline.branding.variations = variations

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
