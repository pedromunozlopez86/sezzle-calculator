type ResultDisplayProps = {
  result: number | null
  error: string | null
  loading: boolean
}

export function ResultDisplay({ result, error, loading }: ResultDisplayProps) {
  if (loading) {
    return <p className="result-info">Processing calculation...</p>
  }

  if (error) {
    return <p className="result-error">{error}</p>
  }

  if (result !== null) {
    return <p className="result-ok">Result: {result}</p>
  }

  return <p className="result-empty">Enter values and click calculate to see the result.</p>
}
