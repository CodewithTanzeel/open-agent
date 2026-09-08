import { describe, expect, it } from 'vitest'
import { TokenAuthProvider } from './auth-provider.js'

describe('TokenAuthProvider', () => {
  it('authorizes and passes the token through', async () => {
    const result = await new TokenAuthProvider().authenticate({
      serverId: 'search',
      method: 'token',
      token: 'tok-abc',
    })
    expect(result).toEqual({ authorized: true, token: 'tok-abc' })
  })

  it('refuses a config with no token', async () => {
    const result = await new TokenAuthProvider().authenticate({ serverId: 'search', method: 'token' })
    expect(result).toEqual({ authorized: false, error: 'Token missing' })
  })

  it('refuses an oauth2 config even when a token happens to be present', async () => {
    const result = await new TokenAuthProvider().authenticate({
      serverId: 'search',
      method: 'oauth2',
      token: 'tok-abc',
    })
    expect(result.authorized).toBe(false)
    expect(result.token).toBeUndefined()
  })

  it('refresh() re-validates the same static token', async () => {
    const config = { serverId: 'search', method: 'token' as const, token: 'tok-abc' }
    expect(await new TokenAuthProvider().refresh(config)).toEqual({ authorized: true, token: 'tok-abc' })
  })
})
