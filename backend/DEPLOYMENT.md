# Deployment and integration gates

The existing project is `carbon-canvas1` on Vercel and `carboncanvas`
(`nxgbmuaycudgyrxzbuks`, Mumbai) on Supabase. Do not create another project.
The application schemas and checksum migration history are installed. Private
tables are not exposed to Supabase anonymous/authenticated Data API roles.
Better Auth, not Supabase Auth, supplies the application's verified identity.

## Server environment

Use Vercel server-only environment variables. Never prefix a secret with `VITE_`.

| Variable | Requirement |
| --- | --- |
| `DATABASE_URL` | TLS PostgreSQL pooler URL for the non-owner `cc_runtime` role, not `postgres` or a service key |
| `DATABASE_SSL` | `true` in production |
| `DB_POOL_MAX` | Start with 3; monitor pooler/backend connection limits |
| `BETTER_AUTH_SECRET` | At least 32 random bytes, stable across instances |
| `BETTER_AUTH_URL` | Exact HTTPS app origin, without a path |
| `FRONTEND_ORIGIN` | The same exact origin for a same-origin deployment |
| `EMAIL_ENCRYPTION_KEY` | Independent 32-byte key encoded as 64 hex characters; retained while queued mail exists |
| `SMTP_URL` | Verified TLS SMTP sender connection |
| `EMAIL_FROM` | Address on the verified sender domain |
| `GEMINI_API_KEY` | Rotated Google AI Studio key, server only |
| `GEMINI_MODEL` | `gemini-3.8-flash` (default), or `gemini-3.5-flash-lite` |

Get the pooler host from **Supabase → carboncanvas → Connect**. It cannot be
reliably constructed from the region. Session pooling uses port 5432; transaction
pooling uses port 6543. Before selecting transaction pooling, verify that the
connection's search-path settings and all Better Auth queries work with that
mode. The runtime uses unnamed parameterised pg queries, not named prepared
statements; per-user RLS identity is transaction-local.

The runtime role is currently NOLOGIN until a scoped runtime password is
configured. Use `scripts/configure-runtime-role.js` with an owner connection
stored in `MIGRATION_DATABASE_URL` and a strong runtime password in the server-only
`DATABASE_URL`. The script reads that runtime URL's password. Never publish the
owner URL or add it to the Vercel runtime. The
pooled username uses `cc_runtime.PROJECT_REF`; preserve the real host from the
Connect dialog. Runtime startup rejects superuser, RLS-bypass and table-owner
connections. Use a verified root CA when required; never disable TLS checking.

## Email setup (Resend SMTP example)

1. Create a Resend account and verify a domain you own using its DNS instructions.
2. Create a sending-only key scoped to the verified domain.
3. Set `SMTP_URL=smtps://resend:URL_ENCODED_SENDING_KEY@smtp.resend.com:465`.
4. Set `EMAIL_FROM=CarbonCanvas <study@YOUR_VERIFIED_DOMAIN>`.
5. Test real verification and reset delivery before production promotion.

These values are examples, not working credentials. A Resend API key is not a
database host or password. Do not paste either kind of secret into chat.
Production auth requests make a bounded initial SMTP delivery attempt. Failed
messages remain encrypted in the outbox; run the documented mail worker on a
trusted worker host for retries. Vercel functions are not persistent worker
processes. Monitor queued failures and do not assume a queued message was sent.

