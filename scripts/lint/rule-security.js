import { validateNoScripts } from './validators.js'

// RULE: No embedded <script> elements allowed
export function ruleNoScripts({ svgElement, issues }) {
    const { pass } = validateNoScripts(svgElement)
    if (!pass) {
        issues.push('Security: Embedded <script> element found and removed.')
        svgElement.querySelectorAll('script').forEach((el) => el.remove())
    }
}
