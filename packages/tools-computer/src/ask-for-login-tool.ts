import type { ToolDefinition } from '@open-agent/agent'

/**
 * Ask the user to log in on their machine (the same primitive as
 * `request_takeover` in #50, narrowed to a credentials-flow use case). The
 * agent cannot enter the password itself — once the user logs in, the
 * control lease is released back to the agent and the task resumes.
 *
 * Permission: `ask` — same risk class as `request_takeover`; delegating
 * "log into the site" to the user is a control-lease change, not a local
 * side effect.
 */
export function askForLoginTool(): ToolDefinition<{ site?: string; reason?: string }> {
  return {
    name: 'ask_for_login',
    description:
      'Ask the user to log in on their machine (e.g. to an SSO, a service, or a session the agent cannot automate). The control lease is set to "pending" until the user confirms the login is done.',
    schema: {
      type: 'object',
      properties: {
        site: { type: 'string', description: 'The site or service that needs login.' },
        reason: { type: 'string', description: 'Why the login is required.' },
      },
    },
    permissionLevel: 'ask',
    async execute(args) {
      return {
        ok: true,
        content: `Login requested. Site: ${args.site || 'unspecified'}. Reason: ${args.reason || 'not provided'}.`,
      }
    },
  }
}