Official guidance: [Resend SMTP](https://resend.com/docs/send-with-smtp),
[Supabase connections](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Frontend integration (no auth UI added)

The user explicitly retained backend-only authentication. Integrate an existing
login flow with the endpoints in README.md and use same-origin cookies.
Never submit a user ID or score as authority. No account access or cloud sync is
implied until that flow exists. Guest study, MCQs, answers, PDF cache and ink work
locally. Private AI tools intentionally cannot spend the provider quota without
a verified server session.

New protected endpoints:

- `POST /api/ai/generate`: `{kind, prompt}`; fixed server-side output schemas.
- `POST /api/ai/tutor`: `{history, message}`; bounded text history.
- `POST /api/ai/transcribe`: `{image}`; ink-only JPEG data URL under 2 MB.
- `POST /api/ai/grade`: `{paperId, reference, answer, confirmed:true}`; a specific
  subpart such as `1(a)(i)`, never a client rubric, document URL, user ID or marks.
- `GET /api/assessments`: the authenticated user's latest 100 assessments.

AI quota is shared PostgreSQL state: 6 requests per five minutes and 20 per
rolling 24 hours per verified user. OCR and grading each consume a request.
An advisory grade stores answer, scheme hash, model and feedback under owner RLS.
Low-confidence, mismatched or internally inconsistent output receives no score.
Model confidence is not a calibrated probability; teacher review remains needed.

## Deploy safely

`vercel.json` uses **Vercel Services (beta)** to ship the Vite frontend and Node
backend together. API routing precedes the frontend catch-all; the API receives
the original `/api/...` path. The backend is configured near the Mumbai database.
No migration runs on a function request, no public paper mirror is included and
no long-running local mail process is assumed to survive serverless execution.

Before production, build a protected preview using this repository and project,
configure its exact trusted origin, and verify browser → API → Supabase → response.
Test registration, real email verification/reset, login denial and duplicates,
logout/replayed cookies, expiry, RLS isolation, AI quota, actual handwritten OCR,
markscheme feedback and all retained views. Keep deployment protection enabled.
Only promote a tested deployment. Missing env values return a non-secret 503,
not an insecure anonymous fallback. A successful frontend build alone is not a
production-ready backend or a live integration test.
# Current deployment: guest testing

The user explicitly deferred sign-in and email. Set `GUEST_AI_ENABLED=true` in Vercel preview/production. This selects a separate guest app; account and private study-data endpoints return 404, and the original authenticated backend is retained unchanged for a future launch.

Required server configuration: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GUEST_LIMITER_URL=https://nxgbmuaycudgyrxzbuks.supabase.co/functions/v1/guest-ai-limiter`, and the exact HTTPS `FRONTEND_ORIGIN`. The current preview selects `gemini-3.6-flash` at the user's request. Production configuration is unchanged. No paid billing upgrade or silent model fallback is performed. Google still enforces provider quotas. Vercel's unique deployment, branch and production origins are also trusted through server system variables. Do not set `CC_DEV_MEMORY_QUOTA` on Vercel. No SMTP or application database password is needed in this mode.

Paper documents use a separate source-only allowance: 30/device/5 minutes, 100/device/day, 300/IP/day, 500 globally/day. `/api/papers/:id/document?kind=question|markscheme` accepts catalogue IDs only, checks SHA-256, and returns bounded PDFs. Optional `download=1` sends an attachment. No provider key is needed in the browser, no arbitrary URL proxy is exposed, and document requests do not consume the AI allowance. Warm-instance cache holds at most three checked PDFs; browser responses are private-cacheable. Source links/manual files remain fallbacks. The PDF.js legacy renderer and worker are from the same pinned package version for Safari compatibility.

`supabase/functions/guest-ai-limiter` verifies RS256 Vercel machine tokens against allowlisted JWKS and exact team/project/environment/subject claims. Supabase's default user-JWT gate is replaced by that custom machine authentication; browser callers cannot consume counters. The function uses automatically injected server-only Supabase credentials for the narrow `consume_guest_ai_budgets` RPC. RLS and revoked public function privileges prevent anonymous Data API access.

Budgets: 6 AI calls/device/5 minutes, 20/device/day; 12/IP/5 minutes, 60/IP/day; 200 globally/day. These are request caps, not monetary spend guarantees. Calls include transcription and grading separately. Failed/invalid requests may consume quota. Shared school IPs share an allowance. Cookie clearing cannot bypass the IP/global caps; no tracking fingerprint is collected. Only HMAC-hashed quota identifiers and counters are stored remotely. Gemini processes answers/images only on explicit AI requests; device-local storage is not a claim that model processing happens offline.

For local guest development only, use `NODE_ENV=development`, `GUEST_AI_ENABLED=true`, `CC_DEV_MEMORY_QUOTA=true`, `FRONTEND_ORIGIN=http://127.0.0.1:5173` and the server Gemini key in ignored `backend/.env.local`. Start backend with `npm start` and frontend with `npm run dev`. Memory quotas reset when this local process restarts. Production refuses this option.

Study progress, custom cards/reviews, answers, ink, cached PDFs and AI feedback remain on the browser device. There is no backup/sync; clearing storage or changing origin loses access. PDFs are capped at the 20 newest opened files. Download annotated work before clearing browser data. The following account/email deployment instructions apply only when guest mode is later disabled.

