export interface DiffResult {
  added: string[]
  removed: string[]
  unchanged: string[]
}

export function computeDiff(oldLines: string[], newLines: string[]): DiffResult {
  const oldSet = new Set(oldLines)
  const newSet = new Set(newLines)
  return {
    added: newLines.filter((l) => !oldSet.has(l)),
    removed: oldLines.filter((l) => !newSet.has(l)),
    unchanged: oldLines.filter((l) => newSet.has(l)),
  }
}
