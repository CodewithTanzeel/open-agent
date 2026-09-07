import type { ToolDefinition } from '@open-agent/agent'

/**
 * Request a control-takeover (the same primitive as ask-for-login in #50).
 * The agent does not grant the lease itself — it annotates the request and
 * returns the `pending` lease; the approval handler in the agent loop can
 * read the pending state and surface it to the user, or auto-approve.
 *
 * Permission: `ask` — asking for control is an open-ended delegation,
 * exactly the same risk class as `computer_use_task`.
 */
export function requestTakeoverTool(): ToolDefinition<{ reason?: string }> {
  return {
    name: 'request_takeover',
    description:
      'Request to take over control of the current session. This sets the control lease to "pending" and surfaces a request to the user; once the user responds, the agent can either reclaim control (release) or keep the human in charge (claimed).',
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Why the agent needs control.' },
      },
    },
    permissionLevel: 'ask',
    async execute(args) {
      return {
        ok: true,
        content: `Takeover requested. Reason: ${args.reason || 'no reason provided'}. Human must respond before the agent continues.`,
      }
    },
  }
}
