import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { ToolRegistry } from '@open-agent/agent'
import { BrowserUseTools, mountBrowserUseTools } from './browser-use.js'

const fixture = fileURLToPath(new URL('../test-fixtures/fake-browser-use-server.mjs', import.meta.url))
const options = { command: process.execPath, args: [fixture] }

describe('BrowserUseTools', () => {
  let browserUse: BrowserUseTools | undefined

  afterEach(() => {
    browserUse?.close()
    browserUse = undefined
  })

  it("discovers browser-use's MCP tools and applies the permission policy", async () => {
    browserUse = new BrowserUseTools(options)
    await browserUse.connect()
    const tools = await browserUse.tools()

    const byName = Object.fromEntries(tools.map((t) => [t.name, t.permissionLevel]))
    expect(byName).toEqual({
      browser_navigate: 'safe',
      browser_click: 'safe',
      browser_type: 'safe',
      browser_scroll: 'safe',
      browser_screenshot: 'safe',
      browser_get_state: 'safe',
      browser_extract_content: 'safe',
      browser_get_html: 'safe',
      browser_list_tabs: 'safe',
      browser_switch_tab: 'safe',
      browser_close_tab: 'safe',
      retry_with_browser_use_agent: 'ask',
      browser_close_session: 'ask',
      browser_close_all: 'ask',
    })
  })

  it('executes a browsing tool through the adapted ToolDefinition', async () => {
    browserUse = new BrowserUseTools(options)
    await browserUse.connect()
    const tools = await browserUse.tools()

    // test navigate
    const navigate = tools.find((t) => t.name === 'browser_navigate')!
    const res1 = await navigate.execute(
      { url: 'https://example.com' },
      { taskId: 't1', signal: new AbortController().signal },
    )
    expect(res1).toEqual({ ok: true, content: 'navigated to https://example.com' })

    // test click
    const click = tools.find((t) => t.name === 'browser_click')!
    const res2 = await click.execute({ index: 5 }, { taskId: 't1', signal: new AbortController().signal })
    expect(res2).toEqual({ ok: true, content: 'clicked element at index 5' })

    // test type
    const type = tools.find((t) => t.name === 'browser_type')!
    const res3 = await type.execute({ index: 2, text: 'hello' }, { taskId: 't1', signal: new AbortController().signal })
    expect(res3).toEqual({ ok: true, content: 'typed "hello" into element at index 2' })

    // test screenshot
    const screenshot = tools.find((t) => t.name === 'browser_screenshot')!
    const res4 = await screenshot.execute({}, { taskId: 't1', signal: new AbortController().signal })
    expect(res4).toEqual({ ok: true, content: '[screenshot captured]' })
  })
})

describe('mountBrowserUseTools', () => {
  it('registers every browser-use tool on the given ToolRegistry, gated by its permission level', async () => {
    const registry = new ToolRegistry()
    const dispose = await mountBrowserUseTools(registry, options)

    expect(
      registry
        .list()
        .map((t) => t.name)
        .sort(),
    ).toEqual(
      [
        'browser_close_all',
        'browser_close_session',
        'browser_close_tab',
        'browser_click',
        'browser_extract_content',
        'browser_get_html',
        'browser_get_state',
        'browser_list_tabs',
        'browser_navigate',
        'browser_screenshot',
        'browser_scroll',
        'browser_switch_tab',
        'browser_type',
        'retry_with_browser_use_agent',
      ].sort(),
    )

    const safeResult = await registry.execute(
      { id: 'c1', name: 'browser_navigate', args: { url: 'https://example.com' } },
      { taskId: 't1', signal: new AbortController().signal },
    )
    expect(safeResult.ok).toBe(true)

    const gatedResult1 = await registry.execute(
      { id: 'c2', name: 'browser_close_all', args: {} },
      { taskId: 't1', signal: new AbortController().signal },
    )
    expect(gatedResult1.ok).toBe(false)
    expect(gatedResult1.error).toMatch(/approval/)

    const gatedResult2 = await registry.execute(
      { id: 'c3', name: 'browser_close_session', args: {} },
      { taskId: 't1', signal: new AbortController().signal },
    )
    expect(gatedResult2.ok).toBe(false)
    expect(gatedResult2.error).toMatch(/approval/)

    dispose()
  })
})
