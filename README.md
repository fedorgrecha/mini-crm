# Mini CRM

A NestJS-based CRM application with Docker configurations for local development, testing, and deployment.

## Features

- MySQL database
- Redis for caching and session management
- WebSockets for real-time communication
- BullMQ for queue management
- Mailhog for email testing

## Docker Setup

The project includes several Docker configurations for different environments:

### Local Development

1. Copy the example environment file:
   ```
   cp .env.example .env
   ```

2. Start the local development environment:
   ```
   docker compose up -d
   ```

3. Visit http://localhost:3000/docs to see Swagger API documentation

4. Additional services:
   - MySQL: localhost:3306
   - Redis: localhost:6379
   - Redis Commander: http://localhost:8081
   - Mailhog: http://localhost:8025

### Running Tests

1. Copy the test environment file:
   ```
   cp .env.test .env.test.local  
   ```
   Optional: create a local override

2. Start the test environment:
   ```
   docker compose -f docker-compose.test.yml up
   ```

### Development Environment Deployment

1. Copy the development environment file:
   ```
   cp .env.dev .env  # Use .env for development deployment
   ```

2. Build and start the development environment:
   ```
   docker compose -f docker-compose.dev.yml up -d
   ```

## Service Access

### Local Development

- **Application**: http://localhost:3000
- **Swagger API**: http://localhost:3000/docs
- **WebSockets**: ws://localhost:3001
- **MySQL**: localhost:3306
- **Redis**: localhost:6379
- **Redis Commander**: http://localhost:8081
- **Mailhog UI**: http://localhost:8025
- **Mailhog SMTP**: localhost:1025

### Test Environment

- **MySQL Test**: localhost:3307
- **Redis Test**: localhost:6380

## Custom Configuration

You can create a `docker-compose.override.yml` file for local customizations (this file is ignored by git).
