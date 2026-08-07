package service

import (
	"errors"
	"math"
)

var (
	ErrInvalidOperation = errors.New("invalid operation")
	ErrDivisionByZero   = errors.New("division by zero")
	ErrNegativeSqrt     = errors.New("cannot calculate square root of a negative number")
)

type CalculatorService struct{}

func NewCalculatorService() *CalculatorService {
	return &CalculatorService{}
}

func (s *CalculatorService) Calculate(operation string, operand1 float64, operand2 *float64) (float64, error) {
	switch operation {
	case "add":
		if operand2 == nil {
			return 0, errors.New("operand2 is required for add")
		}
		return operand1 + *operand2, nil
	case "subtract":
		if operand2 == nil {
			return 0, errors.New("operand2 is required for subtract")
		}
		return operand1 - *operand2, nil
	case "multiply":
		if operand2 == nil {
			return 0, errors.New("operand2 is required for multiply")
		}
		return operand1 * *operand2, nil
	case "divide":
		if operand2 == nil {
			return 0, errors.New("operand2 is required for divide")
		}
		if *operand2 == 0 {
			return 0, ErrDivisionByZero
		}
		return operand1 / *operand2, nil
	case "power":
		if operand2 == nil {
			return 0, errors.New("operand2 is required for power")
		}
		return math.Pow(operand1, *operand2), nil
	case "sqrt":
		if operand2 != nil {
			return 0, errors.New("operand2 is not allowed for sqrt")
		}
		if operand1 < 0 {
			return 0, ErrNegativeSqrt
		}
		return math.Sqrt(operand1), nil
	default:
		return 0, ErrInvalidOperation
	}
}
