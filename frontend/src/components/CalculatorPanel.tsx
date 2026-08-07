import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError, calculate } from '../api/calculatorClient'
import { OperationButtons } from './OperationButtons'
import { PrimaryButton } from './PrimaryButton'
import { ResultDisplay } from './ResultDisplay'
import {
  operationNeedsOperand2,
  operations,
  type CalculateRequest,
  type Operation,
} from '../types/calculator'

type FormState = {
  operation: Operation
  operand1: string
  operand2: string
}

const initialState: FormState = {
  operation: 'add',
  operand1: '',
  operand2: '',
}

function parseRequiredNumber(value: string, fieldName: string): number {
  const normalized = value.trim()
  if (normalized === '') {
    throw new Error(`${fieldName} is required`)
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} must be a valid number`)
  }
  return parsed
}

type FormErrors = {
  operand1?: string
  operand2?: string
}

function getFriendlyApiError(message: string): string {
  if (message.includes('division by zero')) {
    return 'Cannot divide by zero. Please adjust Operand2 and try again.'
  }
  if (message.includes('square root of a negative')) {
    return 'Cannot calculate the square root of a negative number.'
  }
  return message
}

export function CalculatorPanel() {
  const [form, setForm] = useState<FormState>(initialState)
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const needsOperand2 = useMemo(
    () => operationNeedsOperand2(form.operation),
    [form.operation],
  )

  const onChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((previous) => ({ ...previous, [field]: event.target.value }))
      setFormErrors((previous) => ({ ...previous, [field]: undefined }))
    }

  const onOperationSelect = (operation: Operation) => {
    setForm((previous) => ({
      ...previous,
      operation,
      operand2: operation === 'sqrt' ? '' : previous.operand2,
    }))
    setFormErrors((previous) => ({ ...previous, operand2: undefined }))
  }

  const validateBeforeSubmit = (): { valid: true; request: CalculateRequest } | { valid: false } => {
    const nextErrors: FormErrors = {}
    let operand1: number | undefined
    let operand2: number | undefined

    try {
      operand1 = parseRequiredNumber(form.operand1, 'Operand1')
    } catch (caught) {
      if (caught instanceof Error) {
        nextErrors.operand1 = caught.message
      }
    }

    if (needsOperand2) {
      try {
        operand2 = parseRequiredNumber(form.operand2, 'Operand2')
      } catch (caught) {
        if (caught instanceof Error) {
          nextErrors.operand2 = caught.message
        }
      }
    }

    if (Object.keys(nextErrors).length > 0 || operand1 === undefined) {
      setFormErrors(nextErrors)
      return { valid: false }
    }

    const request: CalculateRequest = {
      operation: form.operation,
      operand1,
    }

    if (needsOperand2 && operand2 !== undefined) {
      request.operand2 = operand2
    }

    setFormErrors({})
    return { valid: true, request }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setResult(null)

    const validation = validateBeforeSubmit()
    if (!validation.valid) {
      return
    }

    try {
      setLoading(true)
      const value = await calculate(validation.request)
      setResult(value)
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 400) {
        setError(getFriendlyApiError(caught.message))
      } else if (caught instanceof Error) {
        setError('Unable to complete the operation. Please try again.')
      } else {
        setError('Unexpected error while calculating')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="calculator-shell" aria-label="Sezzle Calculator">
      <header className="calculator-header">
        <p className="eyebrow">Sezzle Calculator</p>
        <h1>Arithmetic Calculator</h1>
        <p className="subtitle">React frontend with isolated API integration to localhost:8080</p>
      </header>

      <form className="calculator-form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Operation</span>
          <OperationButtons
            options={operations}
            selected={form.operation}
            onSelect={onOperationSelect}
            disabled={loading}
          />
        </label>

        <label className="field">
          <span>Operand1</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            placeholder="E.g. 9"
            value={form.operand1}
            onChange={onChange('operand1')}
            required
            aria-invalid={Boolean(formErrors.operand1)}
          />
          {formErrors.operand1 && <small className="field-error">{formErrors.operand1}</small>}
        </label>

        <label className="field" aria-disabled={!needsOperand2}>
          <span>Operand2</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            placeholder={needsOperand2 ? 'E.g. 3' : 'Not required for sqrt'}
            value={form.operand2}
            onChange={onChange('operand2')}
            required={needsOperand2}
            disabled={!needsOperand2}
            aria-invalid={Boolean(formErrors.operand2)}
          />
          {formErrors.operand2 && <small className="field-error">{formErrors.operand2}</small>}
        </label>

        <PrimaryButton loading={loading}>Calculate</PrimaryButton>
      </form>

      <section className="result-panel" aria-live="polite">
        <ResultDisplay result={result} error={error} loading={loading} />
      </section>
    </section>
  )
}
