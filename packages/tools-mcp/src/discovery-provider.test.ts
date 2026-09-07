import { describe, expect, it } from 'vitest'
import { ConfigDiscoveryProvider } from './discovery-provider.js'

describe('ConfigDiscoveryProvider', () => {
  it('discovers servers from mcp.json', async () => {
    const provider = new ConfigDiscoveryProvider()
    const result = await provider.discover('packages/tools-mcp/test-fixtures/mcp-config.json')
    expect(result.servers.length).toBeGreaterThanOrEqual(1)
    expect(result.errors).toHaveLength(0)
  })
})
