# Taskboard — Spring Boot + Angular + MySQL, all in Docker

A deliberately small but **complete three-tier application** built to learn how a
modern frontend, a REST API and a database fit together — first locally, then in
containers.

| Tier | Technology | Container | Host URL |
|------|------------|-----------|----------|
| UI | Angular 22 (standalone, zoneless, signals) | `demo-ui` (nginx) | <http://localhost:4200> |
| API | Spring Boot 4.1 / Java 21 | `demo-app` | <http://localhost:8080> |
| Database | MySQL 8.4 + Flyway migrations | `demo-mysql` | `localhost:3307` |

Phase status:

| Phase | What | Status |
|-------|------|--------|
| 1 | Spring Boot + MySQL in two containers | done |
| 2 | Angular CRUD UI in a third container (nginx) | **this phase** |
| 3 | End-to-end test of UI → API → database with Playwright | next |

---

## 1. What you will learn

**Docker / backend**

- Multi-stage Dockerfiles: build tools stay out of the runtime image
- Running Java and nginx as **non-root users**
- Healthchecks and `depends_on: condition: service_healthy`
- A user-defined bridge network where containers find each other by name
- MySQL persistence with a named volume
- Schema ownership with Flyway (`ddl-auto: validate`)

**Angular / frontend**

- Angular 22 **standalone components** (no NgModules)
- **Zoneless** change detection with **signals** and `computed`
- Lazy-loaded routes and route titles
- `HttpClient` with the modern **Fetch** backend
- Reactive forms with validation
- Loading, empty, filtered-empty and error states
- A reusable toast service and a native `<dialog>` confirmation modal
- Reverse proxying `/api` in development **and** production, so there is no CORS
- Unit tests with **Vitest** and `HttpTestingController`

---

## 2. Architecture

```
                    Windows host (your machine)
                    ┌────────────────────────────────────────────────────┐
                    │                                                    │
 browser ───────────┼──▶ localhost:4200   localhost:8080   localhost:3307│◀── DBeaver
                    │         │                │                │        │
                    │  ┌──────▼────────────────▼────────────────▼─────┐  │
                    │  │             Docker network: demo-net         │  │
                    │  │                                              │  │
                    │  │  ┌──────────────┐   ┌──────────────┐         │  │
                    │  │  │ demo-ui      │   │ demo-app     │         │  │
                    │  │  │ nginx :8080  │──▶│ Spring Boot  │──┐      │  │
                    │  │  │ Angular SPA  │   │ :8080        │  │      │  │
                    │  │  └──────────────┘   └──────────────┘  │      │  │
                    │  │        ▲                    ▲         │      │  │
                    │  │        │ /api/* proxy       │         ▼      │  │
                    │  │        └────────────────────┘   ┌──────────┐ │  │
                    │  │                                 │ demo-mysql│ │  │
                    │  │                                 │ MySQL 8.4 │ │  │
                    │  │                                 │ :3306     │ │  │
                    │  │                                 └──────────┘ │  │
                    │  └──────────────────────────────────────────────┘  │
                    └────────────────────────────────────────────────────┘
```

Two names matter inside the network:

- the UI container proxies `/api/*` to **`app:8080`**;
- the API connects to **`mysql:3306`**.

Docker's embedded DNS resolves both service names because every container is
attached to `demo-net`. No IP addresses are hard-coded.

### Why there is no CORS configuration in the Angular code

The browser only ever talks to the UI's own origin (`localhost:4200`). nginx
forwards `/api/*` to Spring Boot, so the API request is same-origin from the
browser's point of view. In development the Angular dev server does the same
thing through `frontend/proxy.conf.json`.

The backend still has an optional CORS configuration (`CORS_ALLOWED_ORIGINS`,
default `http://localhost:4200`) for direct calls that bypass the proxy, but the
UI does not depend on it.

---

## 3. Project structure

