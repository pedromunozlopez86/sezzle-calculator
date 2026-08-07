package service

import (
	"errors"
	"math"
	"testing"
)

func floatPtr(v float64) *float64 {
	return &v
}

func TestNewCalculatorService(t *testing.T) {
	svc := NewCalculatorService()
	if svc == nil {
		t.Fatal("expected non-nil service")
	}
}

func TestCalculateSuccessCases(t *testing.T) {
	svc := NewCalculatorService()

	testCases := []struct {
		name      string
		op        string
		op1       float64
		op2       *float64
		expected  float64
		tolerance float64
	}{
		{name: "add", op: "add", op1: 1.5, op2: floatPtr(2.5), expected: 4.0, tolerance: 0},
		{name: "subtract", op: "subtract", op1: 10, op2: floatPtr(3), expected: 7, tolerance: 0},
		{name: "multiply", op: "multiply", op1: -2, op2: floatPtr(8), expected: -16, tolerance: 0},
		{name: "divide", op: "divide", op1: 9, op2: floatPtr(2), expected: 4.5, tolerance: 0},
		{name: "power", op: "power", op1: 2, op2: floatPtr(10), expected: 1024, tolerance: 0},
		{name: "sqrt", op: "sqrt", op1: 81, op2: nil, expected: 9, tolerance: 0},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result, err := svc.Calculate(tc.op, tc.op1, tc.op2)
			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if math.Abs(result-tc.expected) > tc.tolerance {
				t.Fatalf("unexpected result: got %v, want %v", result, tc.expected)
			}
		})
	}
}

func TestCalculateMissingOperand2Errors(t *testing.T) {
	svc := NewCalculatorService()

	testCases := []struct {
		name        string
		op          string
		expectedMsg string
	}{
		{name: "add missing operand2", op: "add", expectedMsg: "operand2 is required for add"},
		{name: "subtract missing operand2", op: "subtract", expectedMsg: "operand2 is required for subtract"},
		{name: "multiply missing operand2", op: "multiply", expectedMsg: "operand2 is required for multiply"},
		{name: "divide missing operand2", op: "divide", expectedMsg: "operand2 is required for divide"},
		{name: "power missing operand2", op: "power", expectedMsg: "operand2 is required for power"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result, err := svc.Calculate(tc.op, 10, nil)
			if err == nil {
				t.Fatalf("expected error, got nil and result %v", result)
			}

			if err.Error() != tc.expectedMsg {
				t.Fatalf("unexpected error message: got %q, want %q", err.Error(), tc.expectedMsg)
			}
		})
	}
}

func TestCalculateDivisionByZero(t *testing.T) {
	svc := NewCalculatorService()

	result, err := svc.Calculate("divide", 10, floatPtr(0))
	if err == nil {
		t.Fatalf("expected error, got nil and result %v", result)
	}

	if !errors.Is(err, ErrDivisionByZero) {
		t.Fatalf("expected ErrDivisionByZero, got %v", err)
	}
}

func TestCalculateSqrtWithOperand2(t *testing.T) {
	svc := NewCalculatorService()

	result, err := svc.Calculate("sqrt", 16, floatPtr(2))
	if err == nil {
		t.Fatalf("expected error, got nil and result %v", result)
	}

	if err.Error() != "operand2 is not allowed for sqrt" {
		t.Fatalf("unexpected error message: got %q", err.Error())
	}
}

func TestCalculateNegativeSqrt(t *testing.T) {
	svc := NewCalculatorService()

	result, err := svc.Calculate("sqrt", -1, nil)
	if err == nil {
		t.Fatalf("expected error, got nil and result %v", result)
	}

	if !errors.Is(err, ErrNegativeSqrt) {
		t.Fatalf("expected ErrNegativeSqrt, got %v", err)
	}
}

func TestCalculateUnsupportedOperation(t *testing.T) {
	svc := NewCalculatorService()

	result, err := svc.Calculate("mod", 10, floatPtr(3))
	if err == nil {
		t.Fatalf("expected error, got nil and result %v", result)
	}

	if !errors.Is(err, ErrInvalidOperation) {
		t.Fatalf("expected ErrInvalidOperation, got %v", err)
	}
}
