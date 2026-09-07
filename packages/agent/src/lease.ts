import type { LeaseHolder, LeaseState, SessionEvent } from './types.js'

/**
 * Default reason text the manager applies when a caller does not supply one
 * — kept short so the session log stays scannable.
 */
const DEFAULT_REQUEST_REASON = 'human intervention requested'
const DEFAULT_RELEASE_REASON = 'lease released'

/**
 * Owns the per-task control lease used by humenTakeover (#50). The lease is
 * the single point of truth for "who is driving right now" — the agent loop
 * reads it to decide whether ask-level tools should auto-approve, the
 * `request_takeover` tool writes to it, and the session log records every
 * transition so a post-mortem can see exactly when control moved.
 *
 * The manager never bypasses `ToolRegistry`: it only annotates decisions. A
 * tool call still passes through `decide()` exactly the same way; the
 * registry's approval handler can read the lease and choose to short-circuit
 * the prompt, but it does not have to.
 */
export class LeaseManager {
  private readonly leases = new Map<string, LeaseState>()

  /** Current state for a task — always defined, never throws. */
  get(taskId: string): LeaseState {
    return this.leases.get(taskId) ?? { holder: { kind: 'agent' } }
  }

  /**
   * Request a takeover. Returns the lease state with a `pending` holder; the
   * caller is expected to surface the request to a human channel. The
   * session event is returned so the caller can append it to `SessionLog`.
   */
  request(
    taskId: string,
    requestedBy: string,
    reason: string,
    at: number,
  ): {
    state: LeaseState
    event: SessionEvent
  } {
    const event: SessionEvent = {
      type: 'lease/asked',
      taskId,
      at,
      requestedBy,
      reason: reason || DEFAULT_REQUEST_REASON,
    }
    const state: LeaseState = {
      holder: { kind: 'pending', requestedBy, requestedAt: at, reason: event.reason },
    }
    this.leases.set(taskId, state)
    return { state, event }
  }

  /**
   * Grant the lease to a human. Always succeeds — if the human is the
   * current holder the timestamp refreshes but no new event is logged (a
   * second `claim` while already held is a no-op for the model but a real
   * `lease/released` + `lease/claimed` would be noise).
   */
  claim(
    taskId: string,
    holder: string,
    reason: string,
    at: number,
  ): {
    state: LeaseState
    event?: SessionEvent
  } {
    const current = this.leases.get(taskId)
    if (current && current.holder.kind === 'human' && current.holder.holder === holder) {
      current.holder.since = at
      current.holder.reason = reason || current.holder.reason
      return { state: current }
    }
    const event: SessionEvent = {
      type: 'lease/claimed',
      taskId,
      at,
      holder,
      reason: reason || DEFAULT_REQUEST_REASON,
    }
    const state: LeaseState = { holder: { kind: 'human', holder, since: at, reason: event.reason } }
    this.leases.set(taskId, state)
    return { state, event }
  }

  /**
   * Hand the lease back to the agent. Records a `lease/released` event in
   * every case so the log shows the return even if the holder was already
   * the agent (in which case the state is unchanged but the call is still
   * useful as a "stop watching" signal for any UI listening to events).
   */
  release(
    taskId: string,
    holder: string,
    reason: string,
    at: number,
  ): {
    state: LeaseState
    event: SessionEvent
  } {
    const event: SessionEvent = {
      type: 'lease/released',
      taskId,
      at,
      holder,
      reason: reason || DEFAULT_RELEASE_REASON,
    }
    const state: LeaseState = { holder: { kind: 'agent' } }
    this.leases.set(taskId, state)
    return { state, event }
  }

  /** Drop any lease for a finished task — a stale lease outliving its task is the same bug as a stale grant. */
  endTask(taskId: string): void {
    this.leases.delete(taskId)
  }
}
