# Analytics Platform — API

The backend API for Analytics Platform, built with Laravel and MySQL. It receives analytics events, exposes analytics data, supports server-side event ingestion, and provides application endpoints used by the web frontend.

For full monorepo setup and Docker instructions, see the repository root [`README.md`](../../README.md).

## Tech Stack

- PHP
- Laravel
- MySQL
- Composer
- Database-backed queue worker
- `packages/php-sdk`

## Prerequisites

For local development:

- PHP version supported by `composer.json` (PHP 8.3 or later)
- Composer
- MySQL
- Node.js and npm if you need to run the API's frontend asset tooling

For containerized development, Docker and Docker Compose are sufficient.

## Environment Configuration

Create a local environment file:

```bash
cp .env.example .env
```

Run this command from `apps/api`. If `.env.example` is not present, create a safe example file before following this setup; do not copy a real developer's `.env` into version control.

Review the database settings and analytics keys in `.env`. For a local MySQL instance, configure the appropriate database host, port, database name, username, and password.

Generate an application key:

```bash
php artisan key:generate
```

Keep `.env` private. Do not commit application keys, database passwords, or production analytics secrets.

## Local Development

Run the commands below from `apps/api`.

### 1. Install PHP dependencies

```bash
composer install
```

### 2. Create and configure the database

Create the database configured in `.env`, then verify the connection settings.

### 3. Run migrations

```bash
php artisan migrate
```

### 4. Start the API

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 5. Run the queue worker

In a separate terminal, from `apps/api`:

```bash
php artisan queue:work database --sleep=3 --tries=3 --timeout=90
```

The worker requires the configured database and queue tables to be available.

## Docker Development

The recommended full-stack setup is managed by the root `docker-compose.yml`. Start from the repository root and follow the root README.

The Compose environment configures MySQL and supplies container-specific database settings to the API and worker. Do not replace those settings with `127.0.0.1` inside the API container: use the Compose service hostname for the database.

## API Endpoints

The API routes are grouped under `/api/v1`.

| Method | Endpoint                    | Purpose                                  |
| ------ | --------------------------- | ---------------------------------------- |
| `POST` | `/api/v1/events`            | Receive browser analytics events         |
| `POST` | `/api/v1/server/events`     | Receive authenticated server-side events |
| `GET`  | `/api/v1/analytics/summary` | Retrieve analytics summary               |
| `GET`  | `/api/v1/analytics/trends`  | Retrieve analytics trends                |
| `GET`  | `/api/v1/analytics/pages`   | Retrieve page analytics                  |
| `GET`  | `/api/v1/analytics/events`  | Retrieve event analytics                 |
| `GET`  | `/api/v1/menu`              | Retrieve menu data                       |
| `POST` | `/api/v1/orders`            | Create an order                          |

Protected analytics read requests use the `X-Analytics-Read-Key` header. Server-side event ingestion uses the configured server analytics key. Browser event ingestion uses the configured write key.

Use the project's route definitions and middleware as the source of truth if endpoint behavior or authentication requirements change.

## Useful Commands

Run these from `apps/api`:

```bash
# List registered routes
php artisan route:list

# Run database migrations
php artisan migrate

# Run migrations in a fresh local database
php artisan migrate:fresh

# Run tests
php artisan test

# Clear cached application configuration
php artisan config:clear
```

**Warning:** `php artisan migrate:fresh` drops existing tables and data. Use it only with a disposable development database.

## Security Notes

- Never commit `.env` files or production secrets.
- Keep `APP_DEBUG=false` in production.
- Use unique, strong keys for production analytics ingestion and read access.
- Do not expose private analytics keys in frontend JavaScript or `NEXT_PUBLIC_*` variables.
- Rotate any credential that has been exposed outside its intended environment.

## Troubleshooting

- **Database connection errors:** Verify MySQL is running and the `.env` values match your database.
- **Missing application key:** Run `php artisan key:generate` after creating `.env`.
- **Migrations fail:** Confirm the database exists and the configured user has the required permissions.
- **Queued work is not processed:** Start the queue worker and check the queue configuration.
- **API requests are unauthorized:** Verify the correct analytics key and authentication header are being used.

For complete project setup, refer to the root README.
