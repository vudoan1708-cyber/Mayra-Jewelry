# Mayra Jewelry

A jewelry e-commerce site with a public storefront, multilingual UI, an admin CMS for managing products and banners, and a payment flow built around VietQR. The repository is a monorepo with two top-level applications:

- [`backend/`](backend/) — Go 1.25 API (Gorilla mux + GORM) backed by PostgreSQL, with Cloudflare R2 for media, Resend for transactional email, VietQR for payment QR generation, and JWT + TOTP for admin authentication.
- [`frontend/`](frontend/) — Next.js 15 (App Router, React 19, TypeScript, Tailwind) storefront with NextAuth (Facebook), `next-intl` for i18n, and Three.js / Framer Motion / GSAP for the interactive product experience.

## Prerequisites

Install the following on your machine before setting up the project:

- **Node.js 20+** and **npm** — used by the root, `frontend/`, and the `backend/` dev wrapper.
- **Docker** and **Docker Compose** — the backend dev server runs in a container via [`backend/docker-compose.yml`](backend/docker-compose.yml).
- **Go 1.25+** — only needed if you intend to run or build the backend outside Docker. The Docker image already bundles Go and `air` for live reload.
- **Git**.

You will also need accounts and credentials for the third-party services listed under [APIs and integrations](#apis-and-integrations).

## Repository layout

```
Mayra-Jewelry/
├── backend/      # Go API (Docker-based dev workflow)
├── frontend/     # Next.js 15 app
└── package.json  # Root workspace runner (concurrently)
```

The root [`package.json`](package.json) exposes convenience scripts that fan out into each app:

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs backend and frontend in parallel via `concurrently`. |
| `npm run dev:backend` | Runs only the backend (`docker compose up`). |
| `npm run dev:frontend` | Runs only the frontend (`next dev`). |

## Setup

### 1. Clone and install root dependencies

```bash
git clone <repo-url> Mayra-Jewelry
cd Mayra-Jewelry
npm install
```

### 2. Install application dependencies

```bash
npm --prefix frontend install
npm --prefix backend install
```

The backend's npm package only contains a small dev helper (`chokidar`); the actual Go modules are downloaded inside the Docker image via `go mod download`.

### 3. Configure environment variables

Each app has its own `.env_sample` file. Copy it to `.env` and fill in the values for your environment.

```bash
cp backend/.env_sample backend/.env
cp frontend/.env_sample frontend/.env
```

Variables you need to populate are documented below. **Never commit real secrets** — `.env` files are gitignored.

### 4. Start the dev servers

From the repo root:

```bash
npm run dev
```

This starts:

- The backend API at `http://localhost:8080` (Docker container, live-reload via `air`).
- The frontend at `http://localhost:3000` (Next.js dev server).

Make sure `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env` points at the backend (default `http://localhost:8080`) and `FRONTEND_URL` in `backend/.env` points at the frontend origin so CORS is allowed.

## APIs and integrations

The project depends on several external services. Create the accounts, then drop the keys into the matching env variables.

### Backend ([`backend/.env`](backend/.env_sample))

#### Database — Supabase (PostgreSQL)

The backend connects to PostgreSQL via GORM. Supabase is the default host.

- Create a project at [supabase.com](https://supabase.com).
- Use the **Connection string** (URI format) from *Project Settings → Database*.
- Copy the **publishable** API key from *Project Settings → API*.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_CONNECTION_URI` | Postgres connection URI used by GORM. |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) API key. |

GORM auto-migrates the schema on startup (see [`backend/main.go`](backend/main.go)).

#### Object storage — Cloudflare R2

Product images and media are uploaded to an R2 bucket via the AWS S3 SDK.

- Create a bucket in the Cloudflare dashboard under **R2**.
- Generate an **R2 API token** with read/write access to that bucket.
- Either attach a custom domain or enable the bucket's public `r2.dev` URL for read access.

| Variable | Purpose |
| --- | --- |
| `CLOUDFLARE_BUCKET_NAME` | R2 bucket name. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID. |
| `CLOUDFLARE_ACCESS_KEY` | R2 access key ID. |
| `CLOUDFLARE_SECRET_KEY` | R2 secret access key. |
| `CLOUDFLARE_TOKEN_VALUE` | R2 API token value. |
| `CLOUDFLARE_PUBLIC_BUCKET_URL` | Public read URL (custom domain or `pub-<hash>.r2.dev`), no trailing slash. |

#### Payments — VietQR

VietQR is used to generate bank-transfer QR codes during checkout.

- Register at [vietqr.io](https://vietqr.io) and create an API client.
- Pick a QR template and note your bank's BIN.

| Variable | Purpose |
| --- | --- |
| `VIETQR_CLIENT_ID` | VietQR client ID. |
| `VIETQR_API_KEY` | VietQR API key. |
| `VIETQR_ACCOUNT_NAME` | Receiving account holder name. |
| `VIETQR_ACCOUNT_NO` | Receiving account number. |
| `VIETQR_BIN` | Bank BIN code. |
| `VIETQR_TEMPLATE_ID` | VietQR template identifier. |

#### Transactional email — Resend

Order and admin notifications are delivered through Resend.

- Sign up at [resend.com](https://resend.com), verify a sending domain, and create an API key.

| Variable | Purpose |
| --- | --- |
| `MERCHANT_EMAIL` | Address that receives merchant-side notifications. |
| `RESEND_API_KEY` | Resend API key. |

#### Admin auth — JWT + TOTP

The admin CMS uses HS256-signed JWTs and stores TOTP secrets encrypted at rest. Generate two independent 32-byte base64 secrets:

```bash
head -c 32 /dev/urandom | base64   # ADMIN_JWT_SECRET
head -c 32 /dev/urandom | base64   # ADMIN_TOTP_ENCRYPTION_KEY
```

| Variable | Purpose |
| --- | --- |
| `ADMIN_JWT_SECRET` | Signs admin JWTs (HS256). |
| `ADMIN_TOTP_ENCRYPTION_KEY` | Encrypts admin TOTP secrets at rest. |

#### Misc backend variables

| Variable | Purpose |
| --- | --- |
| `FRONTEND_URL` | Allowed CORS origin for the API. |

### Frontend ([`frontend/.env`](frontend/.env_sample))

#### Backend wiring

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the Go API (e.g. `http://localhost:8080`). |
| `NEXT_PUBLIC_SITE_URL` | Public origin of the frontend (used for absolute links and metadata). |
| `CLOUDFLARE_PUBLIC_BUCKET_URL` | Same R2 public URL as the backend; used by Next's `images.remotePatterns` in [`next.config.mjs`](frontend/next.config.mjs). |

#### Authentication — NextAuth + Facebook OAuth

The storefront signs users in with Facebook via `next-auth` v5.

- Create an app at [developers.facebook.com](https://developers.facebook.com).
- Enable **Facebook Login** and add your callback URL (`<NEXT_PUBLIC_SITE_URL>/api/auth/callback/facebook`).
- Generate `AUTH_SECRET` per the [Auth.js installation guide](https://authjs.dev/getting-started/installation).

| Variable | Purpose |
| --- | --- |
| `AUTH_FACEBOOK_ID` | Facebook app ID. |
| `AUTH_FACEBOOK_SECRET` | Facebook app secret. |
| `AUTH_SECRET` | Auth.js encryption secret. |

#### Live chat — Tawk.to

- Create a property at [tawk.to](https://tawk.to) and grab the property ID and widget ID from your dashboard.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_TAWK_PROPERTY_ID` | Tawk.to property ID. |
| `NEXT_PUBLIC_TAWK_WIDGET_ID` | Tawk.to widget ID. |

## Useful commands

```bash
# Frontend
npm --prefix frontend run dev      # next dev
npm --prefix frontend run build    # next build
npm --prefix frontend run lint     # eslint .

# Backend
npm --prefix backend run dev       # docker compose up (live-reload via air)
docker compose -f backend/docker-compose.yml down   # stop the container
```
