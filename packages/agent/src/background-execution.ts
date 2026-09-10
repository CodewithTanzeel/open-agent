import { randomUUID } from 'node:crypto'
import type { AgentLoop } from './agent-loop.js'

export interface BackgroundTaskResult {
  taskId: string
  status: string
  completedAt?: number
  error?: string
}

export class BackgroundExecution {
  constructor(private readonly agentLoop: AgentLoop) {}

  async run(input: string, signal?: AbortSignal): Promise<BackgroundTaskResult> {
    const id = randomUUID()
    try {
      const state = await this.agentLoop.run(input, signal ?? new AbortController().signal, id)
      return {
        taskId: id,
        status: state.status,
        completedAt: Date.now(),
        error: state.error,
      }
    } catch (err) {
      return {
        taskId: id,
        status: 'error',
        completedAt: Date.now(),
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }
}
