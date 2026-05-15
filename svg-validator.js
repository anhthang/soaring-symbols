import {
    validateRequiredAttrs,
    validateNoScripts,
    validateNoTransforms,
    validateGeometry,
} from './scripts/lint/validators.js'

export function runSvgValidations(svg, type, bbox = null) {
    return [
        { label: 'Required attributes', ...validateRequiredAttrs(svg, type) },
        { label: 'No embedded scripts', ...validateNoScripts(svg) },
        { label: 'No transforms', ...validateNoTransforms(svg) },
        ...validateGeometry(type, bbox),
    ]
}