```
Experiment_JAVA_Project/
├── backend/                          # tier 2: REST API
│   ├── Dockerfile                    # Maven build stage -> slim JRE runtime
│   ├── .dockerignore
│   ├── pom.xml                       # Java 21, Spring Boot 4.1.2
│   └── src/
│       ├── main/
│       │   ├── java/com/example/dockerdemo/
│       │   │   ├── DockerDemoApplication.java
│       │   │   ├── common/GlobalExceptionHandler.java
│       │   │   ├── config/WebConfig.java          # optional CORS
│       │   │   ├── hello/HelloController.java     # GET /api/hello
│       │   │   └── task/                          # Task CRUD + validation
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/                  # Flyway V1, V2
│       └── test/                                  # JUnit service test
│
├── frontend/                         # tier 1: Angular UI
│   ├── Dockerfile                    # node build stage -> nginx runtime
│   ├── nginx.conf                    # SPA fallback + /api reverse proxy
│   ├── .dockerignore
│   ├── proxy.conf.json               # dev proxy: /api -> localhost:8080
│   ├── angular.json                  # dev server on port 4300
│   ├── package.json
│   └── src/
│       ├── index.html
│       ├── styles.css                # design tokens + shared component styles
│       └── app/
│           ├── app.ts / app.html     # shell: header, nav, router outlet
│           ├── app.config.ts         # HttpClient, router providers
│           ├── app.routes.ts         # lazy feature routes
│           ├── tasks/
│           │   ├── task.model.ts
│           │   ├── task.service.ts
│           │   ├── task-list.*
│           │   ├── task-form.*
│           │   ├── http-error.ts
│           │   └── *.spec.ts
│           └── shared/
│               ├── toast.service.ts
│               ├── toast.*
│               ├── confirm-dialog.*
│               └── toast.service.spec.ts
│
├── compose.yaml                      # mysql + app + ui on demo-net
├── .env                              # local credentials/ports (not committed)
├── .env.example
├── scripts/
│   ├── use-node.ps1                  # activates portable Node 26 for this shell
│   └── smoke-test.ps1                # 7 checks against the API
└── README.md
```

---

## 4. Prerequisites

| Tool | Version used here | Notes |
|------|-------------------|-------|
| Java | 21 | backend build and runtime |
| Maven | 3.9.x | or use the Docker build |
| Docker Desktop | 28.x | Linux containers mode |
| Node.js | **26.13.0** (portable) | Angular 22 requires `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` |
| npm | 11.20.0 | comes with Node 26 |
| PowerShell | 5.1+ or 7+ | all commands below work in both |

> **No administrator rights are needed.** Node is installed as a portable zip
> under `C:\BINEET\tools\node`. Angular's Docker build uses `node:26-alpine`
> internally, so the container never depends on your host Node.

Activate the portable Node in the current terminal:

```powershell
. .\scripts\use-node.ps1
node --version      # v26.13.0
npm --version       # 11.20.0
```

The script only changes `PATH` for that PowerShell session. The system-wide
Node 22.16.0 is left untouched.

---

## 5. Quick start (recommended)

From the project root:

```powershell
# Build all three images and start the stack
docker compose up --build -d

# Wait until all healthchecks are green
docker compose ps
```

Expected configuration (creation times and ports will match your `.env`):

```
NAME         IMAGE                              SERVICE   STATUS
demo-app     spring-boot-docker-demo:1.0.0      app       Up (healthy)   0.0.0.0:8080->8080/tcp
demo-mysql   mysql:8.4                          mysql     Up (healthy)   0.0.0.0:3307->3306/tcp
demo-ui      spring-boot-docker-demo-ui:1.0.0   ui        Up (healthy)   0.0.0.0:4200->8080/tcp
```

Then open:

| What | URL |
|------|-----|
| Taskboard UI | <http://localhost:4200> |
| API directly | <http://localhost:8080/api/tasks> |
| API through the UI proxy | <http://localhost:4200/api/tasks> |
| Health | <http://localhost:8080/actuator/health> |
| UI health endpoint | <http://localhost:4200/healthz> |

The first build downloads Maven and npm dependencies, so it can take a few
minutes. Later builds reuse Docker layer caches.

### Stop and clean up

