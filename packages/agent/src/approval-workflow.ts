export interface ApprovalDecision {
  approved: boolean
  reason?: string
}

export function approveOrDeny(decision: boolean, reason?: string): ApprovalDecision {
  return { approved: decision, reason }
}
