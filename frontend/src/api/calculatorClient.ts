import type {
  CalculateErrorResponse,
  CalculateRequest,
  CalculateSuccessResponse,
} from '../types/calculator'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function calculate(request: CalculateRequest): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const rawBody = await response.text()
  const parsedBody = safeParseJSON(rawBody)

  if (!response.ok) {
    const payload = parsedBody as CalculateErrorResponse | null
    const message = payload?.error ?? `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  const payload = parsedBody as CalculateSuccessResponse | null
  if (!payload || typeof payload.result !== 'number') {
    throw new Error('Invalid response format from API')
  }

  return payload.result
}

function safeParseJSON(value: string): unknown {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
