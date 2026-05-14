import { validateViewBox, validateNoTransforms } from './validators.js'

// RULE: <title> must exist and be the first child
export function ruleTitle({ svgElement, document, airlineName, issues }) {
    let titleElement = svgElement.querySelector('title')
    if (!titleElement) {
        issues.push('Accessibility: Missing <title> element.')
        titleElement = document.createElement('title')
        titleElement.textContent = airlineName
        svgElement.prepend(titleElement)
    } else if (svgElement.firstElementChild !== titleElement) {
        issues.push('Accessibility: <title> must be the first element inside <svg>.')
        svgElement.prepend(titleElement)
    }
}

// RULE: viewBox must match expected size (64×64 for logos, 24×24 for icons/tails)
export function ruleViewBox({ svgElement, isIcon, issues }) {
    const { pass, expected } = validateViewBox(svgElement, isIcon ? 'icon' : 'logo')
    if (!pass) {
        issues.push(`ViewBox: Should be "${expected}".`)
        svgElement.setAttribute('viewBox', expected)
    }
}

// RULE: role, viewBox, and xmlns must be present on the root <svg>
export function ruleRequiredAttrs({ svgElement, issues }) {
    for (const attr of ['role', 'viewBox', 'xmlns']) {
        if (!svgElement.hasAttribute(attr)) {
            issues.push(`Structure: Missing required attribute \`${attr}\`.`)
        }
    }
}

// RULE: No transform attributes allowed on any element
export function ruleNoTransforms({ svgElement, issues }) {
    const { pass, detail } = validateNoTransforms(svgElement)
    if (!pass) {
        issues.push(`Structure: Transform attributes found: ${detail}`)
    }
}
