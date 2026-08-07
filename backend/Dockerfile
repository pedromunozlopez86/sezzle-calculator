# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 golang:1.26-alpine AS builder
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/server ./cmd/server

FROM --platform=linux/amd64 alpine:3.20 AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S -G app app

COPY --from=builder /out/server /app/server

EXPOSE 8080
USER app
ENTRYPOINT ["/app/server"]
