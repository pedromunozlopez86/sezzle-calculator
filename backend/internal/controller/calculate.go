package controller

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"backend/internal/service"
)

type CalculatorController struct {
	calculator *service.CalculatorService
}

type calculateRequest struct {
	Operation string   `json:"operation"`
	Operand1  float64  `json:"operand1"`
	Operand2  *float64 `json:"operand2,omitempty"`
}

type calculateResponse struct {
	Result float64 `json:"result"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func NewCalculatorController(calculator *service.CalculatorService) *CalculatorController {
	return &CalculatorController{calculator: calculator}
}

func (c *CalculatorController) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/calculate", c.Calculate)
}

func (c *CalculatorController) Calculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	if contentType := r.Header.Get("Content-Type"); contentType != "" {
		mediaType := strings.ToLower(strings.TrimSpace(strings.Split(contentType, ";")[0]))
		if mediaType != "application/json" {
			writeJSONError(w, http.StatusUnsupportedMediaType, "content type must be application/json")
			return
		}
	}

	var req calculateRequest
	if err := decodeStrictJSON(r.Body, &req); err != nil {
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	result, err := c.calculator.Calculate(req.Operation, req.Operand1, req.Operand2)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidOperation):
			writeJSONError(w, http.StatusBadRequest, "operation must be one of: add, subtract, multiply, divide, power, sqrt")
		case errors.Is(err, service.ErrDivisionByZero), errors.Is(err, service.ErrNegativeSqrt):
			writeJSONError(w, http.StatusBadRequest, err.Error())
		default:
			writeJSONError(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	writeJSON(w, http.StatusOK, calculateResponse{Result: result})
}

func decodeStrictJSON(body io.ReadCloser, dst any) error {
	defer body.Close()

	decoder := json.NewDecoder(body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		if errors.Is(err, io.EOF) {
			return errors.New("request body is required")
		}
		return errors.New("invalid JSON payload: " + err.Error())
	}

	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return errors.New("request body must contain a single JSON object")
	}

	req, ok := dst.(*calculateRequest)
	if !ok {
		return errors.New("internal decode error")
	}

	if strings.TrimSpace(req.Operation) == "" {
		return errors.New("operation is required")
	}

	switch req.Operation {
	case "add", "subtract", "multiply", "divide", "power":
		if req.Operand2 == nil {
			return errors.New("operand2 is required for operation " + req.Operation)
		}
	case "sqrt":
		if req.Operand2 != nil {
			return errors.New("operand2 must not be provided for operation sqrt")
		}
	default:
		return errors.New("operation must be one of: add, subtract, multiply, divide, power, sqrt")
	}

	return nil
}

func writeJSON(w http.ResponseWriter, statusCode int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeJSONError(w http.ResponseWriter, statusCode int, message string) {
	writeJSON(w, statusCode, errorResponse{Error: message})
}
