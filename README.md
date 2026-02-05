# IndusLink

Full-stack Next.js + Express + MongoDB scaffold for a B2B MSME manufacturing discovery platform.

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

Add your MongoDB URI to `.env`.

3. Seed sample data (industries + machines)

```bash
npm run seed
```

4. Run locally

```bash
npm run dev:web
```

Optionally run the API separately if you want a dedicated API port:

```bash
npm run dev:api
```

Then set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` in `.env`.

## API Endpoints

- `GET /api/industries`
- `GET /api/industries/:slug`
- `GET /api/machines?industry=&subIndustry=&verified=true`
- `GET /api/machines/:id`
- `POST /api/auth/register-buyer`
- `POST /api/auth/register-msme`
- `POST /api/auth/login`

## Auth (Local Storage)

Login and registration store the user in local storage under `induslink_user`.
Portals are guarded on the client and will redirect to the appropriate login page if missing.

## Vercel

`vercel.json` routes `/api/*` to the Express handler in `api/index.js`.
