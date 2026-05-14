// Validates assets/<slug>/<variant>.svg and optional <variant>-mono.svg based on airlines.json
const fs = require('fs')
const path = require('path')
const airlines = require('../airlines.json')
const { toSlug } = require('../utils')

function exists(p) {
    try {
        return fs.existsSync(p)
    } catch (e) {
        return false
    }
}

const baseDir = path.resolve(process.cwd(), 'assets')
let errors = 0

for (const a of airlines) {
    const slug = a.slug ? a.slug : toSlug(a.name)
    const variants = a.branding?.assets || {}
    const airlineDir = path.join(baseDir, slug)

    if (!exists(airlineDir)) {
        console.error(`[validate] Missing directory: ${airlineDir}`)
        errors++
    }

    for (const variant of ['icon', 'logo', 'tail']) {
        const vm = variants[variant]
        if (!vm) continue

        const colorPath = path.join(airlineDir, `${variant}.svg`)
        const monoPath = path.join(airlineDir, `${variant}-mono.svg`)
        const colorExists = exists(colorPath)
        const monoExists = exists(monoPath)

        // If color file is missing but metadata indicates a mono file exists,
        // treat missing color as acceptable as long as the mono file is present.
        if (!colorExists) {
            if (vm.has_mono_file) {
                if (!monoExists) {
                    console.error(
                        `[validate] Missing ${slug} ${variant} mono: ${monoPath}`
                    )
                    errors++
                }
            } else {
                console.error(
                    `[validate] Missing ${slug} ${variant} color: ${colorPath}`
                )
                errors++
            }
        } else {
            // color exists — ensure mono file exists when metadata expects it
            if (vm.has_mono_file && !monoExists) {
                console.error(
                    `[validate] Missing ${slug} ${variant} mono: ${monoPath}`
                )
                errors++
            }
        }
    }
}

if (errors > 0) {
    console.error(`[validate] Found ${errors} issue(s).`)
    process.exit(1)
} else {
    console.log('[validate] OK')
}
