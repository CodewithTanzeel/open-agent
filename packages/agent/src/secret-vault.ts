export interface SecretVault {
  get(name: string): string | undefined
  set(name: string, value: string): void
  redact(value: string): string
}

export class InMemorySecretVault implements SecretVault {
  private readonly secrets = new Map<string, string>()

  get(name: string): string | undefined {
    return this.secrets.get(name)
  }

  set(name: string, value: string): void {
    this.secrets.set(name, value)
  }

  redact(value: string): string {
    return value.replace(/[A-Za-z0-9_-]{8,}/g, '***REDACTED***')
  }
}
