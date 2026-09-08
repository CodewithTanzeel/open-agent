import { describe, expect, it, vi } from 'vitest'
import { SupermemoryProvider } from './supermemory-provider.js'
import type { SupermemoryClientLike } from './supermemory-provider.js'

function fakeClient(overrides: Partial<SupermemoryClientLike> = {}): SupermemoryClientLike {
  return {
    add: vi.fn().mockResolvedValue({ id: 'mem-1', status: 'done' }),
    profile: vi
      .fn()
      .mockResolvedValue({ profile: { static: ['Loves TypeScript'], dynamic: ['Working on OpenAgent'] } }),
    search: vi.fn().mockResolvedValue({
      results: [{ id: 'mem-1', memory: 'User loves TypeScript', similarity: 0.92, metadata: null }],
    }),
    memories: { forget: vi.fn().mockResolvedValue({ id: 'mem-1', forgotten: true }) },
    ...overrides,
  }
}

describe('SupermemoryProvider', () => {
  it('remember() forwards content and containerTag to client.add', async () => {
    const client = fakeClient()
    const provider = new SupermemoryProvider(client)
    const { id } = await provider.remember({ content: 'loves TS', containerTag: 'user_123' })
    expect(id).toBe('mem-1')
    expect(client.add).toHaveBeenCalledWith({ content: 'loves TS', containerTag: 'user_123', metadata: undefined })
  })

  it('recall() maps search results into MemorySearchResult, defaulting to hybrid mode', async () => {
    const client = fakeClient()
    const provider = new SupermemoryProvider(client)
    const results = await provider.recall({ q: 'programming style', containerTag: 'user_123' })
    expect(client.search).toHaveBeenCalledWith({
      q: 'programming style',
      containerTag: 'user_123',
      searchMode: 'hybrid',
      limit: undefined,
    })
    expect(results).toEqual([{ id: 'mem-1', content: 'User loves TypeScript', score: 0.92, metadata: null }])
  })

  it('profile() returns static/dynamic facts', async () => {
    const provider = new SupermemoryProvider(fakeClient())
    const profile = await provider.profile('user_123', 'programming style')
    expect(profile).toEqual({ static: ['Loves TypeScript'], dynamic: ['Working on OpenAgent'] })
  })

  it('forget() delegates to client.memories.forget', async () => {
    const client = fakeClient()
    const provider = new SupermemoryProvider(client)
    const result = await provider.forget({ containerTag: 'user_123', id: 'mem-1', reason: 'user requested deletion' })
    expect(result).toEqual({ forgotten: true })
    expect(client.memories.forget).toHaveBeenCalledWith({
      containerTag: 'user_123',
      id: 'mem-1',
      content: undefined,
      reason: 'user requested deletion',
    })
  })
  it('update() forwards the edit to client.memories.update', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'mem-1', updated: true })
    const client = fakeClient({ memories: { forget: vi.fn(), update } })
    const provider = new SupermemoryProvider(client)
    const result = await provider.update({ id: 'mem-1', containerTag: 'user_123', content: 'loves Rust now' })
    expect(result).toEqual({ updated: true })
    expect(update).toHaveBeenCalledWith({
      id: 'mem-1',
      containerTag: 'user_123',
      content: 'loves Rust now',
      metadata: undefined,
    })
  })

  it('update() reports false when the client has no update method', async () => {
    // Older Supermemory clients predate the update endpoint.
    const provider = new SupermemoryProvider(fakeClient())
    expect(await provider.update({ id: 'mem-1', containerTag: 'user_123', content: 'x' })).toEqual({ updated: false })
  })

  it('update() reports false when the client throws', async () => {
    const update = vi.fn().mockRejectedValue(new Error('network down'))
    const client = fakeClient({ memories: { forget: vi.fn(), update } })
    const provider = new SupermemoryProvider(client)
    expect(await provider.update({ id: 'mem-1', containerTag: 'user_123', content: 'x' })).toEqual({ updated: false })
  })
})
