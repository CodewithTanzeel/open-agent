export interface Notification {
  jobId: string
  event: 'completed' | 'error' | 'cancelled' | 'retry'
  message: string
  at: number
}

export class NotificationLog {
  private readonly notifications: Notification[] = []

  notify(n: Notification): void {
    this.notifications.push(n)
  }

  list(): Notification[] {
    return [...this.notifications]
  }

  clear(): void {
    this.notifications.length = 0
  }
}
