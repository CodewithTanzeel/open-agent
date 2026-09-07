import { describe, expect, it } from 'vitest'
import { LeaseManager } from './lease.js'

describe('LeaseManager', () => {
  it('defaults a missing task to agent-held', () => {
    const manager = new LeaseManager()
    expect(manager.get('t1').holder.kind).toBe('agent')
  })

  it('transitions agent -> pending -> human -> agent', () => {
    const manager = new LeaseManager()
    const at = 1000

    const ask = manager.request('t1', 'alice', 'I need to take over', at)
    expect(ask.state.holder.kind).toBe('pending')
    expect(ask.event.type).toBe('lease/asked')

    const claim = manager.claim('t1', 'alice', 'taking over', at + 1)
    expect(claim.state.holder.kind).toBe('human')
    expect(claim.event?.type).toBe('lease/claimed')

    const release = manager.release('t1', 'alice', 'done', at + 2)
    expect(release.state.holder.kind).toBe('agent')
    expect(release.event.type).toBe('lease/released')
  })

  it('does not duplicate claim event when already held by the same holder', () => {
    const manager = new LeaseManager()
    manager.claim('t1', 'alice', 'first', 1)
    const second = manager.claim('t1', 'alice', 'second', 2)
    expect(second.event).toBeUndefined() // no-op, no duplicate event
  })

  it('drops the lease on endTask', () => {
    const manager = new LeaseManager()
    manager.claim('t1', 'alice', 'x', 1)
    manager.endTask('t1')
    expect(manager.get('t1').holder.kind).toBe('agent')
  })
})
