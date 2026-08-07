# Sezzle Calculator

Full-stack project with:
- Go REST backend
- React + Vite + TypeScript frontend
- Multi-stage Docker containerization

## 1. Project Structure

- backend: Go REST microservice
- frontend: React/Vite web application
- docker-compose.yml: orchestrates both services

## 2. Prerequisites

### Without Docker
- Go 1.22+
- Node.js 20+ (Node 24 recommended)
- npm 10+

### With Docker
- Docker Desktop or Docker Engine + Docker Compose

## 3. Local Run Without Docker (Step by Step)

### Step 1: Start the backend

```bash
cd backend
go run ./cmd/server
```

Backend URL:
- http://localhost:8080

### Step 2: Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:
- http://localhost:5173

Notes:
- The frontend uses /api as default base URL.
- In development mode, Vite proxies /api to http://localhost:8080.

## 4. Run with Docker (Step by Step)

From the project root:

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend direct access: http://localhost:8080

Network details:
- Frontend Nginx proxies /api to backend:8080 inside the Docker Compose network.

To stop:

```bash
docker compose down
```

## 5. REST API

### Endpoint
- POST /calculate

### Request JSON
- operation: add | subtract | multiply | divide | power | sqrt
- operand1: number (float64)
- operand2: number (float64, optional; required for all operations except sqrt)

### Request/Response Examples

| Case | Request JSON | Status | Response JSON |
|---|---|---:|---|
| Addition | {"operation":"add","operand1":2,"operand2":3} | 200 | {"result":5} |
| Subtraction | {"operation":"subtract","operand1":10,"operand2":4} | 200 | {"result":6} |
| Multiplication | {"operation":"multiply","operand1":2.5,"operand2":4} | 200 | {"result":10} |
| Division | {"operation":"divide","operand1":9,"operand2":3} | 200 | {"result":3} |
| Power | {"operation":"power","operand1":2,"operand2":8} | 200 | {"result":256} |
| Square root | {"operation":"sqrt","operand1":81} | 200 | {"result":9} |
| Division by zero | {"operation":"divide","operand1":10,"operand2":0} | 400 | {"error":"division by zero"} |
| Unsupported operation | {"operation":"mod","operand1":10,"operand2":3} | 400 | {"error":"operation must be one of: add, subtract, multiply, divide, power, sqrt"} |
| Missing operand2 | {"operation":"add","operand1":10} | 400 | {"error":"operand2 is required for operation add"} |
| operand2 not allowed for sqrt | {"operation":"sqrt","operand1":9,"operand2":1} | 400 | {"error":"operand2 must not be provided for operation sqrt"} |

## 6. Unit Tests

### Backend (Go)

```bash
cd backend
go test ./...
```

Service coverage:

```bash
cd backend
go test -coverprofile=coverage.out ./internal/service
go tool cover -func=coverage.out
```

Expected service result:
- 100% coverage for internal/service/calculator.go

### Frontend (Vitest + React Testing Library)

```bash
cd frontend
npm test
```

Frontend coverage:

```bash
cd frontend
npm run test:coverage
```

## 7. Architecture and Stack Decisions

### Backend
- Go + net/http:
  - lightweight, fast, and sufficient for an arithmetic microservice.
- Layered separation:
  - HTTP controller handles transport concerns (parsing, HTTP validation, status codes).
  - Domain service handles pure arithmetic rules and business behavior.
- Strict JSON validation:
  - rejects unknown fields and ambiguous payloads to enforce a strong contract.
- Explicit error handling:
  - domain and validation errors are mapped to HTTP 400 Bad Request.
- Graceful shutdown:
  - controlled shutdown on SIGINT/SIGTERM to avoid abrupt termination.

### Frontend
- React + TypeScript + Vite:
  - fast developer experience, strong typing, and efficient builds.
- Isolated API integration layer:
  - HTTP client is separated from visual components.
- Modular UI:
  - dedicated components for operation buttons, primary action button, and result panel.
- Client-side validation + friendly UX feedback:
  - validates before API call and displays clear user-facing error messages.

### DevOps / Local Deployment
- Multi-stage Docker builds:
  - smaller and safer images.
- Frontend served by Nginx:
  - optimized static serving with reverse proxy to backend.
- Docker Compose:
  - reproducible two-service environment with internal networking.

## 8. Prompts Used to Complete the Challenge

elow are the prompts used with GitHub Copilot (@workspace agent mode) to generate the full-stack calculator solution, prioritizing maintainable code, testable architecture, and deployment compatibility.

### Phase 1: Go Backend (Microservice)
**Prompt 1: Scaffolding and Architecture**
@workspace Act as an expert Go Software Engineer. Create the base structure for a REST microservice in the `/backend` directory. Implement a standard HTTP server with a `/calculate` endpoint. The endpoint should receive a JSON with `operation` (add, subtract, multiply, divide), `operand1`, and `operand2` (float64). Implement strict separation of concerns following Domain-Driven Design principles: a controller for the HTTP layer, and an isolated domain service for the arithmetic logic. Ensure to include strict schema validation, explicit error handling, and graceful shutdown.

**Prompt 2: Edge Cases and Unit Testing**
@workspace Based on the arithmetic logic in the backend, generate comprehensive unit tests in Go using the `testing` package. I need 100% coverage in the domain service. Explicitly test edge cases like division by zero, missing operands, and unsupported operations. The system must return a clear error that translates into an HTTP 400 Bad Request.

### Phase 2: React Frontend (Vite + TS)
**Prompt 3: Scaffolding and API Connection**
@workspace Create the frontend application in the `/frontend` directory using Vite, React, and TypeScript. Configure an HTTP client service to communicate with the backend. Ensure the API integration layer (services) is isolated from the React visual components layer. Keep dependencies to a minimum to optimize memory usage in the development environment.

**Prompt 4: User Interface and Error Handling**
@workspace Implement the calculator UI. The design must be responsive, intuitive, and handle loading states. Add input validation on numeric fields before sending the request to the backend. If the backend returns an error (e.g., division by zero), catch the exception and display a clear, user-friendly notification. Use a modular design.

**Prompt 5: Frontend Testing**
@workspace Generate unit tests for the frontend using Vitest and React Testing Library. Focus on testing that the component renders correctly, that input validations work on the client-side, and that error states are displayed when the API fails (mock the API response).

### Phase 3: Orchestration and Deployment (Cross-platform optimized)
**Prompt 6: Multi-Architecture Dockerization**
@workspace Generate a multi-stage `Dockerfile` for the Go backend, and another multi-stage `Dockerfile` for the frontend (using Nginx to serve static files). Since I develop on Apple Silicon (ARM64), you must force the `--platform=linux/amd64` flag in the base images or ensure they are architecture-agnostic, so the reviewer can run everything on Intel/Windows without issues. Use lightweight `alpine` images to avoid overloading the host RAM. Then, create a `docker-compose.yml` that orchestrates both services and maps ports to localhost.

**Prompt 7: Documentation and README**
@workspace Create a comprehensive `README.md` file in the root of the project. It must include: step-by-step instructions to run locally with Docker Compose (mentioning cross-platform compatibility), a table with JSON request/response examples for the API, commands to run the tests, and a section justifying the architectural design decisions and domain separation.

## 9. Suggested Future Improvements

- Add observability (structured logs, metrics, health checks).
- Version the API (for example /api/v1).
- Add CI pipeline for lint, tests, and build in backend/frontend.
- Harden HTTP security (headers, rate limiting, additional timeouts).
