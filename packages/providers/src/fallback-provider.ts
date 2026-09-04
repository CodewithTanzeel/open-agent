import type { LlmAdapter, LlmRequest, LlmResponse } from '@open-agent/agent'

export interface FallbackAdapterOptions {
  adapters: LlmAdapter[]
  notify?: (msg: string) => void
}

export class ProviderFallbackAdapter implements LlmAdapter {
  readonly name = 'provider-fallback'
  private index = 0

  constructor(private readonly opts: FallbackAdapterOptions) {}

  async generate(request: LlmRequest, signal: AbortSignal): Promise<LlmResponse> {
    const adapters = this.opts.adapters
    if (adapters.length === 0) throw new Error('no providers in fallback')
    const start = this.index
    for (let i = 0; i < adapters.length; i++) {
      const adapter = adapters[(start + i) % adapters.length]
      try {
        const res = await adapter.generate(request, signal)
        if ((start + i) % adapters.length !== start) {
          this.notify(`switched from ${adapters[start].name} to ${adapter.name}`)
        }
        this.index = (start + i + 1) % adapters.length
        return res
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('401') || msg.includes('403') || msg.includes('429') || msg.includes('responded 4')) {
          this.notify(`provider ${adapter.name} failed (${msg}), trying fallback`)
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
