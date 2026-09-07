/** Milestone 7 — #75: Static tool marketplace registry (dual output: .ts + .json) */
export interface RegistryEntry {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  mcpEndpoint: string
  version: string
  author: string
}
export const registry: RegistryEntry[] = [
  {
    id: 'mcp-web-search',
    name: 'web-search',
    description: 'Search the web for results matching the query.',
    category: 'search',
    tags: ['mcp', 'search', 'external'],
    mcpEndpoint: 'mcp://search-server',
    version: '1.0.0',
    author: '@open-agent/search',
  },
  {
    id: 'mcp-terminal',
    name: 'terminal',
    description: 'Run terminal commands and return their output.',
    category: 'system',
    tags: ['mcp', 'system', 'terminal'],
    mcpEndpoint: 'mcp://terminal-server',
    version: '1.0.0',
    author: '@open-agent/terminal',
  },
]
