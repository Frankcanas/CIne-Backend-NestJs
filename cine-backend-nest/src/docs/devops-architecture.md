# DevOps Architecture - Multicine (NestJS Backend)

## 1. Objective

Build a DevOps lab for the Multicine backend (NestJS) that covers the complete software delivery cycle: version control, local validations, code quality analysis, continuous integration, and deployment.

The reference project proposes building the lab on **Proxmox** with three virtual machines. In this project the lab is **simulated with Docker and Docker Compose**: each container fulfills the responsibility that a VM would have in the original design, and all of them communicate through an internal network.

## 2. Proxmox to Docker Mapping

| Original design (Proxmox) | This lab (Docker) | Responsibility |
|---|---|---|
| VM01 Jenkins | `jenkins` container | Automate the CI/CD pipeline |
| VM02 SonarQube | `sonarqube` container | Static analysis and code quality |
| VM03 Application Server | `app` container | Run the NestJS API |
| (application dependency) | `db` container | PostgreSQL database |
| External Git | GitHub | Remote repository, branches, and Pull Requests |

## 3. Architecture

```
   Developer (Node / NestJS)
              │
              │ git push
              ▼
     GitHub (remote repository)
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│ HOST / DOCKER              network: cine-network (bridge)│
│                                                         │
│   ┌──────────────┐  analysis   ┌──────────────────┐     │
│   │   Jenkins    │────────────▶│    SonarQube     │     │
│   │   CI/CD      │             │  Code Quality    │     │
│   │   :8080      │             │  :9000           │     │
│   └──────┬───────┘             └──────────────────┘     │
│          │ build / test / deploy                        │
│          ▼                                              │
│   ┌──────────────┐             ┌──────────────────┐     │
│   │     app      │────────────▶│       db         │     │
│   │  NestJS      │             │  PostgreSQL 15   │     │
│   │  Node 20     │             │  :5432           │     │
│   │  :3000       │             └────────┬─────────┘     │
│   └──────────────┘                      │               │
│                                         ▼               │
│                                   postgres_data         │
└─────────────────────────────────────────────────────────┘
```

## 4. Components

| Service | Container | Image | Port | Volume |
|---|---|---|---|---|
| `app` | `cine-backend-nest` | Built from the project `Dockerfile` (Node 20 Alpine) | 3000 | Source code (development only) |
| `db` | `cine-postgres-db` | `postgres:15-alpine` | 5432 | `cine_postgres_data` |
| `sonarqube` | `cine-sonarqube` | `sonarqube:lts-community` | 9000 | `cine_sonarqube_data`, `cine_sonarqube_extensions`, `cine_sonarqube_logs` |
| `jenkins` | `cine-jenkins` | `jenkins/jenkins:lts-jdk17` | 8080 (UI), 50000 (agents) | `cine_jenkins_home` |

The container names of `app` and `db` can be changed with the `APP_CONTAINER_NAME` and `DB_CONTAINER_NAME` variables in the `.env` file.

### Responsibility of Each Component

- **GitHub:** version control, branches, Pull Requests, and change history.
- **Jenkins:** detect changes, fetch the code, install dependencies, run lint and tests, trigger the SonarQube analysis, build, and deploy.
- **SonarQube:** analyze bugs, vulnerabilities, code smells, duplication, and coverage, and evaluate the Quality Gate.
- **app (Application Server):** run only the NestJS application. It is not used for development in the production environment.
- **db:** persist the application data in a volume that is independent of the container lifecycle.

### Dockerfile

The `Dockerfile` is multi-stage:

| Stage | Purpose |
|---|---|
| `base` | Node 20 Alpine with tools for native modules (`bcrypt`) |
| `development` | All dependencies and hot reload (`npm run start:dev`) |
| `build` | Compiles TypeScript to `dist/` and removes development dependencies |
| `production` | Lightweight image, with `NODE_ENV=production` and a **non-root user** (`node`) |

### Compose Files

- `docker-compose.yml`: lab and development environment (`app` in development mode, `db`, `sonarqube`, and `jenkins`).
- `docker-compose.prod.yml`: production environment (`app` using the `production` stage and `db` with its own `cine_postgres_prod_data` volume). This file represents the Application Server in the deployment.

## 5. Getting Started

From the `cine-backend-nest/` folder:

```bash
# 1. Create the environment file from the example
cp .env.example .env        # PowerShell: Copy-Item .env.example .env

# 2. Edit .env with your own values (see section 6)

# 3. Validate the compose syntax
docker compose config

# 4. Start the services
docker compose up -d --build

# 5. Check the status
docker compose ps
```

### Service Access

| Service | URL | Notes |
|---|---|---|
| NestJS API | http://localhost:3000 | Health check: `GET /health` |
| SonarQube | http://localhost:9000 | On first login it asks you to change the default password |
| Jenkins | http://localhost:8080 | The initial password is obtained with the command below |

Initial Jenkins password:

```bash
docker exec cine-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Inside the `cine-network` network, services reach each other by name (for example, Jenkins reaches SonarQube at `http://sonarqube:9000`).

> Passwords and tokens are **not** documented in this file and must not be committed to the repository.

## 6. Environment Variables

The application uses `@nestjs/config` (`ConfigModule`) to read its configuration from environment variables.

