export interface CliOutput {
  stdout: string
  stderr: string
  exitCode: number
}

export function formatOutput(o: CliOutput): string {
  return `[exit=${o.exitCode}] out=${o.stdout.slice(0, 80)} err=${o.stderr.slice(0, 80)}`
}
