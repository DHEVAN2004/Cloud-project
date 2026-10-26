# CloudVM Manager backend

This is a standalone Spring Boot 3 / Java 17 API. It stores and reports VM metadata only; **it does not provision, start, stop, or operate real hypervisors**. Set up MySQL 8.0.16 or later and execute the workspace-root `cloudvm_manager.sql` once before starting the application. Hibernate is configured with `spring.jpa.hibernate.ddl-auto=validate`; schema changes belong in reviewed SQL migrations.

## Configure and run

Required environment variables:

- `DB_URL`: JDBC URL for the `cloudvm_manager` database.
- `DB_USERNAME` and `DB_PASSWORD`: database credentials.
- `JWT_SECRET`: base64-encoded key with at least 32 decoded bytes. Generate/store this with a secret manager; do not commit it.

Optional: `PORT` (8080), `JWT_TTL_SECONDS` (3600), and `CORS_ALLOWED_ORIGINS` (defaults to `http://localhost:5173`, comma-separated exact origins). Same-origin reverse-proxy deployment is also supported. No DB or JWT secret values are checked in.

`backend/.env.example` contains safe placeholders; copy it to `.env`, replace each placeholder locally, and export the values into the process environment before running. Spring Boot does **not** load `.env` automatically. In PowerShell, from the backend directory, a local `.env` can be loaded into the current process with:

```powershell
Get-Content .env | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object { $name, $value = $_ -split '=', 2; Set-Item -Path "Env:$name" -Value $value }
```

Run `.\mvnw.cmd test` and `.\mvnw.cmd spring-boot:run` from that same PowerShell session. The checked-in Maven Wrapper downloads the pinned Maven distribution to the user's wrapper cache and does not install Maven globally; wrapper/Maven artifact downloads require access to Maven Central. The project is not wired to the frontend; the frontend can point its API base URL to this service through its own configuration.

## JSON/API contract

All API routes are under `/api`. `/api/auth/register` and `/api/auth/login` are public; all other routes require `Authorization: Bearer <accessToken>`. Registration accepts `{ "name", "email", "password" }` (`username` is also accepted as an alias) and returns `{ "accessToken", "tokenType": "Bearer", "expiresIn", "user": { "id", "username", "name", "email", "role" } }`. `name` and `username` in the response share the registered username. Passwords are BCrypt hashes in storage. Public registration can only create `USER` accounts; account roles cannot be specified by the caller.

VM resource fields are numeric: `cpuCores`, `memoryGb`, `storageGb`. VM DTOs include string `id`, `name`, `description`, `operatingSystem` (plus legacy response alias `os`), `networkConfig` (`NAT`, `Bridged`, or `Host-only`), `status` (`Running`, `Stopped`, `Error`), and `ipAddress`. VM metrics are percentage integers. Create/Replace bodies use `name`, `description`, `operatingSystem` (accepts legacy input alias `os`), `cpuCores`, `memoryGb`, `storageGb`, `networkConfig`, `portForwarding`, `startOnBoot`, `template`, and `sshKey`; IDs, status, IP, MAC, timestamps, and metrics are server-managed.

| Method/path | Purpose |
|---|---|
| `GET /api/vms`, `POST /api/vms` | List and create VMs |
| `GET /api/vms/{id}`, `PUT /api/vms/{id}`, `DELETE /api/vms/{id}` | Fetch, replace, delete a VM |
| `PATCH /api/vms/{id}/status` | Update status using `{ "status": "Running" }` |
| `GET /api/vms/{id}/networks`, `PUT/DELETE /api/vms/{id}/networks/{networkId}` | List, add (idempotent), or remove a VM-network association |
| `GET/POST /api/networks`, `GET/PUT/DELETE /api/networks/{id}` | Network CRUD |
| `GET /api/dashboard/stats` (`/api/dashboard` alias), `GET /api/dashboard/resources` (`/api/resources` alias) | Fleet counts and resource percentage summaries |
| `GET /api/metrics?vmId={id}` | Array of `{ "vmId", "recordedAt", "cpuUsagePercent", "memoryUsagePercent", "storageUsagePercent", "networkUsagePercent" }` metric DTOs (all visible VMs if omitted) |
| `GET/POST /api/vms/{id}/metrics` (`/api/vms/{id}/resources` alias) | List or record a VM resource sample |
| `GET/PUT/DELETE /api/vms/{id}/resources/{resourceId}` | Fetch, replace, or delete a resource sample |
| `GET /api/alerts`, `PATCH /api/alerts/{id}` (`/api/alerts/{id}/status` alias) | List alerts and update alert status |
| `GET/PUT /api/settings` | Read or replace signed-in user's preferences |

Dashboard returns `totalVms`, `runningVms`, `stoppedVms`, and `errorVms`, along with resource summaries and a timestamp. Resource samples are backed by `vm_resources`; their request body is `{ "cpuUsagePercent", "memoryUsagePercent", "storageUsagePercent", "networkUsagePercent" }` with each integer from 0 through 100. The sample DTO adds `id`, `vmId`, and ISO-8601 `recordedAt`. Network JSON uses `{ "id", "networkName", "networkType", "subnet", "gateway", "description", "status" }`; create/replace requests accept `networkName`, `networkType`, `subnet`, `gateway`, and `description`. Legacy input names `name`, `mode`, and `cidrBlock` are accepted as aliases. Association routes are explicitly `GET /api/vms/{id}/networks` (returns an array of network DTOs), `PUT /api/vms/{id}/networks/{networkId}` (idempotently adds the association; request has no body, returns 204 with no body), and `DELETE /api/vms/{id}/networks/{networkId}` (removes it; request has no body, returns 204 with no body). Only VMs owned by the signed-in user can be associated.

The required SQL/JPA table names are `users`, `networks`, and `app_settings` (per-user setting rows with `setting_id`, `key`, `value`, `created_at`, and `updated_at`); VM telemetry is stored in `vm_resources`. The `users` table stores `username`, `email`, `password_hash`, `role`, and created/updated timestamps. Hibernate validates these names against the root SQL schema at startup.

Alert DTOs use `severity` (`Critical`, `Warning`, `Info`) and `status` (`Open`, `Acknowledged`, `Resolved`). Errors are JSON with `timestamp`, numeric `status`, `error`, safe `message`, `path`, and optional validation `details`. Validation errors return HTTP 400; unauthorized requests return 401, ownership violations 403, missing records 404, conflicts 409.

Seeded null-owner sample VMs/networks/alerts are visible as shared read-only starter content. New records are owned by their creator and isolated per user; account registration never grants admin privileges. Create a user using `/api/auth/register` before signing in. Do not use seeded data as production inventory.
