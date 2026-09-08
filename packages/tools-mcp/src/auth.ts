export interface McpAuthConfig {
  serverId: string
  method: 'token' | 'oauth2'
  token?: string
  /**
   * Configuration for the oauth2 method. No provider implements it yet —
   * see #72; `TokenAuthProvider` rejects a config that asks for it rather
   * than quietly falling back to the token path.
   */
  oauth2?: {
    clientId: string
    clientSecret: string
    tokenEndpoint: string
  }
}

export interface McpAuthResult {
  authorized: boolean
  /**
   * The bearer token to present to the server. Treat as a secret: it must not
   * reach the session log or an error string when this is wired into spawn.
   */
  token?: string
  error?: string
}

export interface McpAuthProvider {
  /** The `McpAuthConfig.method` this provider handles. */
  name: string
  authenticate(config: McpAuthConfig): Promise<McpAuthResult>
  refresh?(config: McpAuthConfig): Promise<McpAuthResult>
}
