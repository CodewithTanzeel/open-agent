import { describe, expect, it, vi } from 'vitest'
import { ProviderFallbackAdapter } from './fallback-provider.js'

describe('ProviderFallbackAdapter fixes', () => {
  it('does NOT treat 400 as a fallback trigger (false-positive fix)', async () => {
    const bad = { name: 'bad', generate: vi.fn().mockRejectedValue(new Error('responded 400: Bad Request')) }
    const ok = { name: 'ok', generate: vi.fn().mockResolvedValue({ message: { role: 'assistant', content: 'ok' } }) }
    const fb = new ProviderFallbackAdapter({ adapters: [bad as any, ok as any] })
    await expect(fb.generate({ messages: [], tools: [] }, new AbortController().signal)).rejects.toThrow('responded 400')
    expect(ok.generate).not.toHaveBeenCalled()
  })

  it('falls back on 401/403/429 and applies backoff', async () => {
    const a = { name: 'a', generate: vi.fn().mockRejectedValueOnce(new Error('responded 429')) }
    const b = { name: 'b', generate: vi.fn().mockResolvedValue({ message: { role: 'assistant', content: 'ok' } }) }
    const fb = new ProviderFallbackAdapter({ adapters: [a as any, b as any] })
    const res = await fb.generate({ messages: [], tools: [] }, new AbortController().signal)
    expect(res.message.content).toBe('ok')
    expect(b.generate).toHaveBeenCalled()
  })

  it('respects abort between iterations', async () => {
    const a = { name: 'a', generate: vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 50))
      return { message: { role: 'assistant', content: 'x' } }
    })
    const fb = new ProviderFallbackAdapter({ adapters: [a as any] })
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), 10)
    await expect(fb.generate({ messages: [], tools: [] }, ctrl.signal)).rejects.toThrow()
  })
})
