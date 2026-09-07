import { describe, expect, it } from 'vitest'
import { ToolRegistry } from '@open-agent/agent'
import { askForLoginTool } from './ask-for-login-tool.js'

describe('askForLoginTool', () => {
  it('declares ask-level permission', () => {
    const tool = askForLoginTool()
    expect(tool.permissionLevel).toBe('ask')
  })

  it('returns ok with site in the content', async () => {
    const result = await askForLoginTool().execute(
      { site: 'github.com', reason: 'auth needed' },
      { taskId: 't', signal: new AbortController().signal },
    )
    expect(result.ok).toBe(true)
    expect(result.content).toContain('github.com')
  })

  it('requires approval through ToolRegistry (no bypass)', async () => {
    const registry = new ToolRegistry()
    registry.register(askForLoginTool())
    const denied = await registry.execute(
      { id: 'c1', name: 'ask_for_login', args: { site: 'x.com' } },
      { taskId: 't', signal: new AbortController().signal },
    )
    expect(denied.ok).toBe(false)
    registry.onApproval(() => true)
    const allowed = await registry.execute(
      { id: 'c2', name: 'ask_for_login', args: { site: 'x.com' } },
      { taskId: 't', signal: new AbortController().signal },
    )
    expect(allowed.ok).toBe(true)
  })
})
