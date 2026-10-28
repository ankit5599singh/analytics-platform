# Analytics Platform

A full-stack analytics platform built as a monorepo with a Next.js frontend, Laravel API, browser analytics SDK, and PHP server-side SDK. The project includes analytics event ingestion, analytics dashboard endpoints, background queue processing, and a restaurant menu/order demonstration.

## Repository Structure

```text
analytics-platform/
├── apps/
│   ├── api/                 # Laravel API
│   └── web/                 # Next.js frontend
├── packages/
│   ├── browser-sdk/         # TypeScript browser analytics SDK
│   └── php-sdk/             # PHP server-side analytics SDK
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── README.md
```

## Technology Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** PHP, Laravel
- **Database:** MySQL 8.4
- **Background processing:** Laravel database queue and queue worker
- **Browser SDK:** TypeScript
- **Server SDK:** PHP
- **Containerization:** Docker and Docker Compose

## Features

- Browser analytics event tracking
- Server-side analytics event ingestion
- Analytics summary, trends, pages, and events endpoints
- Analytics dashboard in the Next.js application
- Restaurant menu and order demonstration
- Background job processing through a Laravel queue worker
- Reusable TypeScript and PHP analytics SDKs

## Prerequisites

### For Docker setup

Install:

- Docker Engine or Docker Desktop
- Docker Compose v2 (`docker compose`)

The current Compose configuration uses `network_mode: host` for the web service. This configuration is intended for **Linux hosts**. See the Docker notes below before using macOS or Windows.

### For local development without Docker

Install:

- PHP 8.4
- Composer 2
- Node.js 24 and npm
- MySQL 8.4
- Git

Check your installed versions:

```bash
php -v
composer --version
node --version
npm --version
mysql --version
```

## Quick Start: Docker on Linux

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd analytics-platform
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the repository URL supplied by your organization.

### 2. Configure the Laravel environment

Create a local environment file from the example:

```bash
cp apps/api/.env.example apps/api/.env
```

If the repository does not include `apps/api/.env.example`, create one from the documented environment variables in this README before starting Docker. Never commit your real `.env` file.

For the supplied local Compose configuration, the database values should be:

```dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=analytics
DB_USERNAME=analytics_user
DB_PASSWORD=local_dev_password

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=database

ANALYTICS_WRITE_KEY=local-demo-write-key
ANALYTICS_READ_KEY=local-dashboard-read-secret-change-me
ANALYTICS_SERVER_WRITE_KEY=local-server-secret-change-me
ANALYTICS_SERVER_ENDPOINT=http://api:8000/api/v1/server/events
```

Use these credentials only for disposable local development. Replace the demo keys with unique values if other people can access the environment, and configure matching values wherever the same key is used.

Laravel also requires a valid `APP_KEY`. Generate one locally if necessary:

```bash
docker compose run --rm api php artisan key:generate
```

If you generate the key this way, make sure the generated value is saved in `apps/api/.env`. Do not commit that file.

### 3. Build and start the application

```bash
docker compose config --quiet
docker compose up -d --build
```

The API container runs Laravel migrations during startup. The worker runs the Laravel database queue worker.

### 4. Open the application

| Service                 | URL                          |
| ----------------------- | ---------------------------- |
| Next.js web application | http://localhost:3000        |
| Laravel API base        | http://localhost:8000/api/v1 |
| MySQL published port    | `localhost:3307`             |

The browser SDK uses `http://localhost:8000/api/v1` to reach the API from your browser.

### 5. Check container status and logs

```bash
docker compose ps
docker compose logs --tail=100 api
docker compose logs --tail=100 web
docker compose logs --tail=100 worker
docker compose logs --tail=100 mysql
```

To follow logs continuously:

```bash
docker compose logs -f api web worker
```

### 6. Stop the application

```bash
docker compose down
```

This retains the MySQL volume. To remove the database volume and its local data as well:

```bash
docker compose down -v
```

**Warning:** `docker compose down -v` deletes the Compose-managed MySQL data volume.

## Local Development Without Docker

These instructions assume MySQL is installed and running on your machine.

### 1. Start MySQL and create the database

Create a database and user for development. For example, connect to MySQL as an administrator and run:

```sql
CREATE DATABASE analytics;
CREATE USER 'analytics_user'@'localhost' IDENTIFIED BY 'local_dev_password';
GRANT ALL PRIVILEGES ON analytics.* TO 'analytics_user'@'localhost';
FLUSH PRIVILEGES;
```

If you use a different database user or password, update the Laravel environment accordingly.

### 2. Configure and start the Laravel API

```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate
```

Set the following values in `apps/api/.env` for a local MySQL server:

```dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=analytics
DB_USERNAME=analytics_user
DB_PASSWORD=local_dev_password

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=database

ANALYTICS_WRITE_KEY=local-demo-write-key
ANALYTICS_READ_KEY=local-dashboard-read-secret-change-me
ANALYTICS_SERVER_WRITE_KEY=local-server-secret-change-me
ANALYTICS_SERVER_ENDPOINT=http://127.0.0.1:8000/api/v1/server/events
```

Run migrations:

