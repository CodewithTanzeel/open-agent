import { SessionLog } from './session.js'

export interface TaskHistoryEntry {
  id: string
  status: string
  createdAt: number
  updatedAt: number
  summary?: string
}

export class TaskHistory {
  constructor(private readonly sessionLog: SessionLog) {}

  list(): TaskHistoryEntry[] {
    const tasks = this.sessionLog.findTasks()
    return tasks.map((id) => {
      const summary = this.sessionLog.getTaskSummary(id)
      const events = this.sessionLog.all(id)
      const first = events[0]
      const last = events[events.length - 1]
      return {
        id,
        status: summary?.status ?? 'unknown',
        createdAt: first ? first.at : 0,
        updatedAt: last ? last.at : 0,
        summary: summary?.summary,
      }
    })
  }

  get(id: string): TaskHistoryEntry | undefined {
    return this.list().find((t) => t.id === id)
  }
}
