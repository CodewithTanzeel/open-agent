import { randomUUID } from 'node:crypto'
import type { AgentLoop } from './agent-loop.js'
import type { TaskStatus } from './types.js'

export interface JobInfo {
  id: string
  taskInput: string
  status: TaskStatus
  createdAt: number
  startedAt?: number
  completedAt?: number
  error?: string
  retries?: number
  maxRetries?: number
}

export class JobQueue {
  private readonly jobs: Map<string, JobInfo> = new Map()
  private readonly abortControllers: Map<string, AbortController> = new Map()
  private readonly executionQueue: string[] = []
  private activeJobs = 0
  private maxConcurrent = 2 // Simple concurrency limit

  constructor(private readonly agentLoop: AgentLoop) {}

  enqueue(input: string, maxRetries = 3): string {
    const id = randomUUID()
    this.jobs.set(id, {
      id,
      taskInput: input,
      status: 'pending',
      createdAt: Date.now(),
      retries: 0,
      maxRetries,
    })
    this.executionQueue.push(id)
    this.pump().catch(() => {})
    return id
  }

  list(): JobInfo[] {
    return Array.from(this.jobs.values()).sort((a, b) => a.createdAt - b.createdAt)
  }

  retry(id: string): boolean {
    const job = this.jobs.get(id)
    if (!job) return false
    if (job.status !== 'error' && job.status !== 'cancelled') return false
    if ((job.retries ?? 0) >= (job.maxRetries ?? 3)) return false

    job.status = 'pending'
    job.retries = (job.retries ?? 0) + 1
    job.completedAt = undefined
    job.error = undefined
    job.startedAt = undefined
    this.executionQueue.push(id)
    this.pump().catch(() => {})
    return true
  }

  cancel(id: string): boolean {
    const job = this.jobs.get(id)
    if (!job) return false

    if (job.status === 'pending') {
      job.status = 'cancelled'
      job.completedAt = Date.now()
      // Remove from queue
      const idx = this.executionQueue.indexOf(id)
      if (idx !== -1) {
        this.executionQueue.splice(idx, 1)
      }
      return true
    }

    if (job.status === 'running') {
      const controller = this.abortControllers.get(id)
      if (controller) {
        controller.abort()
      }
      return true
    }

    return false // Already finished
  }

  generateJobId(): string {
    return randomUUID()
  }

  private async pump(): Promise<void> {
    if (this.activeJobs >= this.maxConcurrent) return
    const id = this.executionQueue.shift()
    if (!id) return

    const job = this.jobs.get(id)
    if (!job || job.status !== 'pending') {
      return this.pump() // Check next
    }

    this.activeJobs++
    job.status = 'running'
    job.startedAt = Date.now()

    const ac = new AbortController()
    this.abortControllers.set(id, ac)

    try {
      const taskState = await this.agentLoop.run(job.taskInput, ac.signal, id)
      job.status = taskState.status
      job.error = taskState.error
    } catch (err) {
      if (err instanceof Error && err.name === 'CancelledError') {
        job.status = 'cancelled'
      } else {
        job.status = 'error'
        job.error = err instanceof Error ? err.message : String(err)
      }
    } finally {
      job.completedAt = Date.now()
      this.abortControllers.delete(id)
      this.activeJobs--
      this.pump().catch(() => {})
    }
  }
}
