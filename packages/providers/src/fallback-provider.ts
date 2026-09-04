import type { LlmAdapter, LlmRequest, LlmResponse } from '@open-agent/agent'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function parseFallbackCode(msg: string): number | null {
  const m = msg.match(/responded ([0-9]{3})/)
  if (m) return parseInt(m[1], 10)
  return null
}

export interface FallbackAdapterOptions {
  adapters: LlmAdapter[]
  notify?: (msg: string) => void
}

export class ProviderFallbackAdapter implements LlmAdapter {
  readonly name = 'provider-fallback'

  constructor(private readonly opts: FallbackAdapterOptions) {}

  async generate(request: LlmRequest, signal: AbortSignal): Promise<LlmResponse> {
    const adapters = this.opts.adapters
    if (adapters.length === 0) throw new Error('no providers in fallback')

    let delay = 0
    for (let i = 0; i < adapters.length; i++) {
      const adapter = adapters[i]
      if (signal.aborted) throw signal.reason ?? new Error('aborted')
      if (delay > 0) await sleep(delay)
      try {
        const res = await adapter.generate(request, signal)
        // always advance so subsequent calls start from the next adapter (round-robin)
        const nextIndex = (i + 1) % adapters.length
        if (nextIndex !== 0) {
          this.notify(`switched from ${adapter.name} to ${adapters[nextIndex].name}`)
        }
        return res
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        // 400 is excluded: it indicates a client fault (bad request body, missing
        // fields) that a fallback provider will also produce — rotating is wasted.
        // 401/403/429 indicate transient or auth problems worth retrying elsewhere.
        const code = parseFallbackCode(msg)
        const isFallbackable =
          code === 401 || code === 403 || code === 429 || msg.includes('401') || msg.includes('403') || msg.includes('429')
        if (isFallbackable) {
          this.notify(`provider ${adapter.name} failed (${msg}), trying fallback`)
          delay = Math.min(delay * 2 + 100, 5_000) // simple exponential backoff, capped at 5s
          continue
        }
        throw err
      }
    }
    throw new Error('all providers exhausted')
  }

  private notify(msg: string) {
    if (this.opts.notify) this.opts.notify(msg)
  }
}
