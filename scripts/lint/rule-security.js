// RULE: No embedded <script> elements allowed
export function ruleNoScripts({ svgElement, issues }) {
    const scripts = svgElement.querySelectorAll('script')
    if (scripts.length > 0) {
        issues.push('Security: Embedded <script> element found and removed.')
        scripts.forEach((el) => el.remove())
    }
}
