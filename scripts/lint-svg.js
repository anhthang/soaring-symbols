const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

// --- CONFIGURATION ---
const ASSETS_DIR = 'assets'
const DRY_RUN = false // Set to false to actually apply fixes.
// ---------------------

const HEX_REGEX = /^#(?:[0-9A-F]{3}){1,2}$/i

/**
 * A stylistic rule to ensure 'fill' comes before 'd' on path elements.
 * This is done via string replacement as DOM parsers don't preserve attribute order.
 * @param {string} svgString - The SVG content as a string.
 * @returns {{content: string, reordered: boolean}} - The modified content and a flag indicating if a change was made.
 */
const reorderPathAttributes = (svgString) => {
    let reordered = false
    const reorderedContent = svgString.replace(
        /<path([^>]*?) (d="[^"]*?")([^>]*?) (fill="[^"]*?")/g,
        (match, before, dAttr, after, fillAttr) => {
            reordered = true
            // Reconstruct the tag with fill moved before d
            return `<path${before} ${fillAttr} ${dAttr}${after}`
        }
    )
    return { content: reorderedContent, reordered }
}

/**
 * Lints an SVG file and returns a report of issues.
 * @param {string} filePath - The full path to the SVG file.
 * @returns {object} - An object containing a list of issues and the fixed content.
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

    let fixedContent = issues.length > 0 ? svgElement.outerHTML : null

    // RULE 3: Stylistic attribute order
    if (fixedContent) {
        const reorderResult = reorderPathAttributes(fixedContent)
        if (reorderResult.reordered) {
            issues.push(
                'Stylistic: `fill` attribute on <path> moved before `d`.'
            )
            fixedContent = reorderResult.content
        }
    } else {
        // Check even if no other issues were found
        const reorderResult = reorderPathAttributes(content)
        if (reorderResult.reordered) {
            issues.push(
                'Stylistic: `fill` attribute on <path> moved before `d`.'
            )
            fixedContent = reorderResult.content
        }
    }

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
    let filesWithIssues = 0
    let filesFixed = 0

    const airlineDirs = fs
        .readdirSync(ASSETS_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

    for (const dir of airlineDirs) {
        const airlinePath = path.join(ASSETS_DIR, dir)
        const issuesInDir = []
        let wasFixedInDir = false

        fs.readdirSync(airlinePath)
            .filter((f) => f.endsWith('.svg'))
            .forEach((file) => {
                filesChecked++
                const fullPath = path.join(airlinePath, file)
                const result = lintSvgFile(fullPath)

                if (result.issues.length > 0) {
                    filesWithIssues++
                    result.issues.forEach((issue) => {
                        issuesInDir.push(`${file}: ${issue}`)
                    })

                    if (!DRY_RUN && result.fixedContent) {
                        fs.writeFileSync(fullPath, result.fixedContent)
                        wasFixedInDir = true
                        filesFixed++
                    }
                }
            })

        if (issuesInDir.length > 0) {
            console.log(`📁 Checking "${dir}"...`)
            console.log()
            issuesInDir.forEach((issue) => console.log(`  ${issue}`))
            console.log()
            if (wasFixedInDir) {
                console.log('  🔧 Issues fixed.')
                console.log()
            }
        }
    }

    console.log('\n--- ✨ Linter finished! ---')
    console.log(`Checked ${filesChecked} files.`)
    if (filesWithIssues > 0) {
        console.log(`Found issues in ${filesWithIssues} file(s).`)
        if (!DRY_RUN) {
            console.log(`Fixed ${filesFixed} file(s).`)
        }
    } else {
        console.log('✅ All files are compliant.')
    }
}

main()
