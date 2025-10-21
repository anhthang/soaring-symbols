const { readFileSync } = require('fs')
const slugify = require('slugify').default

function toSlug(name) {
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

module.exports = {
    toSlug,
    extractColorsFromSvg,
    determineColorModel,
}
