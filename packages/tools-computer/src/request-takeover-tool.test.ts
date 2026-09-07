import { describe, expect, it } from 'vitest'
import { ToolRegistry } from '@open-agent/agent'
import { requestTakeoverTool } from './request-takeover-tool.js'

describe('requestTakeoverTool', () => {
  it('declares ask-level permission (not safe, not dangerous)', () => {
    const tool = requestTakeoverTool()
    expect(tool.permissionLevel).toBe('ask')
  })

  it('returns ok with a structured message', async () => {
    const result = await requestTakeoverTool().execute(
      { reason: 'need to click' },
      { taskId: 't', signal: new AbortController().signal },
    )
    expect(result.ok).toBe(true)
    expect(result.content).toContain('Takeover requested')
  })

  it('requires approval through ToolRegistry (no bypass)', async () => {
    const registry = new ToolRegistry()
    registry.register(requestTakeoverTool())
    const denied = await registry.execute(
      { id: 'c1', name: 'request_takeover', args: { reason: 'x' } },
      { taskId: 't', signal: new AbortController().signal },
    )
    expect(denied.ok).toBe(false)
    registry.onApproval(() => true)
    const allowed = await registry.execute(
      { id: 'c2', name: 'request_takeover', args: { reason: 'x' } },
      { taskId: 't', signal: new AbortController().signal },
    )
    expect(allowed.ok).toBe(true)
  })
})
