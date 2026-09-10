export interface AnimationConfig {
  durationMs: number
  easing: 'linear' | 'ease-in' | 'ease-out'
}

export function animate(durationMs: number, easing: 'linear' | 'ease-in' | 'ease-out' = 'linear'): AnimationConfig {
  return { durationMs, easing }
}
