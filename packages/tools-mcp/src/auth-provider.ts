import type { McpAuthConfig, McpAuthProvider, McpAuthResult } from './auth.js'

/** Presents a long-lived static token, e.g. a personal access token from the environment. */
export class TokenAuthProvider implements McpAuthProvider {
  readonly name = 'token'

  async authenticate(config: McpAuthConfig): Promise<McpAuthResult> {
    // Without this check a config declaring oauth2 that happens to carry a
    // token would authorize through the wrong path.
    if (config.method !== 'token') {
      return { authorized: false, error: `TokenAuthProvider cannot handle auth method "${config.method}"` }
    }
    if (!config.token) return { authorized: false, error: 'Token missing' }
    return { authorized: true, token: config.token }
  }

  /**
   * Static tokens don't expire on a schedule we know about, so there is
   * nothing to exchange: this re-validates the same token rather than
   * obtaining a new one. An oauth2 provider is where a real refresh lands.
   */
  async refresh(config: McpAuthConfig): Promise<McpAuthResult> {
    return this.authenticate(config)
  }
}
