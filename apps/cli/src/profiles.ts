import type { CliConfig } from './config.js'

export interface AgentProfile {
  llm?: Partial<CliConfig['llm']>
  browser?: Partial<CliConfig['browser']>
  computer?: Partial<CliConfig['computer']>
  shell?: Partial<CliConfig['shell']>
  memory?: Partial<CliConfig['memory']>
  search?: Partial<CliConfig['search']>
}

export function applyProfile(config: CliConfig, profile: AgentProfile): CliConfig {
  return {
    ...config,
    llm: profile.llm ? { ...config.llm, ...profile.llm } : config.llm,
    browser: profile.browser ? { ...config.browser, ...profile.browser } : config.browser,
    computer: profile.computer ? { ...config.computer, ...profile.computer } : config.computer,
    shell: profile.shell ? { ...config.shell, ...profile.shell } : config.shell,
    memory: profile.memory ? { ...config.memory, ...profile.memory } : config.memory,
    search: profile.search ? { ...config.search, ...profile.search } : config.search,
  }
}
