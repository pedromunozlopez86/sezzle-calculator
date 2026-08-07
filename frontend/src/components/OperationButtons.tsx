import type { Operation } from '../types/calculator'

type OperationButtonsProps = {
  options: Operation[]
  selected: Operation
  onSelect: (operation: Operation) => void
  disabled?: boolean
}

const operationLabel: Record<Operation, string> = {
  add: 'Add',
  subtract: 'Subtract',
  multiply: 'Multiply',
  divide: 'Divide',
  power: 'Power',
  sqrt: 'Sqrt',
}

export function OperationButtons({
  options,
  selected,
  onSelect,
  disabled = false,
}: OperationButtonsProps) {
  return (
    <div className="operation-grid" role="radiogroup" aria-label="Operation">
      {options.map((operation) => {
        const active = selected === operation
        return (
          <button
            key={operation}
            type="button"
            role="radio"
            aria-checked={active}
            className={`operation-button ${active ? 'is-active' : ''}`}
            onClick={() => onSelect(operation)}
            disabled={disabled}
          >
            {operationLabel[operation]}
          </button>
        )
      })}
    </div>
  )
}
