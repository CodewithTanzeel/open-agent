export function sanitizePrompt(input: string): string {
  const dangerous = /(ignore previous instructions|system prompt|bypass security|execute code without approval)/gi
  return input.replace(dangerous, '[REDACTED]')
}

export function checkPromptInjection(input: string): { ok: boolean; reason?: string } {
  if (/(ignore previous|system:|bypass)/i.test(input)) {
    return { ok: false, reason: 'Potential prompt injection detected' }
  }
  return { ok: true }
}
