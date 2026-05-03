---
name: backend
description: Use when working in the Mayra Jewelry backend (Go 1.25, Gorilla Mux, GORM, PostgreSQL/Supabase, Cloudflare R2, VietQR, Resend). Apply for any handler, model, middleware, migration, performance work, secret rotation, authentication design, or — most importantly — payment recognition and reconciliation logic. The service handles real money via Vietnamese bank transfers and currently has no auth, exposed secrets, and a broken payment-confirmation path; correctness and safety come before features.
---

# Backend SKILL — Mayra Jewelry

A working agreement for any agent or engineer touching this Go service. Read it before changing code; revise it when the truths here drift.

This is a payments-handling system on a public network. Treat it that way: every endpoint is a potential entry point, every secret in plaintext is an incident, every untrusted input is hostile until validated. Performance matters, but correctness and safety come first.

---

## 1. Stack & where things live

- **Go 1.25**, Gorilla Mux router, gorilla/handlers for CORS + access logs ([main.go](main.go)).
- **GORM v1.31** + PostgreSQL driver, hosted on Supabase. DB init in [database/index.go](database/index.go), models in [database/models/](database/models/).
- **Cloudflare R2** (S3-compatible) for media — wrapper in [api/cloudflare/cloudflare.go](api/cloudflare/cloudflare.go).
- **VietQR** API for Vietnamese bank-transfer QR codes — wrapper in [api/vietqr/vietqr.go](api/vietqr/vietqr.go).
- **Resend** for transactional email.
- **AES-256-GCM** for payment-link encryption — [helpers/encryption.go](helpers/encryption.go).
- **In-memory session store** for short-lived payment state — [api/session/session.go](api/session/session.go). Lost on restart; do not put anything durable there.
- No auth, no Redis, no message queue, no observability stack today. All four are gaps.

Layout:
- `api/` — HTTP handlers grouped by domain (`admin.go`, `buyer.go`, `jewelry.go`, `order.go`, `payment.go`).
- `database/` — connection + GORM models + auto-migration.
- `helpers/` — generic utilities (encryption, slice ops, casts). Tests live alongside.
- `middleware/` — only response envelopes today.
- `models/` — non-persistent DTOs (VietQR payloads, encryption envelopes).

---

## 2. Critical bugs — fix before anything else

These are not opinions. They are defects that will hurt real customers.

