# DevOps Architecture - Multicine

## 1. Objetive

The DevOps lab aims to implement a Dockerized environment
for the Multicine backend application developed with
NestJS, allowing for the separation of application components,
data persistence, and, subsequently, the services associated
with the continuous integration and deployment process.

The architecture uses Docker and Docker Compose to provide
and manage the various services required by the solution.

## 2. Initial Architecture

The initial architecture consists of two main services:

- Backend application developed with NestJS.
- PostgreSQL database.

Both services run in separate containers and
communicate via a Docker bridge network named
`cine-network`.

Data persistence in PostgreSQL is achieved through
a Docker volume that is independent of the container’s lifecycle.

### Architecture v1

HOST / DOCKER

                           │
                    cine-network
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌────────────────┐       ┌────────────────┐
      │      app       │       │       db       │
      │                │       │                │
      │     NestJS     │──────▶│   PostgreSQL   │
      │    Node 20     │       │       15       │
      │                │       │                │
      │     :3000      │       │     :5432      │
      └────────────────┘       └───────┬────────┘
                                       │
                                       ▼
                               postgres_data


### Environment Variable Management

The application uses `@nestjs/config` via `ConfigModule` to
manage its configuration through environment variables.

During the initial environment validation, it was determined that the
`@nestjs/observe` module requires the variables `OBSERVE_APP_KEY` and
`OBSERVE_APP_SECRET`.

Since these were not defined, the application uses the
default values `YOUR_APP_KEY` and `YOUR_APP_SECRET`, causing an
HTTP 401 response from the telemetry service.

## Initial Validation of the Docker Environment

The initial infrastructure setup was performed using
Docker Compose, verifying the creation and execution of the containers
corresponding to the NestJS and PostgreSQL applications.

During the first run, an HTTP 401 error was identified, generated
by the `@nestjs/observe` observability module. The module was attempting
to authenticate using default values due to the absence of
the `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` variables.

The configuration was modified so that the observability service is
optional and is only initialized when both credentials are
available.

After making the adjustment and rebuilding the Docker environment, the
application started correctly without the telemetry authentication
error.

## Git Hooks and Local Validations

Git hooks were implemented using Husky to run
automatic validations before committing changes to the repository.

### Pre-commit Hook

The `.husky/pre-commit` hook was configured to perform the following:

- Code analysis using lint.
- Running automated tests.

The hook executes:

```bash
npm run lint
npm run test