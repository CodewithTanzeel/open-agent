export interface McpServerConfig {
  id: string
  name: string
  /** Absent for stdio servers, which are spawned by `command` rather than dialled. */
  endpoint?: string
  transport: 'stdio' | 'sse'
  command?: string[]
  env?: Record<string, string>
}

export interface McpDiscoveryProvider {
  name: string
  discover(configPath?: string | URL): Promise<{ servers: McpServerConfig[]; errors: string[] }>
}
