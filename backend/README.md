# CarbonCanvas backend

Node 24.12+, Express 5.3, Better Auth 1.7.7 and PostgreSQL. The authentication implementation is backend-only; no sign-in/sign-up UI was added. Supabase is a supported PostgreSQL host, **not** the authentication provider in this implementation. Do not mix Supabase Auth JWTs with Better Auth sessions.

## Inspection result

The existing app is React 19 / TypeScript / Vite. Before this change it had no API server, database, authentication, or account isolation; progress and saved structures were in localStorage. This backend has an independent package/lockfile and does not depend on frontend components or styling.

## Supabase setup (user selected preparation, not account provisioning)

1. Create a Supabase project in your own account. Choose a region near the API host and a strong database password. No project was created automatically and no paid resource was purchased.
2. In **Connect**, copy the direct connection for migrations, or the session pooler when an IPv4-only host requires it. Prefer direct/session mode for this long-running Node service. Do not guess the pooler hostname.
3. Copy `backend/.env.example` to `backend/.env.local`. Keep `MIGRATION_DATABASE_URL` as the owner connection; use a separate `cc_runtime` role in `DATABASE_URL`. Percent-encode password characters in URLs. Generate a unique runtime password of at least 20 characters.
4. Generate secrets locally with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` for `BETTER_AUTH_SECRET`, and 32 bytes encoded as hex for `EMAIL_ENCRYPTION_KEY`. The latter must be 64 hex characters. Never paste either into a public issue, commit, or browser environment.
5. Set `DATABASE_SSL=true`; download the database root certificate from Supabase database settings if needed and set `DATABASE_CA_FILE` to its PEM path. TLS always validates the server certificate; there is no `rejectUnauthorized:false` escape hatch. Remove SSL URL parameters and use these explicit settings.
6. In `backend`, run `npm ci`, `npm run migrate`, then `npm run configure-runtime-role`. The latter reads the password from server-only DATABASE_URL and safely sets the dedicated role's login; it never prints it. For a Supabase pooler, copy its documented custom-role username format. Start `npm start` only with runtime credentials, never the owner/service-role key.
7. Configure a real `SMTP_URL` and verified `EMAIL_FROM`; run `npm run mail-worker` as a separate supervised process. Queueing without a worker cannot deliver verification or reset links.
8. Set `NODE_ENV=production`, exact HTTPS `BETTER_AUTH_URL` (API public origin) and `FRONTEND_ORIGIN`. Deploy same-site—ideally reverse-proxy `/api` on the frontend origin—to retain SameSite=Lax cookies. The Node service listens on loopback; terminate TLS at a trusted reverse proxy. Restrict origin-server network access to that proxy.

Official guidance: [Supabase connections and TLS](https://supabase.com/docs/guides/database/connecting-to-postgres), [Better Auth email/password](https://better-auth.com/docs/authentication/email-password), [sessions](https://better-auth.com/docs/concepts/session-management), [rate limits](https://better-auth.com/docs/concepts/rate-limit).

## Local PostgreSQL alternative

`compose.yaml` runs PostgreSQL 17 with UTF-8, a durable named volume, and loopback-only port. Set `POSTGRES_PASSWORD` privately, then `docker compose --env-file .env.local up -d postgres`. Set owner/runtime URLs for this database and `DATABASE_SSL=false` only for local development. Apply migrations/configure role as above. Docker was not installed here, so verification used the npm embedded PostgreSQL 18 distribution on Windows instead.

Do not run `docker compose down -v` unless you intend to erase the database volume. Tests create disposable, isolated clusters under the ignored root `.checks/` directory, shut them down, and leave their files for inspection; they never connect to your Supabase project or delete a production database.

## Security contract

- Better Auth handles salted scrypt password hashing. No application plaintext-password column, homemade JWT, or trusted frontend user ID.
- Session cookies are HttpOnly, SameSite=Lax and Secure in production; no domain-wide cookie sharing. Database session lookup is performed for every protected call; cookie caching is disabled for immediate logout/revocation. Fixed absolute expiry is seven days, with no sliding extension. Sign-in requires verified email.
- Verification links expire after one hour. Reset links expire after 15 minutes; identifier storage is hashed and reset revokes existing sessions. One-use reset behaviour is tested. Signup/reset responses avoid revealing whether an email exists.
- All mutations require an exact allowed Origin. Foreign origins and cross-site Fetch Metadata are rejected. CORS allows credentials only for the configured origins. JSON schemas reject extra userId/score fields, oversized bodies and malformed input. Better Auth also validates callback destinations.
- Rate limits are atomic PostgreSQL UPSERTs, shared across instances, keyed by HMAC rather than raw email/IP identifiers. Login is limited to five requests/minute per client address and ten/15 minutes per email; signup/reset/resend have their own limits. Accounts are not permanently locked by unauthenticated attempts. Limit failures are fail-closed; 429 includes retry information.
- Client IP comes from the socket unless `TRUSTED_PROXY_CIDRS` explicitly identifies your proxy. Arbitrary forwarded headers are stripped before the provider sees them. Never use `trust proxy=true`, wide CIDRs or client-supplied proxy headers on a directly reachable origin. Provider IPv6 normalization applies to authentication limits.
- `cc_auth` and `cc_app` are private schemas, not Supabase Data API schemas. Public/anon/authenticated roles receive no access. The dedicated runtime role is non-owner, non-superuser, and cannot bypass RLS; startup verifies this.
- Study tables have forced RLS. A transaction-local `cc.user_id` is set exclusively from the validated session; every query also filters ownership. Pool reuse cannot retain the transaction-local identity. Auth tables allow only the backend runtime role, which the library needs to perform sign-in.
- Parameterized SQL, bounded payloads, per-user API throttling and custom-card quotas. Optimistic study-state versions prevent silent cross-device overwrites. Authoritative practice scores use immutable server-side snapshots and cannot accept a submitted score.
- Mail links are encrypted with AES-256-GCM in a durable outbox; workers claim messages using SKIP LOCKED, retry transient failures and remove sent payloads. Monitor failed queues (eight attempts), SMTP delivery and age. Delivery is at-least-once, not guaranteed exactly-once. Retain old encryption keys until queues drain before rotation.
- Helmet, no-store responses, request IDs and redacted failure logs. Do not enable body/cookie/credential logging at a proxy or APM layer.

Before production, configure backups, monitor errors/queue depth/rate-limit events, enforce TLS, run dependency audits, apply a database retention/privacy policy and test real email deliverability. This is tested deployable code, not a security certification or an already-hosted production service.

## Endpoints

All POST/PUT/DELETE requests use JSON and an allowed Origin. Private endpoints use the session cookie (`credentials:'include'`).

| Endpoint                                               | Access               | Input/result                                                                                      |
| ------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------- |
| POST `/api/auth/sign-up/email`                         | Public, rate limited | `{name,email,password,callbackURL?}`; no auto-login; verify email                                 |
| POST `/api/auth/sign-in/email`                         | Public, rate limited | `{email,password,rememberMe?,callbackURL?}`; sets cookie                                          |
| POST `/api/auth/sign-out`                              | Cookie               | `{}`; revokes session and clears cookie                                                           |
| GET `/api/auth/get-session`                            | Cookie               | Provider session or null                                                                          |
| GET `/api/me`                                          | Private              | Safe user record and expiry, or 401                                                               |
| POST `/api/auth/send-verification-email`               | Public, rate limited | `{email,callbackURL?}`                                                                            |
| GET `/api/auth/verify-email?token=...`                 | Verification token   | Provider validates emailed token                                                                  |
| POST `/api/auth/request-password-reset`                | Public, rate limited | `{email,redirectTo?}`; generic response                                                           |
| POST `/api/auth/reset-password`                        | Reset token          | `{token,newPassword}`                                                                             |
| GET `/api/health`                                      | Public               | Database health only                                                                              |
| GET `/api/curricula`                                   | Public               | Module/source catalogue                                                                           |
| GET `/api/study/:course/:moduleId`                     | Public               | Fuller original notes and stable card IDs                                                         |
| GET/PUT `/api/study-state`                             | Private              | `{version,data:{course,completed,bookmarks,savedStructures,flashcardSettings?}}`; 409 on conflict |
| GET/POST `/api/cards`                                  | Private              | Query or body `{course,moduleId,front?,back?}`                                                    |
| DELETE `/api/cards/:id`                                | Private              | Own card only                                                                                     |
| GET/POST `/api/card-reviews`                           | Private              | `{course,moduleId,cardId,rating}`; rating 0–3, simple 0/1/3/7-day schedule                        |
| GET `/api/questions?course=...&moduleId=...&limit=...` | Private              | Questions without answer keys                                                                     |
| POST `/api/practice/sessions`                          | Private              | `{course,moduleId,count}`; creates immutable snapshot and ID                                      |
| POST `/api/practice/sessions/:id/submit`               | Private              | `{answers:[{questionId,answer}]}`; server score/feedback, idempotent completion                   |
| GET `/api/practice/history`                            | Private              | Own last 100 sessions/results                                                                     |
| GET/POST `/api/paper-attempts`                         | Private              | `{paperId,marks,maximum,feedback?}`; explicitly self-reported marks                               |
| GET `/api/papers?format=mcq&year=2026`                 | Public               | Checked paper metadata without answer keys                                                        |
| POST `/api/papers/:id/grade`                           | Private              | `{answers:{"1":"A"}}`; server-computed MCQ score, feedback and stored attempt                     |

Courses are `ALEVEL` and `IB`. Use module IDs from the catalogue, e.g. `ALEVEL-1` or `IB-S1.1`. Undergraduate is retired and new API requests for it return 400. Existing records are retained; migration 001 is not rewritten. The simple review schedule is not a calibrated spaced-repetition model.

## Frontend integration without an auth UI redesign

No auth components have been generated. Add API calls to an existing auth flow when you choose to provide one, or call the endpoints from your integration. Keep browser session tokens out of localStorage.

```js
// Same-origin reverse proxy is recommended. For local split ports use the API origin.
const API = "http://localhost:3001";
async function api(path, method = "GET", body) {
  const response = await fetch(API + path, {
    method,
    credentials: "include",
    ...(body
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(
      new Error(data.error || data.message || "Request failed"),
      { status: response.status },
    );
  return data;
}
await api("/api/auth/sign-up/email", "POST", {
  name,
  email,
  password,
  callbackURL: location.origin,
});
// After verification:
await api("/api/auth/sign-in/email", "POST", { email, password });
const { user } = await api("/api/me"); // Never submit user.id as the owner of writes.
const saved = await api("/api/study-state");
await api("/api/study-state", "PUT", {
  version: saved.version,
  data: studyData,
});
const session = await api("/api/practice/sessions", "POST", {
  course: "ALEVEL",
  moduleId: "ALEVEL-1",
  count: 10,
});
// Render public questions using existing components; do not use a browser-computed score.
await api(`/api/practice/sessions/${session.id}/submit`, "POST", { answers });
await api("/api/auth/sign-out", "POST", {});
```

Browsers supply Origin automatically. CLI clients must send the configured Origin header. Handle 400/401/403/409/429/503 explicitly; preserve input during network errors. A reset-link consumer should read the provider token and POST `/reset-password`; this turn intentionally does not add that frontend UI.

**Current website behaviour:** Practice and Study Hub now use the expanded local bank/content and guest browser persistence. They do not silently upload existing localStorage data or connect to an unconfigured Supabase project. The production auth/database APIs are ready for the documented authenticated integration; cloud synchronization is not yet live. Do not confuse local scores with protected server grades.

## Paper/content rights and grading

Original module recall remains separate from the checked CIE 9701 paper catalogue: 352 question papers, 2018–2026, with 63 complete 40-answer MCQ keys and 289 free-response/practical papers. Undergraduate and its MIT adaptations are no longer active. Paper PDFs remain source-hosted; no copyrighted document binaries or full question text are committed.

Cambridge papers appear as original PDF references in the website's Practice questions section, with separate MCQ/free-response format choices. A local-only PDF.js reader supports downloaded copies where native embedding fails; selected documents are not uploaded. IB remains external references. PapaCambridge's PDFs prohibit re-hosting. Sources were checked on 14 October 2026; no October/November 2026 folder was listed. Old papers may assess retired outcomes.

GET `/api/papers?format=mcq&year=2026&session=may-june` returns public metadata without answer keys. POST `/api/papers/:id/grade` requires a verified session and a body such as `{answers:{"1":"A","2":"C"}}`. Only question numbers 1–40 and A–D are accepted; no client user ID, score or grading method is accepted. Unanswered items score zero. The server computes feedback and stores a user-owned attempt. Run the additive, CLI-named `20261013232640_paper_grading_provenance.sql` through the existing backend migration runner before upgrading the API.

GET `/api/paper-attempts` includes the database `grading_method`: `markscheme-answer-key` for server grading, `self-reported` for the existing manual attempt endpoint. Do not infer provenance from arbitrary feedback text supplied by a client. The new column inherits the existing private schema, FORCE RLS, owner policy and index. No Supabase Data API roles are granted access.

The current frontend computes guest MCQ grades locally and saves answers/latest assessments per paper in localStorage; it is not yet connected to authenticated cloud APIs. Local scores can be edited and must not be treated as authoritative grades. FRQ grading is markscheme-guided self-assessment, not AI marking. No AI examiner or token-bearing scoring call is claimed. Structural checks do not replace educator review.

Credits: [PapaCambridge source catalogue](https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-chemistry-9701), [IB licensing](https://ibo.org/become-an-ib-school/ib-publishing/licensing/), [PDF.js](https://mozilla.github.io/pdf.js/), OpenStax references attached to each module. Scientific Agent Skills citation remains in the root README.

## Tests and operations

`npm test` uses a real isolated PostgreSQL cluster (not an in-memory SQL mock), the runtime role, RLS and real HTTP requests. Registration → encrypted queued mail → verification → sign-in → private data → logout/expiry/reset flows are tested. SMTP transport is a test stub: no messages are sent to real people. The tests never need your Supabase or SMTP credentials.

Run `npm run cleanup` daily from your scheduler for expired auth/rate records and old encrypted mail. It intentionally retains study history; choose and document the user's data retention/deletion policy before hosting. Run the API and mail worker under a supervisor, check `/api/health`, and alert on repeated delivery failures.