1. **Payment confirmation never updates the right order.** [api/admin.go](api/admin.go) decrypts the payload into `encryptionData` but the local `orderId` and `buyerId` variables are declared and *never assigned* from it before being used in the GORM `Where` clause. The query runs against empty strings and silently no-ops. Wire `encryptionData.OrderId` → `orderId`, `encryptionData.BuyerId` → `buyerId`, and add an explicit error check on the `Find` result so a missing match fails loudly.
2. **`.env` is committed with live credentials** — Cloudflare R2 secret, VietQR API key, Resend API key, Supabase Postgres URI with password, merchant bank account. Section 4 covers the rotation procedure; treat this as an incident.
3. **No authentication.** Every endpoint is public, including `POST /api/jewelry` (creates inventory), `PATCH /api/jewelry` (mutates inventory), `POST /api/payment/confirm-payment` (marks orders paid), and `GET /api/user/buyer/{buyerId}` (returns any buyer's profile + wishlist). Section 5 covers the fix.
4. **GORM `.Debug()` is enabled in production** ([database/index.go:45](database/index.go#L45)). Every SQL statement, including bound parameters, is written to stdout. Disable it; gate verbose logging behind an env flag.
5. **`PATCH /api/jewelry`** ([api/jewelry.go](api/jewelry.go)) accepts arbitrary column names from form input and writes them to the DB — including `directory_id` (the primary key). Whitelist updatable fields explicitly.
6. **`UpsertBuyerDetails`** in [api/buyer.go](api/buyer.go) mass-assigns request fields. Same fix: whitelist.
7. **Mayra-points calculation** in [api/admin.go](api/admin.go) uses the first price row regardless of which variation the order actually contains. Join through `OrderJewelryItem` and read the matching `JewelryPrice` row.

Open these as issues today and link to them from PRs.

---

## 3. Coding standards (non-negotiable)

1. **Errors are values; check every one.** No silent `_ =`. If the result is genuinely uninteresting, comment why. GORM calls return an error in `result.Error` — check it.
2. **No fatal-on-startup-from-env.** [main.go:24](main.go#L24) uses `log.Fatal(env_err)`. Production reads from process env, not a dotfile; loading `.env` should be best-effort and only when present (`if _, err := os.Stat(".env"); err == nil { godotenv.Load() }`). Required env vars should be validated explicitly with named messages.
3. **Structured logging.** Replace stdlib `log` with `slog`. One logger per request, propagated via `context.Context`, with a request-ID middleware feeding it. Never log secrets or full request bodies.
4. **Context everywhere.** Every handler gets `r.Context()`; pass it to GORM (`db.WithContext(ctx)`), to the AWS SDK, to outbound HTTP. Today nothing is cancellable, which means a slow client holds a goroutine + a DB connection.
5. **Validation library.** Add `go-playground/validator/v10` and define DTOs per endpoint. Manual `r.FormValue` checks are inconsistent across handlers. Bind, validate, then operate.
6. **Stop using multipart for non-file payloads.** Buyer upsert, wishlist add/remove, and order request all use `multipart/form-data` for plain JSON. Switch to JSON bodies; reserve multipart for the few real upload endpoints.
7. **No `interface{}` / `any` without a comment.** Where you need it (helpers), keep the surface tiny and tested.
8. **Tests are required for new helpers and any payment-touching code.** The repo already has `helpers/*_test.go` — extend that pattern. Use a real Postgres in tests via testcontainers; do not mock GORM.
9. **One handler = one responsibility.** Don't sprawl a single domain across files. Keep `admin.go` thin — it's the most security-critical file and must be readable end-to-end.
10. **Comment only the non-obvious.** Explain *why* a UPSERT is required, not *that* it's a UPSERT.

---

## 4. Secrets — industry-standard handling

**Today is broken.** `.env` is in git history, with real keys. Steps, in order:

1. **Rotate every secret listed in [.env](.env).** Cloudflare R2 access/secret keys, VietQR client-id + api-key, Resend API key, Supabase database password, `AUTH_SECRET` on the frontend. Do this through each provider's dashboard before anything else.
2. **Purge the file from git history** with `git filter-repo --path backend/.env --invert-paths` (or `bfg`), then force-push. Re-clone everywhere.
3. **Strengthen [.gitignore](.gitignore):** add `.env`, `.env.*`, `!.env_sample`, `tmp/`, `*.log`, `.DS_Store`. Today it lists only `.env` — but the file was committed before the rule, hence why it stayed.
4. **Local dev:** developers keep credentials in `.env.local` (gitignored). The Dockerfile and `docker-compose.yml` should mount the host's env, not bake it in.
5. **Production:** secrets come from a real secret manager — Doppler, AWS Secrets Manager, or Fly/Render/Railway native vars. The container reads `os.Getenv` at start; the platform injects.
6. **CI:** add `gitleaks` (or `trufflehog`) as a required check. Pre-commit hook on developer machines too.
7. **Audit the email path.** [api/buyer.go](api/buyer.go) interpolates customer-supplied fields into the admin-notification email body via `fmt.Sprintf`. Use Resend's templating with parameterized variables, or HTML-escape every user value. Otherwise it's email-injection (HTML or header).

**Naming convention:** anything ending in `_KEY`, `_SECRET`, `_PASSWORD`, `_URI` is sensitive. Anything ending in `_ID`, `_URL`, `_NAME` may be public. Be explicit; reviewers shouldn't have to guess.

---

## 5. Authentication & authorization (do this once secrets are rotated)

The frontend authenticates with NextAuth + Facebook OAuth. The backend trusts whatever ID arrives in the URL. That's not authentication — it's a suggestion.

**Target architecture (one focused PR):**

1. **Backend issues no tokens of its own.** Trust the frontend's NextAuth-issued session JWT. Add a `JWT_SHARED_SECRET` (or move NextAuth to RS256 and verify with the public key — preferred long-term).
2. **Auth middleware** mounted on every `/api/...` route except `GET /api/jewelry/**` (catalog browsing) and `GET /api/payment/banks` (static reference). It validates the JWT, parses claims into a `User{ID, Email, Role}`, and attaches to `r.Context()`.
3. **Authorization middleware** layered on top: a route declares "buyer-self" (only the buyer in the URL may call), "admin", or "public". Today every `/api/user/buyer/{buyerId}/...` is an IDOR — anyone can read anyone's wishlist and orders. Force `claims.Sub == buyerId` for those.
4. **Admin endpoints** (`POST/PATCH /api/jewelry`, `POST /api/payment/confirm-payment`) require `claims.Role == "admin"`. Until SSO exists, gate them behind a separate `ADMIN_API_KEY` header verified in middleware — explicit, rotatable, and not part of the normal user flow.
5. **Rate limiting** with `golang.org/x/time/rate` per-IP and per-user, tighter on `/api/payment/qr` and `/api/user/buyer/payment/pending-verification`. The current 5-second per-buyer throttle in [api/session/session.go](api/session/session.go) is a hack and depends on an in-memory map that doesn't survive restarts or multiple replicas.
6. **CSRF**: not relevant for a JSON API authenticated by `Authorization: Bearer`. It *is* relevant if cookies are used. Pick one model and stick to it — bearer tokens are simpler here.

---

## 6. Payment recognition — the core design problem

The shop accepts Vietnamese bank transfers via VietQR. There is **no payment webhook** and **no automated reconciliation**. Today an admin must read the email, click the encrypted link, and trust that the buyer actually transferred the money. That's not scalable, not auditable, and (because of the bug in section 2) doesn't even update the order correctly.

The hard constraint: **VietQR generates QR codes; it does not notify on payment.** Vietnamese banks vary in webhook support — Techcombank, MB Bank, ACB, OCB expose APIs for their own customers; Vietcombank generally does not. Build something that works around the constraint.

**Layered solution — implement in this order, each layer independently improves the system:**

### Layer 1 — Reliable payment references (≈ 1 day)

- Generate a short, unique reference per order on creation: e.g., `MAYRA-{8-char-base32}` — short enough to fit a bank transfer memo (banks limit memos to ~50 chars), unique across orders.
- Store on `Order` in a new column `payment_reference` with a UNIQUE index.
- Pass it as `info` to VietQR in [api/payment.go](api/payment.go) so the QR-encoded transfer pre-fills the memo. Today `info` is a free-text URL parameter; tighten it.
- On the order confirmation page, show the reference prominently with a copy button — buyers who type the memo manually need it visible.

This single change makes every other layer possible.

### Layer 2 — Transaction ledger + manual reconciliation UI (≈ 2 days)

- New table `payment_transactions`: `id`, `external_id` (bank txn id, nullable), `amount`, `memo`, `received_at`, `matched_order_id` (FK, nullable), `source` (`manual` | `webhook` | `polling` | `ocr`), `created_at`.
- Admin endpoint to **upload a bank statement CSV** (or paste a transaction list). Parse, insert into `payment_transactions`, run a matcher: regex memo against `Order.payment_reference`, check amount within tolerance, update both records. Anything unmatched stays in a queue for manual review.
- Admin UI shows three queues: matched (auto-confirmed), suspected (memo or amount mismatch), unmatched. One-click resolve from there.
- Idempotency: `(external_id)` is UNIQUE; the same statement uploaded twice does not double-confirm.

This replaces the current emailed-encrypted-link flow as the primary path. The encrypted-link flow can remain as a fallback for one-off cases but should not be the default.

### Layer 3 — Bank-API polling where available (≈ 1 week)

- For banks that expose APIs (MB Bank Open API, Techcombank, OCB), implement a polling worker (a goroutine started from `main.go`, cancelled on shutdown) that pulls the last N hours of transactions on a 5-minute cadence and feeds them through the same matcher as Layer 2.
- Configuration per bank in env: `BANK_MB_API_KEY`, etc. One adapter per bank behind a `BankProvider` interface.
- Fall back gracefully: if a bank API is unreachable, log + continue. The Layer 2 manual upload remains the safety net.

### Layer 4 — OCR for screenshot proof (optional, ≈ 3 days)

- Buyers sometimes upload a screenshot of their banking app's confirmation. Add an endpoint that accepts an image, runs Tesseract (or a paid OCR API) over it, extracts amount + reference + timestamp, creates a `payment_transactions` row with `source='ocr'` flagged for human review, and links it to the order.
- This is convenience, not authority — never auto-confirm from OCR alone. Always require admin sign-off on OCR-sourced payments.

### Cross-cutting requirements for all layers

- **State machine on `Order.Status`**: enforce valid transitions (`pending → verified`, `pending → failed`, `verified → shipped`, `pending → cancelled`). Reject illegal transitions in a single helper, not at every callsite. Today the column accepts any string.
- **Payment timeout job**: a daily cron that moves orders `pending` for > 24h (or 72h on weekends) to `failed-verification` and emails the customer. Today they sit forever.
- **Idempotency on confirmation**: confirming a `verified` order should be a no-op, not a stat double-up. Wrap confirmation in a transaction that re-reads the row inside the lock and aborts if `Status != 'pending-verification'`.
- **Audit table**: every payment-status transition writes a row with `who`, `when`, `from_status`, `to_status`, `transaction_id`. Non-negotiable for a real merchant.

---

## 7. Performance discipline

Targets: catalog responses < 200ms p95 cold, < 50ms warm.

**Fix the obvious N+1s first** — they dominate every other concern:

1. **`getMediaFilesAndUpdateResponsePayload`** ([api/jewelry.go](api/jewelry.go)) calls Cloudflare `ListObjects` and `GetPresignedUrl` per item. For a 50-item catalog page, that's 50+ S3 round-trips. Two fixes, do both:
   - Cache presigned URLs in Redis keyed by `(item_id, variant)` with a TTL just under the URL's expiration.
   - Store the manifest of media keys *in Postgres* alongside the item. R2 then becomes a CDN-fronted blob store, not a queryable index. Generate presigned URLs in batch (the AWS SDK supports parallelism — use `errgroup` with bounded concurrency).
2. **`GetOrdersByBuyerId`** ([api/order.go](api/order.go)) loads orders, then loops fetching jewelry items per order, then loops calling S3 per item. Use GORM `Preload("OrderJewelryItems.JewelryItem")` to collapse it into one DB round-trip, then resolve media in one parallel S3 batch.
3. **`GetBuyer`** ([api/buyer.go](api/buyer.go)) does the same per-wishlist-item S3 dance. Same fix.

**Database:**
- Add explicit indexes via migration:
  - `orders(buyer_id, created_at DESC)` — buyer order history.
  - `orders(status)` — pending-payment scans.
  - `orders(payment_reference)` UNIQUE — once Layer 1 ships.
  - `jewelry_items(feature_collection)` — feature filtering.
- Configure connection pool in [database/index.go](database/index.go): `sqlDB.SetMaxOpenConns(20)`, `SetMaxIdleConns(5)`, `SetConnMaxLifetime(30*time.Minute)`. GORM defaults are too generous for Supabase's pooler.
- Disable `.Debug()` (already in section 2). Wrap GORM logger with `slog` at WARN.
- Pagination on `GET /api/jewelry` is missing — keyset pagination on `directory_id` (preferred over LIMIT/OFFSET) before the catalog grows past a few hundred items.

**Caching layer:**
- Add Redis. Cache: VietQR bank list (24h TTL — it's static), feature collections (5m TTL, invalidate on PATCH), presigned R2 URLs (TTL just under expiry).
- Use `singleflight` (`golang.org/x/sync/singleflight`) around cache-miss work so a thundering herd on a popular item issues one S3 call, not a hundred.

**Concurrency:**
- File uploads in [api/jewelry.go](api/jewelry.go) are sequential. Use `errgroup` with `SetLimit(4)` to upload in parallel without saturating R2.
- Outbound calls to VietQR and Resend should use a shared `http.Client` with `Timeout: 10*time.Second` and connection pooling — today each call appears to use the package-level default.

**Background jobs:**
- The payment timeout job, polling workers (Layer 3), and email retries belong in goroutines spawned from `main.go` with proper shutdown via a parent context. When you outgrow that, move to a real worker (River, Asynq, or Temporal).

---

## 8. Deployment & operability

- **Dockerfile** runs as root and `air` (live reload) is the entrypoint. Build a separate production stage: multi-stage `FROM golang:1.25 AS build` → static binary → `FROM gcr.io/distroless/static`. Add a non-root `USER`. Drop `air` from prod.
- **Graceful shutdown**: [main.go](main.go) calls `srv.ListenAndServe()` and never traps signals. On SIGTERM the pod gets killed mid-request. Use the canonical `signal.NotifyContext` + `srv.Shutdown(ctx)` pattern.
- **Healthcheck**: add `GET /healthz` (always 200) and `GET /readyz` (200 only when DB ping succeeds). Hook them into `docker-compose.yml` and the platform.
- **Access logs**: gorilla's `CombinedLoggingHandler` writes Apache combined format to stdout. Switch to JSON via `slog`, include request ID, status, latency, route pattern (not raw URL — no PII).
- **Metrics**: expose Prometheus on `/metrics` once you have a metrics target. RED metrics (Rate / Errors / Duration) per route, plus a counter on payment-status transitions.

---

## 9. Security checklist (run this against every PR that touches a handler)

- [ ] Does the route require auth? If yes, is the middleware applied?
- [ ] Does the handler enforce that `claims.Sub` matches any user ID in the path?
- [ ] Is every input validated with `validator` tags (length, format, range)?
- [ ] Are mutable columns whitelisted (no mass-assignment from form/JSON)?
- [ ] Are GORM queries parameterized (no string-concat into `Where`)?
- [ ] Is any user input interpolated into an email body, log line, or SQL — and HTML/SQL/log-escaped if so?
- [ ] Are presigned URLs given a short expiration (≤ 1h for write, ≤ 24h for read)?
- [ ] Is the response going through [middleware/index.go](middleware/index.go), not raw `w.Write`?
- [ ] If touching payment: idempotent? state-machine guarded? audit-logged?

---

## 10. Definition of done (per PR)

1. `go vet ./...` and `staticcheck ./...` clean.
2. `go test ./... -race` passes.
3. New endpoints: validator tags, auth middleware, audit log if state-mutating.
4. New env vars: documented in [.env_sample](.env_sample), not [.env](.env).
5. No new `log.Fatal` in request paths. No new `log.Println` of secrets, tokens, or full bodies.
6. If touching payment, order, or auth: PR description includes a numbered test scenario covering happy path + at least one failure path, and links to the issue from section 2 if it relates.
7. SQL changes ship as a versioned migration file, not a tweak to the GORM struct alone. (Add `golang-migrate` — `AutoMigrate` is fine for dev, dangerous for prod schema changes.)
