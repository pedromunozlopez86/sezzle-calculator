import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalculatorPanel } from './CalculatorPanel'
import { ApiError, calculate } from '../api/calculatorClient'

vi.mock('../api/calculatorClient', () => ({
  ApiError: class ApiError extends Error {
    readonly status: number

    constructor(message: string, status: number) {
      super(message)
      this.name = 'ApiError'
      this.status = status
    }
  },
  calculate: vi.fn(),
}))

const calculateMock = vi.mocked(calculate)

describe('CalculatorPanel', () => {
  beforeEach(() => {
    calculateMock.mockReset()
  })

  it('renders the calculator main UI correctly', () => {
    render(<CalculatorPanel />)

    expect(screen.getByRole('heading', { name: /arithmetic calculator/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('E.g. 9')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('E.g. 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
    expect(screen.getByText(/enter values and click calculate/i)).toBeInTheDocument()
  })

  it('validates required client inputs and does not call API when data is missing', async () => {
    const user = userEvent.setup()
    render(<CalculatorPanel />)

    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByText('Operand1 is required')).toBeInTheDocument()
    expect(await screen.findByText('Operand2 is required')).toBeInTheDocument()
    expect(calculateMock).not.toHaveBeenCalled()
  })

  it('validates operand2 is not required for sqrt and sends correct request', async () => {
    const user = userEvent.setup()
    calculateMock.mockResolvedValueOnce(4)

    render(<CalculatorPanel />)

    await user.click(screen.getByRole('radio', { name: /sqrt/i }))

    const operand2Input = screen.getByPlaceholderText(/not required for sqrt/i)
    expect(operand2Input).toBeDisabled()

    await user.type(screen.getByPlaceholderText('E.g. 9'), '16')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    await waitFor(() => {
      expect(calculateMock).toHaveBeenCalledWith({ operation: 'sqrt', operand1: 16 })
    })

    expect(await screen.findByText('Result: 4')).toBeInTheDocument()
  })

  it('shows friendly message when API returns division by zero with 400', async () => {
    const user = userEvent.setup()
    calculateMock.mockRejectedValueOnce(new ApiError('division by zero', 400))

    render(<CalculatorPanel />)

    await user.type(screen.getByPlaceholderText('E.g. 9'), '8')
    await user.type(screen.getByPlaceholderText('E.g. 3'), '0')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(
      await screen.findByText('Cannot divide by zero. Please adjust Operand2 and try again.'),
    ).toBeInTheDocument()
  })

  it('shows loading state while waiting for API response', async () => {
    const user = userEvent.setup()

    let resolveRequest: ((value: number) => void) | undefined
    const pendingRequest = new Promise<number>((resolve) => {
      resolveRequest = resolve
    })

    calculateMock.mockReturnValueOnce(pendingRequest)

    render(<CalculatorPanel />)

    await user.type(screen.getByPlaceholderText('E.g. 9'), '5')
    await user.type(screen.getByPlaceholderText('E.g. 3'), '2')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
    expect(screen.getByText(/processing calculation/i)).toBeInTheDocument()

    resolveRequest?.(7)

    expect(await screen.findByText('Result: 7')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calculate/i })).toBeEnabled()
  })

  it('shows generic error when API fails with uncontrolled error', async () => {
    const user = userEvent.setup()
    calculateMock.mockRejectedValueOnce(new Error('network down'))

    render(<CalculatorPanel />)

    await user.type(screen.getByPlaceholderText('E.g. 9'), '5')
    await user.type(screen.getByPlaceholderText('E.g. 3'), '2')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(
      await screen.findByText('Unable to complete the operation. Please try again.'),
    ).toBeInTheDocument()
  })
})
