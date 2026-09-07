export interface McpServerConfig {
  id: string
  name: string
  endpoint: string
  transport: 'stdio' | 'sse'
  command?: string[]
  env?: Record<string, string>
}

export interface McpDiscoveryProvider {
  name: string
  discover(configPath?: string): Promise<{ servers: McpServerConfig[]; errors: string[] }>
}
