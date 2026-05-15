export interface SvgValidation {
    label: string
    pass: boolean
    detail: string
}

export function runSvgValidations(
    svg: SVGSVGElement,
    type: 'logo' | 'icon',
    bbox?: DOMRect | null,
): SvgValidation[]
