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
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the Spring Boot service at port 8080. Frontend API URL and proxy settings can be adjusted in `.env` using the safe, non-secret values shown in `.env.example`. Restart Vite after changing its environment or proxy settings.

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
