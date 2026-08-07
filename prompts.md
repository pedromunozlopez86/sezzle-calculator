# Prompts Used - Sezzle Technical Challenge

Below are the prompts used with GitHub Copilot (@workspace agent mode) to generate the full-stack calculator solution, prioritizing maintainable code, testable architecture, and deployment compatibility.

## Phase 1: Go Backend (Microservice)
**Prompt 1: Scaffolding and Architecture**
@workspace Act as an expert Go Software Engineer. Create the base structure for a REST microservice in the `/backend` directory. Implement a standard HTTP server with a `/calculate` endpoint. The endpoint should receive a JSON with `operation` (add, subtract, multiply, divide), `operand1`, and `operand2` (float64). Implement strict separation of concerns following Domain-Driven Design principles: a controller for the HTTP layer, and an isolated domain service for the arithmetic logic. Ensure to include strict schema validation, explicit error handling, and graceful shutdown.

**Prompt 2: Edge Cases and Unit Testing**
@workspace Based on the arithmetic logic in the backend, generate comprehensive unit tests in Go using the `testing` package. I need 100% coverage in the domain service. Explicitly test edge cases like division by zero, missing operands, and unsupported operations. The system must return a clear error that translates into an HTTP 400 Bad Request.

## Phase 2: React Frontend (Vite + TS)
**Prompt 3: Scaffolding and API Connection**
@workspace Create the frontend application in the `/frontend` directory using Vite, React, and TypeScript. Configure an HTTP client service to communicate with the backend. Ensure the API integration layer (services) is isolated from the React visual components layer. Keep dependencies to a minimum to optimize memory usage in the development environment.

**Prompt 4: User Interface and Error Handling**
@workspace Implement the calculator UI. The design must be responsive, intuitive, and handle loading states. Add input validation on numeric fields before sending the request to the backend. If the backend returns an error (e.g., division by zero), catch the exception and display a clear, user-friendly notification. Use a modular design.

**Prompt 5: Frontend Testing**
@workspace Generate unit tests for the frontend using Vitest and React Testing Library. Focus on testing that the component renders correctly, that input validations work on the client-side, and that error states are displayed when the API fails (mock the API response).

## Phase 3: Orchestration and Deployment (Cross-platform optimized)
**Prompt 6: Multi-Architecture Dockerization**
@workspace Generate a multi-stage `Dockerfile` for the Go backend, and another multi-stage `Dockerfile` for the frontend (using Nginx to serve static files). Since I develop on Apple Silicon (ARM64), you must force the `--platform=linux/amd64` flag in the base images or ensure they are architecture-agnostic, so the reviewer can run everything on Intel/Windows without issues. Use lightweight `alpine` images to avoid overloading the host RAM. Then, create a `docker-compose.yml` that orchestrates both services and maps ports to localhost.

**Prompt 7: Documentation and README**
@workspace Create a comprehensive `README.md` file in the root of the project. It must include: step-by-step instructions to run locally with Docker Compose (mentioning cross-platform compatibility), a table with JSON request/response examples for the API, commands to run the tests, and a section justifying the architectural design decisions and domain separation.
