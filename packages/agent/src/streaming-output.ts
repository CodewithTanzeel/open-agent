export interface StreamingOutput {
  text: string
  done: boolean
}

export class TokenStreamer {
  private chunks: StreamingOutput[] = []

  append(chunk: StreamingOutput): void {
    this.chunks.push(chunk)
  }

  getStream(): StreamingOutput[] {
    return [...this.chunks]
  }

  isDone(): boolean {
    return this.chunks.length > 0 && this.chunks[this.chunks.length - 1].done
  }
}
