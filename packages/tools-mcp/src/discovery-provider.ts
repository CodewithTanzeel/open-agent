import { readFile } from 'node:fs/promises'
import type { McpDiscoveryProvider, McpServerConfig } from './discovery.js'

const TRANSPORTS = ['stdio', 'sse'] as const
type Transport = (typeof TRANSPORTS)[number]

function isTransport(value: string): value is Transport {
  return (TRANSPORTS as readonly string[]).includes(value)
}

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

  async discover(configPath: string | URL = 'mcp.json'): Promise<{ servers: McpServerConfig[]; errors: string[] }> {
    const errors: string[] = []
    let raw: RawMcpConfig
    try {
      raw = JSON.parse(await readFile(configPath, 'utf8')) as RawMcpConfig
    } catch (err) {
      return { servers: [], errors: [`Failed to read config: ${err instanceof Error ? err.message : String(err)}`] }
    }

    const servers: McpServerConfig[] = []
    for (const entry of raw.servers ?? []) {
      if (!entry.id) {
        errors.push('Server entry missing required field: id')
        continue
      }
      // Validate rather than cast: an unknown transport otherwise travels as a
      // valid one and fails later, somewhere further from the config that
      // caused it.
      if (entry.transport !== undefined && !isTransport(entry.transport)) {
        errors.push(`Server "${entry.id}": unsupported transport "${entry.transport}"`)
        continue
      }
      servers.push({
        id: entry.id,
        name: entry.name ?? entry.id,
        endpoint: entry.endpoint,
        transport: entry.transport ?? 'stdio',
        command: entry.command,
        env: entry.env,
      })
    }

    return { servers, errors }
  }
}
