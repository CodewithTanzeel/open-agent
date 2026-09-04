# @open-agent/providers

`LlmAdapter` implementations for `@open-agent/agent`. Provider config is `{ baseURL, apiKey, model }` — the agent loop never knows or cares which vendor is behind it.

## `OpenAiCompatibleProvider`

Works against anything that speaks the OpenAI chat-completions API shape: OpenAI itself, OpenRouter, Ollama, LM Studio, self-hosted vLLM, etc. Only `baseURL`/`model` change between them.

```ts
import { OpenAiCompatibleProvider } from '@open-agent/providers'

const llm = new OpenAiCompatibleProvider({
  baseURL: 'https://openrouter.ai/api/v1', // or https://api.openai.com/v1, http://localhost:11434/v1, ...
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o-mini',
})
```

## `GeminiProvider`

Dedicated adapter for Google's Gemini GenerateContent API. Maps system instructions to `systemInstruction`, tools to `functionDeclarations`, and resolves tool call IDs to names for function responses.

```ts
import { GeminiProvider } from '@open-agent/providers'

const llm = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.0-flash',
})
```

All providers accept an optional `baseURL` override and `fetchFn` for testing.

## `AnthropicProvider`

Dedicated adapter for Anthropic's Messages API. Maps system instructions to the root `system` field, tools to `tools[].input_schema`, and handles the alternating `user`/`assistant` role requirement with tool results coalesced into single user messages.

```ts
import { AnthropicProvider } from '@open-agent/providers'

const llm = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-3-5-sonnet-20241022',
})
```
