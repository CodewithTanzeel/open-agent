import { describe, expect, it } from 'vitest'
import { SessionLog } from './session.js'

describe('SessionLog', () => {
  it('projects only model-visible events into messages, in order', () => {
    const log = new SessionLog()
    log.append({ type: 'turn/start', taskId: 't1', at: 0 })
    log.append({ type: 'user/message', taskId: 't1', at: 1, message: { role: 'user', content: 'hi' } })
    log.append({
      type: 'assistant/message',
      taskId: 't1',
      at: 2,
      message: { role: 'assistant', content: '', toolCalls: [{ id: 'c1', name: 'echo', args: {} }] },
    })
    log.append({ type: 'tool/call', taskId: 't1', at: 3, call: { id: 'c1', name: 'echo', args: {} } })
    log.append({ type: 'tool/result', taskId: 't1', at: 4, callId: 'c1', result: { ok: true, content: 'done' } })

    const messages = log.deriveMessages('t1')
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant', 'tool'])
    expect(messages[2]).toEqual({ role: 'tool', content: 'done', toolCallId: 'c1' })
  })

  it('scopes events by taskId', () => {
    const log = new SessionLog()
    log.append({ type: 'user/message', taskId: 'a', at: 0, message: { role: 'user', content: 'a-msg' } })
    log.append({ type: 'user/message', taskId: 'b', at: 0, message: { role: 'user', content: 'b-msg' } })
    expect(log.deriveMessages('a')).toHaveLength(1)
    expect(log.deriveMessages('a')[0].content).toBe('a-msg')
  })
  it('findTasks returns task ids oldest first, not sorted by id', () => {
    const log = new SessionLog()
    // Ids chosen so alphabetical order is the reverse of chronological order.
    log.append({ type: 'user/message', taskId: 'zzz', at: 1, message: { role: 'user', content: 'first' } })
    log.append({ type: 'user/message', taskId: 'aaa', at: 2, message: { role: 'user', content: 'second' } })
    expect(log.findTasks()).toEqual(['zzz', 'aaa'])
  })

  it('getTaskSummary reports the end reason and the last assistant message', () => {
    const log = new SessionLog()
    log.append({ type: 'user/message', taskId: 't1', at: 0, message: { role: 'user', content: 'hi' } })
    log.append({ type: 'assistant/message', taskId: 't1', at: 1, message: { role: 'assistant', content: 'early' } })
    log.append({ type: 'assistant/message', taskId: 't1', at: 2, message: { role: 'assistant', content: 'final' } })
    log.append({ type: 'turn/end', taskId: 't1', at: 3, reason: 'completed' })
    expect(log.getTaskSummary('t1')).toEqual({ taskId: 't1', status: 'completed', summary: 'final' })
  })

  it('getTaskSummary truncates a long answer to 120 characters', () => {
    const log = new SessionLog()
    log.append({
      type: 'assistant/message',
      taskId: 't1',
      at: 0,
      message: { role: 'assistant', content: 'x'.repeat(500) },
    })
    expect(log.getTaskSummary('t1')?.summary).toHaveLength(120)
  })

  it('getTaskSummary falls back when a task never ended or never answered', () => {
    const log = new SessionLog()
    log.append({ type: 'user/message', taskId: 't1', at: 0, message: { role: 'user', content: 'hi' } })
    expect(log.getTaskSummary('t1')).toEqual({ taskId: 't1', status: 'unknown', summary: 'No message' })
  })

  it('getTaskSummary returns undefined for an unknown task id', () => {
    const log = new SessionLog()
    expect(log.getTaskSummary('nope')).toBeUndefined()
  })
})
