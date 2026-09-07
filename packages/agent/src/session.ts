import type { Message, SessionEvent } from './types.js'

/**
 * The session log is the source of truth for what a task has seen and done.
 * Nothing reaches the model unless it was appended here first — anything
 * else (a raw provider response, a side channel) is not "model-visible"
 * and must not silently influence the next request.
 */
export class SessionLog {
  private readonly events: SessionEvent[] = []

  append(event: SessionEvent): SessionEvent {
    this.events.push(event)
    return event
  }

  all(taskId: string): SessionEvent[] {
    return this.events.filter((e) => e.taskId === taskId)
  }

  /** Return every task id that appears in the durable log. */
  findTasks(): string[] {
    const ids = new Set<string>()
    for (const e of this.events) ids.add(e.taskId)
    return Array.from(ids).sort()
  }

  /** Summarize a completed task from its last assistant message or turn/end. */
  getTaskSummary(taskId: string): { taskId: string; status: string; summary: string } | undefined {
    const ev = this.all(taskId)
    if (!ev.length) return undefined
    const end = ev.filter((e) => e.type === 'turn/end').pop()
    const lastMsg = ev.filter((e) => e.type === 'assistant/message').pop()
    const status = end ? end.reason : 'unknown'
    const summary = lastMsg ? (typeof lastMsg.message.content === 'string' ? lastMsg.message.content.slice(0, 120) : '...') : 'No message'
    return { taskId, status, summary }
  }

  /** Project the model-visible message history out of the durable log. */
  deriveMessages(taskId: string): Message[] {
    const messages: Message[] = []
    for (const event of this.all(taskId)) {
      if (event.type === 'system/message' || event.type === 'user/message' || event.type === 'assistant/message') {
        messages.push(event.message)
      } else if (event.type === 'tool/result') {
        messages.push({
          role: 'tool',
          content: event.result.ok ? event.result.content : `Error: ${event.result.error}`,
          toolCallId: event.callId,
        })
      }
    }
    return messages
  }
}
