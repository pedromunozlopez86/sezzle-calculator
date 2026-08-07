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

Below is a summary of the main prompts used during implementation:

1. Create base Go backend
- "Act as an expert Go Software Engineer. Create the base structure for a REST microservice in /backend... endpoint /calculate... strict schema validation... controller and domain service separation... graceful shutdown."

2. Verify Go installation
- "I already installed Go, check it."

3. Backend unit tests
- "Based on the arithmetic logic you created, generate exhaustive Go unit tests... 100% coverage in the domain service..."

4. Create frontend
- "Create the frontend app in /frontend using Vite, React, and TypeScript... isolate API integration from React visual components..."

5. Implement modular UI and validations
- "Implement calculator UI... responsive, intuitive, loading states, client-side input validation, backend error handling... modular layout for buttons and result display..."

6. Frontend unit tests
- "Generate frontend unit tests with Vitest and React Testing Library... cover rendering, client validation, and API error states with mocks..."

7. Containerization
- "Generate multi-stage Dockerfiles for backend and frontend (Nginx), and docker-compose.yml to run both services..."

8. Cross-architecture Docker compatibility
- "Add --platform=linux/amd64 to base images and ensure alpine-based images for minimal footprint..."

## 9. Suggested Future Improvements

- Add observability (structured logs, metrics, health checks).
- Version the API (for example /api/v1).
- Add CI pipeline for lint, tests, and build in backend/frontend.
- Harden HTTP security (headers, rate limiting, additional timeouts).
