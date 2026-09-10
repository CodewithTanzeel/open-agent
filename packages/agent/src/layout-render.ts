export interface Layout {
  rows: number
  cols: number
}
export function renderLayout(l: Layout): string {
  return `layout:${l.rows}x${l.cols}`
}
