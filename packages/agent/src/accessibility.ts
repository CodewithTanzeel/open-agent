export interface AccessibilityOptions {
  ariaLabels?: Record<string, string>
  focusable: boolean
}

export function applyAccessibility(elementId: string, opts?: AccessibilityOptions): string {
  return `aria-${elementId}:${JSON.stringify(opts)}`
}
