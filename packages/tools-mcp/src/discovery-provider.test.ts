import { describe, expect, it } from 'vitest'
import { ConfigDiscoveryProvider } from './discovery-provider.js'

// Resolved from this file, not process.cwd(), so the suite passes wherever
// vitest is rooted.
const fixture = new URL('../test-fixtures/mcp-config.json', import.meta.url)

describe('ConfigDiscoveryProvider', () => {
  it('discovers servers from mcp.json', async () => {
    const { servers, errors } = await new ConfigDiscoveryProvider().discover(fixture)
    expect(errors).toEqual([])
    expect(servers).toHaveLength(2)
    expect(servers[0]).toEqual({
      id: 'search-server',
      name: 'Web Search',
      endpoint: undefined,
      transport: 'stdio',
      command: ['node', 'mcp-search-server.js'],
      env: undefined,
    })
  })

  it('defaults name to id and transport to stdio', async () => {
    const { servers } = await new ConfigDiscoveryProvider().discover(
      new URL('../test-fixtures/mcp-config-minimal.json', import.meta.url),
    )
    expect(servers[0].name).toBe('bare-server')
    expect(servers[0].transport).toBe('stdio')
  })

  it('skips an entry with no id and reports why', async () => {
    const { servers, errors } = await new ConfigDiscoveryProvider().discover(
      new URL('../test-fixtures/mcp-config-invalid.json', import.meta.url),
    )
    expect(servers.map((s) => s.id)).toEqual(['good-server'])
    expect(errors).toEqual([
      'Server entry missing required field: id',
      'Server "bad-transport": unsupported transport "carrier-pigeon"',
    ])
  })

  it('reports an unreadable file instead of throwing', async () => {
    const { servers, errors } = await new ConfigDiscoveryProvider().discover(
      new URL('../test-fixtures/does-not-exist.json', import.meta.url),
    )
    expect(servers).toEqual([])
    expect(errors[0]).toMatch(/Failed to read config/)
  })
})