```bash
php artisan migrate
```

Start the API:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Keep this terminal open.

### 3. Start the queue worker

Open a second terminal:

```bash
cd apps/api
php artisan queue:work database --sleep=3 --tries=3 --timeout=90
```

Keep the worker running while testing background jobs.

### 4. Build the browser SDK

Open a third terminal from the repository root:

```bash
cd packages/browser-sdk
npm ci
npm run build
```

### 5. Install and start the Next.js application

```bash
cd ../../apps/web
npm ci
```

Create `apps/web/.env.local` with:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_ANALYTICS_WRITE_KEY=local-demo-write-key
ANALYTICS_READ_KEY=local-dashboard-read-secret-change-me
```

Start Next.js:

```bash
npm run dev
```

Open http://localhost:3000.

**Analytics dashboard note:** The dashboard proxy must be able to reach the Laravel API from the Next.js server process. With local development, `127.0.0.1:8000` works when Next.js and Laravel both run directly on the same host. In Docker, the web container has a different network context; see the Docker compatibility note below.

## Docker Compatibility Note

The current `docker-compose.yml` configures the web service with:

```yaml
network_mode: host
```

This is a Linux-oriented development workaround that lets the Next.js server use `localhost:8000` to reach the API published on the host. In this mode, Docker's normal port mapping is not used for the web service; Next.js listens on port `3000` on the host.

This is **not a portable Compose setup for macOS and Windows**. For a cross-platform setup, configure separate browser-facing and server-internal API base URLs so the browser uses `http://localhost:8000/api/v1` while the web container uses `http://api:8000/api/v1` to reach the API service. The Next.js analytics proxy must read the internal URL on the server side.

## API Endpoints

The API is versioned under `/api/v1`.

| Method | Endpoint                    | Purpose                             |
| ------ | --------------------------- | ----------------------------------- |
| `POST` | `/api/v1/events`            | Ingest browser analytics events     |
| `POST` | `/api/v1/server/events`     | Ingest server-side analytics events |
| `GET`  | `/api/v1/analytics/summary` | Analytics summary                   |
| `GET`  | `/api/v1/analytics/trends`  | Analytics trends                    |
| `GET`  | `/api/v1/analytics/pages`   | Analytics page statistics           |
| `GET`  | `/api/v1/analytics/events`  | Analytics event statistics          |
| `GET`  | `/api/v1/menu`              | Restaurant menu                     |
| `POST` | `/api/v1/orders`            | Create a restaurant order           |

Analytics read endpoints require the `X-Analytics-Read-Key` header. Server-side ingestion requires the server analytics key header configured by the API middleware. Browser event ingestion uses the browser write key header.

The Next.js dashboard proxy exposes the analytics GET endpoints through `/api/analytics/summary`, `/api/analytics/trends`, `/api/analytics/pages`, and `/api/analytics/events`.

## SDK Packages

### Browser SDK

Location: `packages/browser-sdk`

Build:

```bash
npm ci
npm run build
```

The SDK supports browser event tracking, page-view tracking, optional user identification, and custom event properties.

### PHP SDK

Location: `packages/php-sdk`

The PHP SDK provides a reusable client for sending server-side analytics events. The Laravel application includes its source through Composer autoload configuration.

## Useful Development Commands

### Laravel

Run tests:

```bash
cd apps/api
php artisan test
```

Clear cached configuration:

```bash
php artisan config:clear
```

Inspect routes:

```bash
php artisan route:list
```

### Next.js

Run the development server:

```bash
cd apps/web
npm run dev
```

Build the production application:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

## Security Notes

- Never commit `.env`, `.env.local`, credentials, private keys, production secrets, or database dumps.
- Keep `APP_DEBUG=false` in production.
- Use unique, securely generated analytics keys outside local development.
- Do not expose server-side analytics keys to browser code or use `NEXT_PUBLIC_` for secrets.
- Restrict access to analytics read endpoints and other sensitive API routes.
- Change the example MySQL credentials before deploying to a shared or production environment.
- Review configuration and authentication before exposing the application publicly.

## Troubleshooting

**Containers are not starting**

```bash
docker compose ps
docker compose logs --tail=100
```

**Database connection fails**

Confirm that MySQL is healthy and that the API uses `DB_HOST=mysql` inside Compose. When running Laravel directly on the host, use the host database address and port instead.

**The frontend cannot reach the API**

Confirm that the browser-facing `NEXT_PUBLIC_API_BASE_URL` points to `http://localhost:8000/api/v1` for local browser access. Do not set it to `http://api:8000/api/v1`; `api` is a Docker service hostname and is not normally resolvable by the host browser.

**The dashboard returns 502**

Check that the API is running, the dashboard proxy can reach the API from the Next.js server's network, and the API container logs show no errors. The browser-facing API URL and the server-internal API URL may need to be different in a bridged Docker setup.

**Analytics endpoints return 401**

Verify that the configured read key matches `ANALYTICS_READ_KEY` in the Laravel configuration and that the proxy sends the `X-Analytics-Read-Key` header.

## License

Add the license approved by the repository owner or organization before distributing this project.
