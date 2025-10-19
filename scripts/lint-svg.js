const { readFileSync, readdirSync, writeFileSync } = require('fs')
const { basename, dirname, join } = require('path')
const { JSDOM } = require('jsdom')

// --- CONFIGURATION ---
const ASSETS_DIR = 'assets'
const DRY_RUN = !process.argv.includes('--fix')

const EXCLUDE_FILES = [
    'assets/british-airways/icon.svg',
    'assets/iberia/icon.svg',
    'assets/iberia/logo.svg',
    'assets/southwest-airlines/icon.svg',
]
// ---------------------

const HEX_REGEX = /^#(?:[0-9A-F]{3}){1,2}$/i

/**
 * Extracts the airline name from its directory name.
 * Example: "vietnam-airlines" -> "Vietnam Airlines"
 * @param {string} filePath - The full path to the SVG file.
 * @returns {string}
 */
const getAirlineNameFromFilePath = (filePath) => {
    const dirName = basename(dirname(filePath))
    return dirName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * A stylistic rule to ensure 'fill' comes before 'd' on path elements.
 * @param {string} svgString - The SVG content as a string.
 * @returns {{content: string, reordered: boolean}}
 */
const reorderPathAttributes = (svgString) => {
    let reordered = false
    const reorderedContent = svgString.replace(
        /<path([^>]*?) (d="[^"]*?")([^>]*?) (fill="[^"]*?")/g,
        (match, before, dAttr, after, fillAttr) => {
            reordered = true
            return `<path${before} ${fillAttr} ${dAttr}${after}`
        }
    )
    return { content: reorderedContent, reordered }
}

/**
 * A stylistic rule to enforce the order of root SVG attributes.
 * @param {string} svgString - The SVG content as a string.
 * @returns {{content: string, reordered: boolean}}
 */
const reorderSvgRootAttributes = (svgString) => {
    const svgTagMatch = svgString.match(/<svg([^>]*)>/)
    if (!svgTagMatch) return { content: svgString, reordered: false }

    const attributesString = svgTagMatch[1]
    const attributes = {}
    const attrRegex = /([a-zA-Z0-9-]+)="([^"]*)"/g
    let match
    while ((match = attrRegex.exec(attributesString)) !== null) {
        attributes[match[1]] = match[2]
    }

    const desiredOrder = ['role', 'viewBox', 'xmlns', 'fill']
    const orderedAttrs = []
    const otherAttrs = []

    desiredOrder.forEach((key) => {
        if (attributes[key]) {
            orderedAttrs.push(`${key}="${attributes[key]}"`)
        }
    })

    for (const key in attributes) {
        if (!desiredOrder.includes(key)) {
            otherAttrs.push(`${key}="${attributes[key]}"`)
        }
    }

    const finalAttrs = [...orderedAttrs, ...otherAttrs].join(' ')

    if (
        finalAttrs.replace(/\s+/g, '') ===
        attributesString.trim().replace(/\s+/g, '')
    ) {
        return { content: svgString, reordered: false }
    }

    const newSvgTag = `<svg ${finalAttrs}>`
    return {
        content: svgString.replace(svgTagMatch[0], newSvgTag),
        reordered: true,
    }
}

/**
 * Lints an SVG file and returns a report of issues.
 * @param {string} filePath - The full path to the SVG file.
 * @returns {object} - An object containing a list of issues and the fixed content.
 */
