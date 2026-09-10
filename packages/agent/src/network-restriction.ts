export interface NetworkPolicy {
  allowedHosts: string[]
  blockedHosts: string[]
  allowPrivate: boolean
}

export const DEFAULT_NETWORK_POLICY: NetworkPolicy = {
  allowedHosts: ['api.openai.com', 'api.anthropic.com'],
  blockedHosts: [],
  allowPrivate: false,
}

export function isAllowed(url: string, policy: NetworkPolicy): boolean {
  try {
    const host = new URL(url).hostname
    if (policy.blockedHosts.includes(host)) return false
    if (!policy.allowPrivate && host.match(/^(localhost|127\.0\.0\.1|::1)$/)) return false
    if (policy.allowedHosts.length === 0) return true
    return policy.allowedHosts.some((h) => host === h || host.endsWith('.' + h))
  } catch {
    return false
  }
}
