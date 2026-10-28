# Analytics Platform — Web Application

The frontend for Analytics Platform, built with Next.js and React. It provides the web interface and dashboard and communicates with the Laravel API.

For full project setup, including Docker, the database, worker, and SDK packages, see the repository root [`README.md`](../../README.md).

## Tech Stack

- Next.js
- React
- TypeScript
- Recharts
- `@analytics-platform/browser-sdk`

## Prerequisites

- Node.js version compatible with the project (the Docker image uses Node.js 24)
- npm
- The Analytics Platform API running locally, or the full Docker Compose environment

## Local Development

Run these commands from the repository root.

### 1. Install dependencies

```bash
cd apps/web
npm ci
```

If `npm ci` fails because the browser SDK's local package has not been built, follow the build instructions in `packages/browser-sdk/README.md` or the root README, then retry.

### 2. Configure environment variables

Create `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_ANALYTICS_WRITE_KEY=local-demo-write-key
ANALYTICS_READ_KEY=local-dashboard-read-secret-change-me
```

Use the matching development keys configured for your API. These values are for local development only. Do not put production secrets in `NEXT_PUBLIC_*` variables because those values can be exposed to browsers.

### 3. Start the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Ensure the Laravel API is running at `http://127.0.0.1:8000` and its database is configured before testing API-backed features.

## Production Build

From `apps/web`:

```bash
npm ci
npm run build
npm run start
```

The production server uses port `3000` by default.

## Available Scripts

| Command         | Purpose                              |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js development server |
| `npm run build` | Create a production build            |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run the configured lint checks       |

## Analytics API

The frontend uses the Laravel API for analytics data and application functionality. Dashboard read requests are handled by the Next.js API route under `src/app/api/analytics/[...path]/route.ts`.

The API uses an analytics read key for protected dashboard requests. Keep private read keys in server-side environment variables; never expose them through `NEXT_PUBLIC_*` variables.

## Troubleshooting

- **API requests fail:** Confirm the API and MySQL are running and that `NEXT_PUBLIC_API_BASE_URL` points to the correct API URL.
- **Dashboard requests return 401/403:** Check that `ANALYTICS_READ_KEY` matches the key configured by the API.
- **The browser SDK cannot be resolved:** Check the local SDK package and follow its build instructions.
- **Environment changes are not reflected:** Restart the Next.js development server after changing `.env.local`.

For complete installation instructions and Docker setup, use the root README.