- `.env`: real values for each machine. **It is not versioned** (it is listed in `.gitignore`).
- `.env.example`: versioned template. It must only contain placeholder values, never real credentials.

Main variables:

| Group | Variables |
|---|---|
| Application | `NODE_ENV`, `APP_PORT`, `APP_CONTAINER_NAME` |
| Database | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `POSTGRES_HOST`, `DATABASE_URL`, `DB_CONTAINER_NAME` |
| Authentication | `JWT_SECRET`, `JWT_EXPIRES_IN` |
| External services | `TMDB_BASE_URL`, `TMDB_API_KEY`, `TMDB_IMAGE_BASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |

### Observability Module Issue

During the initial validation of the environment, it was found that the `@nestjs/observe` module requires the variables `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET`. Since they were not defined, the application used the default values `YOUR_APP_KEY` and `YOUR_APP_SECRET`, causing an HTTP 401 response from the telemetry service.

**Solution:** the configuration was modified so that the observability service is optional and is only initialized when both credentials are available. After rebuilding the environment, the application started without the error.

## 7. Git Workflow

### Branching Strategy

- Features are developed in independent branches using the format `feature/US-XXX-description` (for example, `feature/US-DEVOPS-docker`).
- When finished, a Pull Request is opened against the main branch.
- The main branch is the deployable branch.

> Note: the reference project calls the deployable branch `master`; this repository uses `main`. The Jenkins trigger must point to `main`.

### Commit Convention

Format: `[US-XXX] type: description`

Allowed types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.

| | Example |
|---|---|
| Valid | `[US-125] fix: correct password validation` |
| Invalid | `fixed login` |

## 8. Git Hooks and Local Validations

Local validations are implemented with **Husky** to block commits that do not meet the rules.

### `pre-commit`

Runs, in this order:

```bash
npm run test    # tests with Vitest
npm run lint    # analysis with oxlint
```

If either one fails, the commit is canceled.

### `commit-msg`

Validates the message against the regular expression:

```
^\[US-[0-9]+\] (feat|fix|test|refactor|docs|chore): .+
```

If the message does not match, the commit is rejected and the required format and allowed types are displayed.

## 9. Code Quality (SonarQube)

SonarQube runs as a container and is configured for the project through `sonar-project.properties`:

| Property | Value |
|---|---|
| `sonar.projectKey` | `cine-backend-nest` |
| `sonar.sources` | `src` |
| `sonar.tests` | `src`, `test` |
| `sonar.test.inclusions` | `**/*.spec.ts`, `**/*.e2e-spec.ts` |
| `sonar.javascript.lcov.reportPaths` | `coverage/lcov.info` |

The coverage report is generated with `npm run test:cov`.

The `Jenkinsfile` runs `npm ci`, lint, tests with coverage, the production build, SonarScanner, and then waits for the SonarQube Quality Gate. A failed lint, test, build, or gate fails the pipeline. Configure the gate policy in SonarQube; the scanner does not create gate thresholds.

### Jenkins setup for the pipeline

Install these Jenkins plugins: **Pipeline**, **NodeJS**, **SonarQube Scanner**, and **Pipeline: Stage View**. In **Manage Jenkins → Tools**, define a NodeJS installation named `NodeJS 20` (Node 20.x) and a SonarQube Scanner installation named `SonarScanner`.

In **Manage Jenkins → System → SonarQube installations**, add a server named `SonarQube` with URL `http://sonarqube:9000` and select a Jenkins Secret Text credential containing a SonarQube user token. The Jenkins service and SonarQube service already share the Compose network, so use the service hostname, not `localhost`.

Create a SonarQube webhook pointing to `http://jenkins:8080/sonarqube-webhook/`. Jenkins' `waitForQualityGate` step depends on this webhook. In SonarQube, create or select a Quality Gate and assign it to project `cine-backend-nest`; its thresholds are managed in SonarQube.

Create a **Pipeline** job configured to use **Pipeline script from SCM**, select the repository and branch, and set the script path to `cine-backend-nest/Jenkinsfile`. The pipeline polls SCM every two minutes. Do not put tokens in the Jenkinsfile or repository.

## 10. Basic Security Measures

- `.env` files are not versioned; `.gitignore` excludes them and only allows `.env.example`.
- The production image runs with a non-root user.
- The database persists in a dedicated volume and services communicate through an internal network.
- Jenkins credentials will be managed with Jenkins Credentials, never inside the `Jenkinsfile`.

Points to keep in mind:

- The default values in the compose file (for example, the PostgreSQL password) are for the lab only and are **not suitable for production**.
- Any credential that has ended up in the Git history must be considered compromised and revoked.

## 11. Project Status

| Item | Status |
|---|---|
| App, database, SonarQube, and Jenkins containers defined in Compose | Done |
| Multi-stage Dockerfile and production compose | Done |
| Husky: `pre-commit` and `commit-msg` | Done |
| `GET /health` endpoint | Done |
| Jenkins configuration (plugins, tools, credentials, webhook) | Requires Jenkins UI configuration |
| SonarQube Quality Gate | Requires SonarQube UI configuration |
| `Jenkinsfile` and CI validation pipeline | Implemented; requires Jenkins tool/server setup |
| Automatic deployment and health check in the pipeline | Pending (Day 5) |
