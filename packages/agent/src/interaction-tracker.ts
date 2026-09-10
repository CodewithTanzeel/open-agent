export interface InteractionEvent {
  type: 'click' | 'hover' | 'focus' | 'blur'
  elementId: string
  timestamp: number
}

export class InteractionTracker {
  private events: InteractionEvent[] = []

  record(event: InteractionEvent): void {
    this.events.push(event)
  }

  getEvents(): InteractionEvent[] {
    return [...this.events]
  }
}
