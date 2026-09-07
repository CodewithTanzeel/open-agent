import { describe, expect, it } from 'vitest'
import { createNutJsScreenshotOperator } from './ui-tars-adapter.js'
import { computerScreenshotTool } from './screenshot-tool.js'

describe('createNutJsScreenshotOperator', () => {
  // @ui-tars/operator-nut-js is an optional peer dependency: it needs native
  // bindings and a real display, so it is not installed here (or in CI).
  it('surfaces a missing peer package as a tool error, not a crash', async () => {
    const tool = computerScreenshotTool(createNutJsScreenshotOperator())
    const result = await tool.execute({}, { taskId: 't1', signal: new AbortController().signal })
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })
})
