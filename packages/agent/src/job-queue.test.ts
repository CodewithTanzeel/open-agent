import { describe, expect, it, vi } from 'vitest'
import { JobQueue } from './job-queue.js'
import type { AgentLoop } from './agent-loop.js'
import type { TaskState, TaskStatus } from './types.js'

describe('JobQueue', () => {
  it('enqueues a job and processes it asynchronously', async () => {
    let runCalled = false
    const mockLoop = {
      run: async (input: string, signal: AbortSignal, id: string): Promise<TaskState> => {
        runCalled = true
        return {
          id,
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      },
    } as unknown as AgentLoop

    const queue = new JobQueue(mockLoop)
    const jobId = queue.enqueue('test background task')

    expect(jobId).toBeDefined()

    let jobs = queue.list()
    expect(jobs).toHaveLength(1)
    expect(jobs[0].id).toBe(jobId)
    expect(jobs[0].taskInput).toBe('test background task')

    // allow event loop to pump
    await new Promise((resolve) => setTimeout(resolve, 10))

    jobs = queue.list()
    expect(runCalled).toBe(true)
    expect(jobs[0].status).toBe('completed' as TaskStatus)
    expect(jobs[0].completedAt).toBeDefined()
  })

  it('handles cancellation of a pending job', () => {
    const mockLoop = {
      run: async (): Promise<TaskState> => {
        return {
          id: '1',
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      },
    } as unknown as AgentLoop

    const queue = new JobQueue(mockLoop)
    // Spy on pump to delay it so jobs stay pending
    vi.spyOn(queue as any, 'pump').mockImplementation(async () => {})

    const jobId = queue.enqueue('test job')
    let jobs = queue.list()
    expect(jobs[0].status).toBe('pending')

    const cancelled = queue.cancel(jobId)
    expect(cancelled).toBe(true)

    jobs = queue.list()
    expect(jobs[0].status).toBe('cancelled')
  })
})
