export interface BacklogItem {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  done: boolean
}

export class Backlog {
  private items: BacklogItem[] = []

  add(item: BacklogItem): void {
    this.items.push(item)
  }

  list(): BacklogItem[] {
    return [...this.items].sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1))
  }
}
