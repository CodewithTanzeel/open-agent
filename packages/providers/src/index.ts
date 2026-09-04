export { OpenAiCompatibleProvider } from './openai-compatible.js'
export type { OpenAiCompatibleOptions } from './openai-compatible.js'
export { GeminiProvider } from './gemini.js'
export type { GeminiOptions } from './gemini.js'
export { AnthropicProvider } from './anthropic.js'
export type { AnthropicOptions } from './anthropic.js'
export { ProviderFallbackAdapter } from './fallback-provider.js'
export type { FallbackAdapterOptions } from './fallback-provider.js'
// Multi-provider fallback adapter — rotates across adapters on 401/403/429,
// excludes 400 (client fault), uses per-call rotation (no shared mutable index),
// applies exponential backoff, and respects AbortSignal.
