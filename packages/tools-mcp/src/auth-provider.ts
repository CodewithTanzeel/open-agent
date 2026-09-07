import type { McpAuthConfig, McpAuthProvider } from './auth.js'

export class TokenAuthProvider implements McpAuthProvider {
  readonly name = 'token'

  async authenticate(config: McpAuthConfig): Promise<{ authorized: boolean; token?: string; error?: string }> {
    if (!config.token) return { authorized: false, error: 'Token missing' }
    return { authorized: true, token: config.token }
  }

  async refresh(config: McpAuthConfig): Promise<{ authorized: boolean; token?: string }> {
    return this.authenticate(config)
  }
}
