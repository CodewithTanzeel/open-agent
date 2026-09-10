export interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
}

export function isMobile(width: number): boolean {
  return width < DEFAULT_BREAKPOINTS.tablet
}
