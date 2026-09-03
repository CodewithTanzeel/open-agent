export type LlmProviderConfig =
  | { provider: 'openai-compatible'; baseURL: string; apiKey: string; model: string }
  | { provider: 'anthropic'; apiKey: string; model: string; baseURL?: string }
  | { provider: 'gemini'; apiKey: string; model: string; baseURL?: string }

export interface CliConfig {
  llm: LlmProviderConfig
  browserUse: boolean
  memory:
    | { provider: 'supermemory'; apiKey: string; baseURL?: string }
    | { provider: 'mem0'; apiKey: string }
    | { provider: 'none' }
}

export type ConfigResult = { ok: true; config: CliConfig } | { ok: false; error: string }

/** Pure, testable parse of the environment into a CliConfig. See .env.example for the full list. */
export function loadConfigFromEnv(env: NodeJS.ProcessEnv): ConfigResult {
  // First, determine the LLM provider. Prefer ANTHROPIC, then GEMINI, then OpenAI-compatible.
  let llm: LlmProviderConfig
  if (env.ANTHROPIC_API_KEY) {
    const model = env.ANTHROPIC_MODEL
    if (!model) {
      return { ok: false, error: 'ANTHROPIC_API_KEY is set but ANTHROPIC_MODEL is missing (see .env.example).' }
    }
    llm = { provider: 'anthropic', apiKey: env.ANTHROPIC_API_KEY, model, baseURL: env.ANTHROPIC_BASE_URL }
  } else if (env.GEMINI_API_KEY) {
    const model = env.GEMINI_MODEL
    if (!model) {
      return { ok: false, error: 'GEMINI_API_KEY is set but GEMINI_MODEL is missing (see .env.example).' }
    }
    llm = { provider: 'gemini', apiKey: env.GEMINI_API_KEY, model, baseURL: env.GEMINI_BASE_URL }
  } else {
    const baseURL = env.OPENAI_BASE_URL
    const apiKey = env.OPENAI_API_KEY
    const model = env.OPENAI_MODEL
    if (!baseURL || !apiKey || !model) {
      return {
        ok: false,
        error: 'Set ANTHROPIC_API_KEY+ANTHROPIC_MODEL, or GEMINI_API_KEY+GEMINI_MODEL, or OPENAI_BASE_URL+OPENAI_API_KEY+OPENAI_MODEL (see .env.example).',
      }
    }
    llm = { provider: 'openai-compatible', baseURL, apiKey, model }
  }

  const browserUse = env.BROWSER_USE === '1' || env.BROWSER_USE === 'true'

  let memory: CliConfig['memory'] = { provider: 'none' }
  if (env.SUPERMEMORY_API_KEY) {
    memory = { provider: 'supermemory', apiKey: env.SUPERMEMORY_API_KEY, baseURL: env.SUPERMEMORY_BASE_URL }
  } else if (env.MEM0_API_KEY) {
    memory = { provider: 'mem0', apiKey: env.MEM0_API_KEY }
  }

  return { ok: true, config: { llm, browserUse, memory } }
}