```powershell
docker compose stop           # stop containers, keep them
docker compose down           # remove containers + network, KEEP the data volume
docker compose down -v        # remove everything INCLUDING the database volume
```

---

## 6. The Angular UI

### What it does

- Lists all tasks, newest state from `GET /api/tasks`
- Filters by status with live counts: **All / To do / In progress / Done**
- Creates tasks at `/tasks/new`
- Edits tasks at `/tasks/:id/edit`
- Deletes tasks only after a confirmation dialog
- Shows distinct **loading**, **error**, **empty** and **filtered-empty** states
- Shows success and error **toasts** (auto-dismiss, manually dismissible)
- Fully responsive, keyboard accessible, plain modern CSS — no UI library

### Routes

| Path | Screen |
|------|--------|
| `/` | redirects to `/tasks` |
| `/tasks` | list + filter |
| `/tasks/new` | create form |
| `/tasks/:id/edit` | edit form |
| anything else | redirects to `/tasks` |

Both feature screens are **lazy-loaded**, so the initial bundle contains only
the shell. Route definitions also set the browser tab title.

### State model

All mutable view state is a signal:

```ts
readonly tasks = signal<Task[]>([]);
readonly loading = signal(true);
readonly error = signal<string | null>(null);
readonly filter = signal<FilterValue>('ALL');

readonly filteredTasks = computed(() => …);
readonly counts = computed(() => …);
```

`TaskService` is a thin, stateless HTTP gateway. Components own their UI state,
which keeps the service reusable and easy to test.

### Styling

`src/styles.css` contains design tokens (colors, radii, shadows, spacing) and
shared components: buttons, badges, chips, cards, form fields, alerts, states.
Feature CSS files only add layout that is unique to that screen.

---

## 7. Developing the UI locally

The containerised UI uses port 4200, so `ng serve` uses **4300** to avoid a
clash. The dev server proxies `/api` to the backend on port 8080.

```powershell
# 1. Terminal A - database only (the API will run from source)
docker compose up -d mysql

# 2. Terminal B - backend on http://localhost:8080
cd backend
mvn spring-boot:run

# 3. Terminal C - Angular dev server on http://localhost:4300
. .\scripts\use-node.ps1
cd frontend
npm ci
npm start
```

Open <http://localhost:4300>. The browser calls `/api/tasks` on port 4300;
`frontend/proxy.conf.json` forwards it to `http://localhost:8080`.

Or run the whole backend in Docker and only Angular locally:

```powershell
docker compose up -d mysql app
# then, in frontend/
npm start
```

### Build and tests

```powershell
cd frontend
npm run build       # production build -> dist/frontend/browser
npm run test:ci     # 13 Vitest tests, no watch mode
npm test            # watch mode while developing
```

Current test coverage:

| Spec | What it proves |
|------|----------------|
| `task.service.spec.ts` | correct URL, method and body for GET/POST/PUT/DELETE |
| `task-list.spec.ts` | list rendering, filtering, empty state, API error state |
| `app.spec.ts` | shell renders brand and navigation |
| `toast.service.spec.ts` | add and dismiss notifications |

---

## 8. API reference

Base URL on the host: **`http://localhost:8080`** (or `http://localhost:4200/api`
through the nginx proxy).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hello` | Hello message, Java version, container hostname |
| GET | `/api/hello/{name}` | Personalised hello |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/{id}` | Get one task (404 if missing) |
| POST | `/api/tasks` | Create a task → `201 Created` |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task → `204 No Content` |
| GET | `/actuator/health` | Spring Boot health (Docker healthcheck) |
| GET | `/actuator/info` | Application info |

### Task JSON

```json
{
  "id": 1,
  "title": "Learn Docker images",
  "description": "Build this Spring Boot application into a Docker image",
  "status": "DONE",
  "createdAt": "2026-11-07T10:15:30",
  "updatedAt": "2026-11-07T10:15:30"
}
```

`status` is one of `TODO`, `IN_PROGRESS`, `DONE` (case-sensitive). Errors are
returned as RFC 9457 Problem Details, for example:

```json
{
  "type": "about:blank",
  "title": "Validation error",
  "status": 400,
  "detail": "Request validation failed",
  "errors": { "title": "title must not be blank" }
}
```

The Angular `toUserMessage()` helper turns this into a readable toast.

### Quick API checks

```powershell
# Everything at once
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1

# List tasks through the UI proxy (proves nginx -> app works)
Invoke-RestMethod http://localhost:4200/api/tasks | ConvertTo-Json -Depth 5

# Create, update, delete
$body = @{
    title       = "Try the Angular UI"
    description = "Phase 2 of the learning path"
    status      = "TODO"
} | ConvertTo-Json

$task = Invoke-RestMethod http://localhost:8080/api/tasks -Method Post `
    -ContentType "application/json" -Body $body

$body2 = @{
    title       = "Try the Angular UI"
    description = "Edited from PowerShell"
    status      = "DONE"
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:8080/api/tasks/$($task.id)" -Method Put `
    -ContentType "application/json" -Body $body2 | ConvertTo-Json

Invoke-RestMethod "http://localhost:8080/api/tasks/$($task.id)" -Method Delete
```

---

## 9. Configuration (`.env`)

Docker Compose reads `.env` automatically.

| Variable | Default | Meaning |
|----------|---------|---------|
| `MYSQL_ROOT_PASSWORD` | `root123` | MySQL root password |
| `MYSQL_DATABASE` | `dockerdemo` | database created on first start |
| `MYSQL_USER` | `demo` | application database user |
| `MYSQL_PASSWORD` | `demo123` | application user password |
| `MYSQL_HOST_PORT` | `3307` | host port → MySQL container port 3306 |
| `APP_HOST_PORT` | `8080` | host port → API container port 8080 |
| `UI_HOST_PORT` | `4200` | host port → nginx container port 8080 |

> The table shows the local demo values from `.env`. The committed
> `.env.example` uses placeholder passwords (`change-me-*`); replace them when
> you create your own `.env`.

The API reads database settings from environment variables with sensible
defaults (`backend/src/main/resources/application.yml`):

| App variable | Default | In Compose |
|--------------|---------|------------|
| `DB_HOST` | `localhost` | `mysql` |
| `DB_PORT` | `3307` | `3306` |
| `DB_NAME` | `dockerdemo` | from `.env` |
| `DB_USER` | `demo` | from `.env` |
| `DB_PASSWORD` | `demo123` | from `.env` |
| `SERVER_PORT` | `8080` | `8080` |

> The host defaults (`localhost:3307`) let you run the API from your IDE against
> the MySQL container. Compose overrides them with the in-network values.

---

## 10. How the containers are built

### Backend image (`backend/Dockerfile`)

1. `maven:3.9-eclipse-temurin-21` compiles the JAR. The POM is copied first so
   dependencies stay cached until `pom.xml` changes.
2. `eclipse-temurin:21-jre-alpine` is the runtime. It gets a non-root `app` user
   and only the JAR. `MaxRAMPercentage=75` keeps the JVM inside container limits.

### UI image (`frontend/Dockerfile`)

1. `node:26-alpine` runs `npm ci` and `npm run build`.
2. `nginxinc/nginx-unprivileged:1.30-alpine` serves
   `dist/frontend/browser` as a non-root user on port 8080.

### nginx routing (`frontend/nginx.conf`)

| Request | Behaviour |
|---------|-----------|
| `/api/*` | proxied to `http://app:8080`, re-resolved through Docker DNS |
| `/healthz` | returns `ok` for the Compose healthcheck |
| hashed assets | cached for 30 days |
| `/index.html` | always revalidated |
| any other path | SPA fallback to `index.html` |

The `^~ /api/` prefix is deliberate: it wins over the static-asset regex, so an
API path is never mistaken for a file.

---

## 11. Schema and Flyway

On every application start Flyway:

1. connects to `dockerdemo`,
2. creates `flyway_schema_history` if needed,
3. applies pending migrations in `backend/src/main/resources/db/migration`.

| Migration | Effect |
|-----------|--------|
| `V1__create_tasks_table.sql` | creates the `tasks` table |
| `V2__seed_tasks.sql` | inserts three demo tasks |

Hibernate runs with `ddl-auto: validate`, so it **never** changes the schema — it
only checks that the entity matches the table. Add `V3__...sql` to evolve it.

Start from a completely fresh database:

```powershell
docker compose down -v
docker compose up -d
```

---

## 12. Persistence demo

```powershell
docker compose up -d
# create a task in the UI or via the API
docker compose down          # containers removed, named volume KEPT
docker compose up -d
# the task is still there

docker compose down -v       # also deletes the named volume
docker compose up -d
# only the Flyway seed data exists again
```

Data lives in the named volume `spring-boot-docker-demo-mysql-data`, not in the
container. Containers are disposable; volumes are not.

---

## 13. Run everything without Docker (optional)

### Backend from source

```powershell
docker compose up -d mysql
cd backend
mvn spring-boot:run
```

The app defaults to `localhost:3307`, the published MySQL port.

### Frontend from source

```powershell
. .\scripts\use-node.ps1
cd frontend
npm ci
npm start          # http://localhost:4300, proxies /api to :8080
```

### Tests

```powershell
cd backend
mvn test

cd ..\frontend
npm run test:ci
```

---

## 14. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `error during connect ... dockerDesktopLinuxEngine` | Start Docker Desktop and wait for “Engine running”. |
| `port is already allocated` | Change `UI_HOST_PORT`, `APP_HOST_PORT` or `MYSQL_HOST_PORT` in `.env`, then `docker compose up -d`. |
| `npm start` fails with an engine error | Activate Node 26: `. .\scripts\use-node.ps1`. |
| `ng serve` says port 4300 is in use | Stop the other process or run `npm start -- --port 4301`. |
| UI shows “Cannot reach the API” | The API is not healthy. Run `docker compose ps` and `docker compose logs app`. |
| `demo-ui` is `unhealthy` | Check `docker compose logs ui`; verify `/healthz` from inside the container. |
| Deep link like `/tasks/5/edit` returns 404 | nginx must use the SPA fallback `try_files … /index.html`; check `frontend/nginx.conf` was copied into the image. |
| UI loads but `/api/tasks` returns 502 | nginx cannot resolve `app`. Ensure both services share `demo-net` and the app container is running. |
| `docker-compose` is not recognised | Use the modern v2 command: `docker compose` (space). |
| `npm ci` fails in Docker | `package-lock.json` and `package.json` disagree; run `npm install` locally and commit the lockfile. |
| App exits with `Communications link failure` | MySQL was not ready. Compose waits for the healthcheck; inspect `docker compose logs mysql`. |
| `Access denied for user 'demo'` | MySQL creates users only on the first initialisation of an empty volume. Run `docker compose down -v`. |
| Flyway checksum mismatch | An applied migration was edited. For this demo, reset the volume; in real projects add a new migration. |
| 400 with a `status` value | Status must be exactly `TODO`, `IN_PROGRESS` or `DONE`. |

> The project uses **`compose.yaml`**, the current Docker-recommended filename.
> Compose v2 still accepts the legacy `docker-compose.yml` name, but new projects
> should use `compose.yaml`. The old hyphenated `docker-compose` v1 command is
> end-of-life.

---

## 15. Useful commands

```powershell
docker compose ps                          # status + health
docker compose logs -f app                 # API logs
docker compose logs -f ui                  # nginx logs
docker compose logs -f mysql               # database logs
docker compose exec app sh                 # shell in the API container (Alpine)
docker compose exec ui sh                  # shell in the nginx container
docker compose exec mysql bash             # shell in MySQL (Oracle Linux)
docker stats                               # live CPU/memory
docker compose build --no-cache app ui     # full rebuild of both app images
```

Check that the containers run as non-root:

```powershell
docker compose exec app id
docker compose exec ui id
```

Query the database directly:

```powershell
docker compose exec mysql mysql -u demo -pdemo123 dockerdemo `
    -e "SELECT id, title, status FROM tasks;"
```

Host database connection for DBeaver / mysql CLI:

| Client | Host | Port | Database | User | Password |
|--------|------|------|----------|------|----------|
| DBeaver / mysql CLI | `127.0.0.1` | `3307` | `dockerdemo` | `demo` | `demo123` |

---

## 16. Appendix — the same stack without Compose

This is the most explicit way to see what Compose automates. Stop the Compose
stack first (`docker compose down`), then run from the project root:

```powershell
# 1. Network and data volume
docker network create demo-net
docker volume create spring-boot-docker-demo-mysql-data

# 2. MySQL
docker run -d --name demo-mysql --network demo-net `
  -e MYSQL_ROOT_PASSWORD=root123 `
  -e MYSQL_DATABASE=dockerdemo `
  -e MYSQL_USER=demo `
  -e MYSQL_PASSWORD=demo123 `
  -p 3307:3306 `
  -v spring-boot-docker-demo-mysql-data:/var/lib/mysql `
  mysql:8.4

# 3. Wait for MySQL
docker exec demo-mysql mysqladmin ping -h 127.0.0.1 -u root -proot123

# 4. API image (note the build context: backend/)
docker build -t spring-boot-docker-demo:1.0.0 .\backend
docker run -d --name demo-app --network demo-net `
  -e DB_HOST=mysql -e DB_PORT=3306 -e DB_NAME=dockerdemo `
  -e DB_USER=demo -e DB_PASSWORD=demo123 -e SERVER_PORT=8080 `
  -p 8080:8080 `
  spring-boot-docker-demo:1.0.0

# 5. UI image (note the build context: frontend/)
docker build -t spring-boot-docker-demo-ui:1.0.0 .\frontend
docker run -d --name demo-ui --network demo-net -p 4200:8080 `
  spring-boot-docker-demo-ui:1.0.0

# 6. Verify
Invoke-RestMethod http://localhost:4200/api/tasks | ConvertTo-Json -Depth 5

# 7. Clean up
docker rm -f demo-ui demo-app demo-mysql
docker network rm demo-net
# keep the volume if you want the data, or remove it explicitly:
# docker volume rm spring-boot-docker-demo-mysql-data
```

---

## 17. Learning checklist

**Backend / Docker**

- [ ] Identify the two `FROM` stages in `backend/Dockerfile`
- [ ] Explain why the runtime image only needs a JRE
- [ ] Explain why `COPY pom.xml` before `COPY src` speeds up builds
- [ ] Explain why `USER app` matters
- [ ] Explain how `demo-app` resolves the hostname `mysql`
- [ ] Explain the difference between `3307:3306` and `DB_PORT=3306`
- [ ] Explain why `docker compose down` keeps data but `down -v` does not
- [ ] Add a `V3__...sql` migration and watch Flyway apply it

**Angular**

- [ ] Trace a click from `task-list.html` to `TaskService.list()` to `/api/tasks`
- [ ] Explain why `filteredTasks` is a `computed` and not a method
- [ ] Explain how `proxy.conf.json` removes the need for CORS in development
- [ ] Explain what `withFetch()` changes
- [ ] Explain why `task-form` can serve both create and edit
- [ ] Add a new status and follow every place that must change
- [ ] Break the API URL and confirm the error state and toast appear
- [ ] Add a test for the delete confirmation flow

**End to end**

- [ ] Create a task in the UI and find the row in MySQL
- [ ] Edit it, refresh the browser, confirm the change persisted
- [ ] Delete it and confirm it disappears from both the UI and the database

---

## 18. What's next (phase 3)

Add **Playwright** to test the real three-tier path in a browser:

1. Start the Compose stack (`mysql` + `app` + `ui`).
2. Open <http://localhost:4200> with Playwright.
3. Create a task through the UI.
4. Assert it appears in the list and via `GET /api/tasks`.
5. Query MySQL directly to prove it persisted.
6. Edit, delete, and assert it is gone everywhere.
7. Run the suite in CI against `docker compose up --build -d`.

Because the UI is already containerised and healthchecked, the E2E test only
needs one URL — no frontend dev server, no CORS, no test-only configuration.