const lintSvgFile = (filePath) => {
    const originalContent = readFileSync(filePath, 'utf8')
    const dom = new JSDOM(originalContent, { contentType: 'image/svg+xml' })
    const document = dom.window.document
    const svgElement = document.querySelector('svg')

    if (!svgElement)
        return {
            issues: ['Invalid SVG: Missing <svg> element.'],
            fixedContent: null,
        }

    const issues = []

    // RULE 1: Title must exist and be the first child
    const airlineName = getAirlineNameFromFilePath(filePath)
    let titleElement = svgElement.querySelector('title')
    if (!titleElement) {
        issues.push('Accessibility: Missing <title> element.')
        titleElement = document.createElement('title')
        titleElement.textContent = airlineName
        svgElement.prepend(titleElement)
    } else if (svgElement.firstElementChild !== titleElement) {
        issues.push(
            'Accessibility: <title> must be the first element inside <svg>.'
        )
        svgElement.prepend(titleElement)
    }

    // RULE 2: ViewBox must be correct based on filename
    const isIcon =
        basename(filePath).includes('icon') ||
        basename(filePath).includes('tail')
    const expectedViewBox = isIcon ? '0 0 24 24' : '0 0 64 64'
    if (svgElement.getAttribute('viewBox') !== expectedViewBox) {
        issues.push(`ViewBox: Should be "${expectedViewBox}".`)
        svgElement.setAttribute('viewBox', expectedViewBox)
    }

    // RULE 3: Required root attributes must be present
    ;['role', 'viewBox', 'xmlns'].forEach((attr) => {
        if (!svgElement.hasAttribute(attr)) {
            issues.push(`Structure: Missing required attribute \`${attr}\`.`)
        }
    })

    // RULE 4: Hex color codes must be lowercase
    const elementsWithFill = document.querySelectorAll('[fill]')
    elementsWithFill.forEach((el) => {
        const fill = el.getAttribute('fill')
        if (fill.match(HEX_REGEX) && fill !== fill.toLowerCase()) {
            issues.push(
                `Style: Uppercase hex found "${fill}", should be "${fill.toLowerCase()}".`
            )
            el.setAttribute('fill', fill.toLowerCase())
        }
    })

    // RULE 5: Fill attribute placement must be correct
    const allColors = [
        ...new Set(
            [...document.querySelectorAll('[fill]')]
                .map((el) => el.getAttribute('fill').toLowerCase())
                .filter((f) => f.match(HEX_REGEX))
        ),
    ]
    const isSingleColor = allColors.length <= 1

    if (isSingleColor) {
        const isMonoFile = filePath.includes('-mono.svg')
        const targetColor = allColors[0] || 'currentColor'
        const existingFill = svgElement.getAttribute('fill')

        if (isMonoFile) {
            if (existingFill !== 'currentColor') {
                issues.push(`Fill: Root <svg> should have fill="currentColor".`)
                svgElement.setAttribute('fill', 'currentColor')
            }
        } else {
            if (existingFill?.toLowerCase() !== targetColor) {
                issues.push(
                    `Fill: Root <svg> should have fill="${targetColor}".`
                )
                svgElement.setAttribute('fill', targetColor)
            }
        }

        elementsWithFill.forEach((el) => {
            if (el.tagName.toLowerCase() !== 'svg') {
                issues.push(
                    `Fill: Redundant fill on <${el.tagName.toLowerCase()}> should be removed.`
                )
                el.removeAttribute('fill')
            }
        })
    } else {
        // Multi-color
        if (svgElement.hasAttribute('fill')) {
            issues.push(
                'Fill: Root <svg> should not have a fill attribute in multi-color icons.'
            )
            svgElement.removeAttribute('fill')
        }
    }

    let fixedContent =
        issues.length > 0 ? svgElement.outerHTML : originalContent
    let hasStructuralFixes = issues.length > 0

    // RULE 6: 'fill' attribute must come before 'd' on path elements
    const pathReorderResult = reorderPathAttributes(fixedContent)
    if (pathReorderResult.reordered) {
        if (!hasStructuralFixes)
            issues.push('Style: `fill` attribute on <path> moved before `d`.')
        fixedContent = pathReorderResult.content
        hasStructuralFixes = true
    }

    // RULE 7: Root SVG attributes must be in the correct order
    const svgRootReorderResult = reorderSvgRootAttributes(fixedContent)
    if (svgRootReorderResult.reordered) {
        if (!hasStructuralFixes)
            issues.push('Style: Root <svg> attributes reordered.')
        fixedContent = svgRootReorderResult.content
        hasStructuralFixes = true
    }

    return { issues, fixedContent: hasStructuralFixes ? fixedContent : null }
}

const main = () => {
    console.log('===================================')
    console.log('=      SVG Linter & Fixer         =')
    console.log('===================================')
    console.log()

    if (DRY_RUN) {
        console.log('--- 🔬 DRY RUN MODE: No files will be changed. ---\n')
    }

    let filesChecked = 0
    let filesWithIssues = 0
    let filesFixed = 0

    const airlineDirs = readdirSync(ASSETS_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

    for (const dir of airlineDirs) {
        const airlinePath = join(ASSETS_DIR, dir)
        const issuesInDir = []
        let wasFixedInDir = false

        readdirSync(airlinePath)
            .filter((f) => f.endsWith('.svg'))
            .forEach((file) => {
                filesChecked++
                const fullPath = join(airlinePath, file)

                const relativePath = join(dir, file).replace(/\\/g, '/')
                if (EXCLUDE_FILES.includes(`assets/${relativePath}`)) {
                    console.log(`🟡 Skipping excluded file: ${relativePath}\n`)
                    return
                }

                const result = lintSvgFile(fullPath)

                if (result.issues.length > 0) {
                    filesWithIssues++
                    result.issues.forEach((issue) => {
                        issuesInDir.push(`${file}: ${issue}`)
                    })

                    if (!DRY_RUN && result.fixedContent) {
                        writeFileSync(fullPath, result.fixedContent)
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

    console.log('--- ✨ Linter finished! ---')
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
