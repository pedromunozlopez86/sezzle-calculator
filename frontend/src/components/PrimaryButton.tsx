import type { ReactNode } from 'react'

type PrimaryButtonProps = {
  children: ReactNode
  disabled?: boolean
  loading?: boolean
}

export function PrimaryButton({
  children,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  return (
    <button type="submit" className="primary-button" disabled={disabled || loading}>
      {loading ? 'Calculating...' : children}
    </button>
  )
}
