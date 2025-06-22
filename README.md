# Mini CRM

A NestJS-based CRM application with Docker configurations for local development, testing, and deployment.

## Features

- MySQL database
- Redis for caching and session management
- WebSockets for real-time communication
- BullMQ for queue management
- Mailhog for email testing
- GraphQL API with playground

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

### PM2 Service

Nginx balancer:
http://localhost:8080/

```bash
docker compose exec pm2 pm2 list
```

### Local Development

- **Application**: http://localhost:3000
- **Swagger API**: http://localhost:3000/docs
- **GraphQL Playground**: http://localhost:3000/graphql
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

## GraphQL API

The application includes a GraphQL API with a playground for testing queries.

### GraphQL Playground

Access the GraphQL playground at:
```
http://localhost:3000/graphql
```

This interactive interface allows you to:
- Explore the GraphQL schema
- Write and execute queries
- View query results
- Access documentation

### Example Query

Try this simple query in the playground:
```graphql
{
  hello
}
```

### Using GraphQL in Your Application

To create new GraphQL types and resolvers:

1. Create a new resolver file (e.g., `users.resolver.ts`)
2. Define your GraphQL types using decorators
3. Implement resolver methods for queries and mutations

## CLI Commands

### Create Admin User

This command allows you to create an admin user in the system.

#### Using npm

```bash
npm run admin:create -- -n "Admin Name" -e "admin@example.com" -p "password"
```

##### Options

- `-n, --name`: The name of the admin user (required)
- `-e, --email`: The email of the admin user (required)
- `-p, --password`: The password of the admin user (required)
