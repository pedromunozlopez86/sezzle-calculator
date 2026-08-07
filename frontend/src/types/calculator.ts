export type Operation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power'
  | 'sqrt'

export interface CalculateRequest {
  operation: Operation
  operand1: number
  operand2?: number
}

export interface CalculateSuccessResponse {
  result: number
}

export interface CalculateErrorResponse {
  error: string
}

export const operations: Operation[] = [
  'add',
  'subtract',
  'multiply',
  'divide',
  'power',
  'sqrt',
]

export const operationNeedsOperand2 = (operation: Operation): boolean =>
  operation !== 'sqrt'
