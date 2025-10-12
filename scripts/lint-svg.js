const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

// --- CONFIGURATION ---
const ASSETS_DIR = 'assets'
const DRY_RUN = false
// ---------------------

const HEX_REGEX = /^#(?:[0-9A-F]{3}){1,2}$/i

/**
 * Lints an SVG file and returns a report of issues.
 * @param {string} filePath - The full path to the SVG file.
 * @returns {object} - An object containing a list of issues found.
 */
const lintSvgFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    const dom = new JSDOM(content, { contentType: 'image/svg+xml' })
    const document = dom.window.document
    const svgElement = document.querySelector('svg')

    if (!svgElement)
        return {
            issues: ['Invalid SVG: Missing <svg> element.'],
            fixedContent: null,
        }

    const issues = []

    // RULE 1: Enforce lowercase hex colors
    const elementsWithFill = document.querySelectorAll('[fill]')
    elementsWithFill.forEach((el) => {
        const fill = el.getAttribute('fill')
        if (fill.match(HEX_REGEX) && fill !== fill.toLowerCase()) {
            issues.push(
                `Uppercase hex: Found "${fill}", should be "${fill.toLowerCase()}".`
            )
            el.setAttribute('fill', fill.toLowerCase())
        }
    })

    // RULE 2: Enforce 'fill' attribute placement
    const allColors = [
        ...new Set(
            [...document.querySelectorAll('[fill]')]
                .map((el) => el.getAttribute('fill').toLowerCase())
                .filter((f) => f.match(HEX_REGEX))
        ),
    ]

    const isSingleColor = allColors.length <= 1

    if (isSingleColor) {
        const targetColor = allColors[0] || 'currentColor'
        if (svgElement.getAttribute('fill')?.toLowerCase() !== targetColor) {
            issues.push(`Root <svg> should have fill="${targetColor}".`)
            svgElement.setAttribute('fill', targetColor)
        }
        elementsWithFill.forEach((el) => {
            if (el.tagName.toLowerCase() !== 'svg') {
                issues.push(
                    `Redundant fill on <${el.tagName.toLowerCase()}> should be removed.`
                )
                el.removeAttribute('fill')
            }
        })
    } else {
        if (svgElement.hasAttribute('fill')) {
            issues.push(
                'Root <svg> should not have a fill attribute in multi-color icons.'
            )
            svgElement.removeAttribute('fill')
        }
    }

    const fixedContent = issues.length > 0 ? svgElement.outerHTML : null
    return { issues, fixedContent }
}

const main = () => {
    console.log('===================================')
    console.log('=      SVG Linter & Fixer         =')
    console.log('===================================')
    if (DRY_RUN) {
        console.log('--- 🔬 DRY RUN MODE: No files will be changed. ---\n')
    }

    let filesChecked = 0
    let issuesFound = 0
    let filesFixed = 0

    const airlineDirs = fs
        .readdirSync(ASSETS_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

    for (const dir of airlineDirs) {
        const airlinePath = path.join(ASSETS_DIR, dir)
        fs.readdirSync(airlinePath)
            .filter((f) => f.endsWith('.svg'))
            .forEach((file) => {
                filesChecked++
                const fullPath = path.join(airlinePath, file)
                const result = lintSvgFile(fullPath)

                if (result.issues.length > 0) {
                    issuesFound++

                    // --- UPDATED LOGGING FORMAT ---
                    console.log(`\n📁 Checking "${path.join(dir, file)}"...\n`)
                    result.issues.forEach((issue) =>
                        console.log(`  - ${issue}`)
                    )

                    if (!DRY_RUN) {
                        fs.writeFileSync(fullPath, result.fixedContent)
                        filesFixed++
                        console.log('\n  🔧 All issues fixed.')
                    }
                }
            })
    }

    console.log('\n--- ✨ Linter finished! ---')
    console.log(`Checked ${filesChecked} files.`)
    if (issuesFound > 0) {
        console.log(`Found issues in ${issuesFound} file(s).`)
        if (!DRY_RUN) {
            console.log(`Fixed ${filesFixed} file(s).`)
        }
    } else {
        console.log('✅ All files are compliant.')
    }
}

main()
