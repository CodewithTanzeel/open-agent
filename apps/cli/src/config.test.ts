import { describe, expect, it } from 'vitest'
import { loadConfigFromEnv } from './config.js'

describe('loadConfigFromEnv', () => {
  it('fails when no provider keys are set', () => {
    const result = loadConfigFromEnv({})
    expect(result).toEqual({ ok: false, error: expect.stringMatching(/ANTHROPIC_API_KEY|GEMINI_API_KEY|OPENAI_BASE_URL/) })
  })

  it('parses anthropic config', () => {
    const result = loadConfigFromEnv({
      ANTHROPIC_API_KEY: 'sk-ant',
      ANTHROPIC_MODEL: 'claude-3-5-sonnet-20241022',
    })
    expect(result).toEqual({
      ok: true,
      config: {
        llm: { provider: 'anthropic', apiKey: 'sk-ant', model: 'claude-3-5-sonnet-20241022' },
        browserUse: false,
        memory: { provider: 'none' },
      },
    })
  })

  it('fails when ANTHROPIC_API_KEY is set but ANTHROPIC_MODEL is missing', () => {
    const result = loadConfigFromEnv({ ANTHROPIC_API_KEY: 'sk-ant' })
    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining('ANTHROPIC_MODEL'),
    })
  })

  it('parses gemini config', () => {
    const result = loadConfigFromEnv({
      GEMINI_API_KEY: 'gem-key',
      GEMINI_MODEL: 'gemini-2.0-flash',
    })
    expect(result).toEqual({
      ok: true,
      config: {
        llm: { provider: 'gemini', apiKey: 'gem-key', model: 'gemini-2.0-flash' },
        browserUse: false,
        memory: { provider: 'none' },
      },
    })
  })

  it('fails when GEMINI_API_KEY is set but GEMINI_MODEL is missing', () => {
    const result = loadConfigFromEnv({ GEMINI_API_KEY: 'gem-key' })
    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining('GEMINI_MODEL'),
    })
  })

  it('parses openai-compatible config', () => {
    const result = loadConfigFromEnv({
      OPENAI_BASE_URL: 'https://api.openai.com/v1',
      OPENAI_API_KEY: 'sk-x',
      OPENAI_MODEL: 'gpt-4o-mini',
    })
    expect(result).toEqual({
      ok: true,
      config: {
        llm: { provider: 'openai-compatible', baseURL: 'https://api.openai.com/v1', apiKey: 'sk-x', model: 'gpt-4o-mini' },
        browserUse: false,
        memory: { provider: 'none' },
      },
    })
  })

  it('fails when only some OpenAI-compatible vars are set', () => {
    const result = loadConfigFromEnv({ OPENAI_BASE_URL: 'https://api.openai.com/v1', OPENAI_API_KEY: 'sk-x' })
    expect(result).toEqual({ ok: false, error: expect.stringContaining('OPENAI_MODEL') })
  })

  it('enables browser-use when BROWSER_USE=1', () => {
    const result = loadConfigFromEnv({
      ANTHROPIC_API_KEY: 'sk-ant',
      ANTHROPIC_MODEL: 'claude-3-5-sonnet-20241022',
      BROWSER_USE: '1',
    })
    expect(result.ok && result.config.browserUse).toBe(true)
  })

  it('picks supermemory when SUPERMEMORY_API_KEY is set', () => {
    const result = loadConfigFromEnv({
      ANTHROPIC_API_KEY: 'sk-ant',
      ANTHROPIC_MODEL: 'claude-3-5-sonnet-20241022',
      SUPERMEMORY_API_KEY: 'sm-key',
    })
    expect(result.ok && result.config.memory).toEqual({ provider: 'supermemory', apiKey: 'sm-key', baseURL: undefined })
  })

  it('picks mem0 when MEM0_API_KEY is set and supermemory is not', () => {
    const result = loadConfigFromEnv({
      ANTHROPIC_API_KEY: 'sk-ant',
      ANTHROPIC_MODEL: 'claude-3-5-sonnet-20241022',
      MEM0_API_KEY: 'm0-key',
    })
    expect(result.ok && result.config.memory).toEqual({ provider: 'mem0', apiKey: 'm0-key' })
  })

  it('respects optional baseURL overrides', () => {
    const result = loadConfigFromEnv({
      ANTHROPIC_API_KEY: 'sk-ant',
      ANTHROPIC_MODEL: 'claude-3-5-sonnet-20241022',
      ANTHROPIC_BASE_URL: 'https://proxy.example.com/v1',
    })
    expect(result.ok && result.config.llm).toEqual({
      provider: 'anthropic',
      apiKey: 'sk-ant',
      model: 'claude-3-5-sonnet-20241022',
      baseURL: 'https://proxy.example.com/v1',
    })
  })
})
