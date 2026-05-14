export interface SvgCheck {
  label: string;
  pass: boolean;
  detail: string;
}

export function runSvgChecks(
  svg: SVGSVGElement,
  type: "logo" | "icon",
  bbox?: DOMRect | null,
): SvgCheck[];
