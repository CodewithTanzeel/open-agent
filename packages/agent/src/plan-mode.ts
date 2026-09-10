export interface PlanStep {
  stepNumber: number
  description: string
  completed: boolean
}

export interface PlanModeState {
  steps: PlanStep[]
  activeStep: number
}

export class PlanMode {
  private state: PlanModeState = { steps: [], activeStep: 0 }

  setSteps(steps: PlanStep[]): void {
    this.state.steps = steps
  }

  next(): PlanStep | undefined {
    const step = this.state.steps.find((s) => s.stepNumber === this.state.activeStep)
    if (step) step.completed = true
    this.state.activeStep++
    return this.state.steps.find((s) => s.stepNumber === this.state.activeStep)
  }
}
