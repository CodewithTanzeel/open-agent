export interface McpAuthConfig {
  serverId: string
  method: 'token' | 'oauth2'
  token?: string
  oauth2?: {
    clientId: string
    clientSecret: string
    tokenEndpoint: string
  }
}

export interface McpAuthProvider {
  name: string
  authenticate(config: McpAuthConfig): Promise<{ authorized: boolean; token?: string; error?: string }>
  refresh?(config: McpAuthConfig): Promise<{ authorized: boolean; token?: string }>
}
