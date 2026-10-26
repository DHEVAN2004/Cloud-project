# CloudVM Manager

CloudVM Manager is a React/Vite interface with a separate Java Spring Boot REST API and a MySQL persistence layer. The backend stores user accounts, VM configuration and simulated status, resource samples, alerts, networks, and application settings. It does **not** create, start, stop, or monitor actual cloud or hypervisor virtual machines.

## Prerequisites

- MySQL Server 8.0+ and MySQL Workbench
- Java 17 or newer
- Node.js and npm
- Maven, or the included Maven Wrapper (`backend/mvnw.cmd`)

## Create the database

1. Open MySQL Workbench and connect to your local MySQL Server.
2. Open `cloudvm_manager.sql` in Workbench.
3. Execute the script (lightning-bolt button). It creates and selects the `cloudvm_manager` database, tables, constraints, indexes, and safe demonstration records. It does not create a user with a known password.
4. Create an application account through the sign-up form after starting the backend. Registration hashes passwords with BCrypt.

The script includes example CRUD and reporting queries. Run the dashboard and alert queries in Workbench to inspect the sample rows. Do not use the MySQL root account for a production deployment.

## Configure the backend

Copy `backend/.env.example` to `backend/.env` only if you use an environment-file loader. Spring Boot does not read `.env` files automatically. The safer local option is setting process environment variables in the same PowerShell window used to start Spring:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/cloudvm_manager?useSSL=false&serverTimezone=UTC'
$env:DB_USERNAME = 'root'
$securePassword = Read-Host 'MySQL password' -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $securePassword).Password
$env:JWT_SECRET = [Convert]::ToBase64String([byte[]](1..48 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Enter your local MySQL password at the hidden prompt. The value is held in the current PowerShell process environment and is not written into project files. Keep the same terminal session open while running the backend. If the backend reports a missing JWT secret or an invalid signing key, generate a new random value of at least 32 bytes and set it in `JWT_SECRET`.

The datasource uses `spring.jpa.hibernate.ddl-auto=validate`; create the schema with Workbench before startup. Hibernate validates mappings and will not create or overwrite application tables.

## Install and start

From the project root:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

If Maven is installed globally instead, use `mvn spring-boot:run`. The API listens on `http://localhost:8080`.

In a second PowerShell window, from the project root:

```powershell
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the Spring Boot service at port 8080. For local development, configure the proxy with `VITE_DEV_API_PROXY` and, if needed, the API base URL with `VITE_API_BASE_URL` in `.env`; production builds always use same-origin `/api` paths. Restart Vite after changing local environment or proxy settings.

## Deploy the combined application to Render

The root `Dockerfile` builds the existing Vite application, copies its `dist` files into Spring Boot's static resources, and packages both into one Java 17 executable. Deploy it as one Render **Web Service**; there is no separate frontend/backend service, GitHub Actions workflow, or image registry. Spring serves the React app and REST API from the same origin. Direct React Router visits are forwarded to `index.html`; `/api/**` remains API-only.

The default deployment mode uses a reachable MySQL-compatible database. For a no-external-database demo, select the `memory` profile, which uses H2 in-memory storage. In that mode, accounts, VM records, alerts, and settings are lost whenever Render restarts or replaces the instance; multiple instances do not share data. Use it only for disposable demos. The default MySQL mode continues to validate the existing schema and does not create or drop production tables.

### Render environment variables

For a temporary in-memory deployment, add these under the Web Service's **Environment** settings:

| Key | Value |
|---|---|
| `APP_PROFILE` | `memory` |
| `JWT_SECRET` | Base64-encoded secret with at least 32 random decoded bytes |

Do not set `DB_URL`, `DB_USERNAME`, or `DB_PASSWORD` in memory mode. Render supplies `PORT` automatically. To switch to persistent MySQL later, remove `APP_PROFILE=memory`, configure the variables below, and apply the reviewed root `cloudvm_manager.sql` schema to your database.

For persistent MySQL-compatible storage, configure:

| Key | Value |
|---|---|
| `DB_URL` | `jdbc:mysql://<database-host>:3306/cloudvm_manager?sslMode=REQUIRED&serverTimezone=UTC` |
| `DB_USERNAME` | Database user with privileges only on the application database |
| `DB_PASSWORD` | That database user's password |
| `JWT_SECRET` | Base64-encoded secret with at least 32 random decoded bytes |

Generate a JWT secret locally in PowerShell with:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Copy the generated value into Render's secret environment variable; do not put it in source control, Docker build arguments, or frontend variables. Render supplies `PORT` automatically. Optional `JWT_TTL_SECONDS` defaults to `3600`. `CORS_ALLOWED_ORIGINS` is only needed for additional cross-origin clients; the React application uses same-origin API requests and does not need it.

### Render setup

1. In Render, choose **New + → Web Service** and connect `DHEVAN2004/Cloud-project`.
2. Select the branch to deploy and set **Root Directory** to the repository root (leave it blank).
3. Set **Runtime** to **Docker** and **Dockerfile Path** to `./Dockerfile`. Do not configure a separate build or start command; Render builds and runs the root Dockerfile.
4. Add `APP_PROFILE=memory` and a generated `JWT_SECRET` for a disposable in-memory demo, or configure the MySQL variables above for persistent storage. Do not add a second web service for the UI or API.
5. Set **Health Check Path** to `/actuator/health`.
6. Deploy. Open the single public URL Render assigns: `/` serves the UI and `/api/...` serves the existing backend endpoints.

### Test the combined Docker image locally

Run these commands from the repository root to build and run the combined image in temporary memory mode:

```powershell
docker build -t cloudvm-manager .
docker run --rm -p 8080:8080 `
  -e "APP_PROFILE=memory" `
  -e "JWT_SECRET=$env:JWT_SECRET" `
  cloudvm-manager
```

In another terminal, verify `Invoke-RestMethod http://localhost:8080/actuator/health` reports `UP`, and open `http://localhost:8080/login`. Protected `/api/**` endpoints still require a bearer token. To run the non-containerized checks, use `npm ci; npm run build` from the root and `.\mvnw.cmd test` from `backend`.

## Use and test the API

Register an account from the sign-up link on the login screen, or use Postman:

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{"username":"sample-user","email":"user@example.com","password":"choose-a-strong-password"}
```

Sign in at `POST /api/auth/login`; send the returned short-lived bearer token as `Authorization: Bearer <token>` for protected endpoints. Never put a database credential or JWT signing secret in a frontend environment variable.

The API covers VM listing, creation, details, updates, simulated status changes and deletion; dashboard statistics; stored VM metrics; alerts; networks and VM-network associations; and application settings. Use the exact request DTOs and response fields documented in the backend source or inspect them in Postman.

## Verify MySQL persistence

1. Register and sign in through the web application.
2. Create a VM in the existing **Create Virtual Machine** page.
3. In Workbench, run `SELECT * FROM virtual_machines ORDER BY created_at DESC;` and verify that the VM was saved.
4. Edit or change its simulated status, then verify the corresponding row with `SELECT * FROM virtual_machines WHERE id = '<id>';`.
5. Delete that VM from its detail page and confirm it is gone with the same `SELECT`.

Resource and alert records are application data. No actions invoke a real cloud provider or hypervisor.

## Troubleshooting

- **Cannot connect to MySQL:** confirm MySQL Server is running on port 3306, the database script executed successfully, and `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` are set in the terminal that starts Spring. Check that the account has privileges on `cloudvm_manager`.
- **Schema validation fails:** recreate/update the schema by running the reviewed SQL script; do not switch Hibernate to `create` or `create-drop`.
- **API unavailable:** start the Spring backend first and verify `http://localhost:8080` is reachable. Vite's `/api` proxy is configured in `vite.config.js`.
- **CORS errors:** use the Vite proxy for local development. For a separate frontend origin, configure the backend's allowed origin explicitly; do not allow every origin in production.
- **Login does not survive a page refresh:** the bearer token is intentionally memory-only in the browser and must be refreshed by signing in again. This avoids persisting a sensitive token in local storage.
- **Demo data is desired without the API:** set `VITE_ENABLE_MOCK_FALLBACK=true` in a development-only `.env` and restart Vite. The fallback is limited to frontend demo VM data; authentication and MySQL operations still require the backend.

## Tests

Run frontend production checks with `npm run build`. Run backend tests from `backend` with `.\mvnw.cmd test` (or `mvn test`).
