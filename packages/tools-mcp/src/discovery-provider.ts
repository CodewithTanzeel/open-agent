import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { McpDiscoveryProvider, McpServerConfig } from './discovery.js'

interface RawMcpConfig {
  servers?: Array<{
    id?: string
    name?: string
    endpoint?: string
    transport?: string
    command?: string[]
    env?: Record<string, string>
  }>
}

/** Discovers MCP servers from a JSON config file (default: `mcp.json` in cwd). */
export class ConfigDiscoveryProvider implements McpDiscoveryProvider {
  readonly name = 'config'

  async discover(configPath = 'mcp.json'): Promise<{ servers: McpServerConfig[]; errors: string[] }> {
    const errors: string[] = []
    let raw: RawMcpConfig
    try {
      const content = readFileSync(resolve(configPath), 'utf8')
      raw = JSON.parse(content)
    } catch (err) {
      return { servers: [], errors: [`Failed to read config: ${err instanceof Error ? err.message : String(err)}`] }
    }

    const servers: McpServerConfig[] = []
    for (const entry of raw.servers ?? []) {
      if (!entry.id) {
        errors.push('Server entry missing required field: id')
        continue
      }
      servers.push({
        id: entry.id,
        name: entry.name ?? entry.id,
        endpoint: entry.endpoint ?? '',
        transport: (entry.transport as 'stdio' | 'sse') ?? 'stdio',
        command: entry.command,
        env: entry.env,
      })
    }

    return { servers, errors }
  }
}
