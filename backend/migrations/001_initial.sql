-- Better Auth 1.7.7 core schema in a non-Data-API schema.
DO $$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='cc_runtime') THEN CREATE ROLE cc_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS; END IF; END $$;
CREATE SCHEMA cc_auth;
CREATE SCHEMA cc_app;
REVOKE ALL ON SCHEMA cc_auth,cc_app FROM PUBLIC;
GRANT USAGE ON SCHEMA cc_auth,cc_app TO cc_runtime;
CREATE TABLE cc_auth."user" (
  id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false, image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX user_email_case_insensitive ON cc_auth."user"(lower(email));
CREATE TABLE cc_auth.session (
  id text PRIMARY KEY, token text NOT NULL UNIQUE, "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES cc_auth."user"(id) ON DELETE CASCADE
);
CREATE INDEX session_user_id_idx ON cc_auth.session("userId");
CREATE INDEX session_expiry_idx ON cc_auth.session("expiresAt");
CREATE TABLE cc_auth.account (
  id text PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES cc_auth."user"(id) ON DELETE CASCADE,
  "accessToken" text, "refreshToken" text, "idToken" text,
  "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz,
  scope text, password text, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("providerId","accountId")
);
CREATE INDEX account_user_id_idx ON cc_auth.account("userId");
CREATE TABLE cc_auth.verification (
  id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL, "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX verification_identifier_idx ON cc_auth.verification(identifier);
CREATE INDEX verification_expiry_idx ON cc_auth.verification("expiresAt");
CREATE TABLE cc_auth.request_limits (key text PRIMARY KEY,count integer NOT NULL,expires_at timestamptz NOT NULL);
CREATE INDEX request_limits_expiry_idx ON cc_auth.request_limits(expires_at);
CREATE TABLE cc_auth.mail_outbox (
  id uuid PRIMARY KEY, payload text, fingerprint text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz,
  attempts integer NOT NULL DEFAULT 0, locked_until timestamptz, next_attempt_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mail_pending_idx ON cc_auth.mail_outbox(next_attempt_at) WHERE sent_at IS NULL;

CREATE TABLE cc_app.study_state (
  user_id text PRIMARY KEY REFERENCES cc_auth."user"(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}', version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE cc_app.cards (
  id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES cc_auth."user"(id) ON DELETE CASCADE,
  course text NOT NULL CHECK(course IN ('ALEVEL','IB','UNDERGRAD')),
  module_id text NOT NULL, front text NOT NULL, back text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cards_owner_module_idx ON cc_app.cards(user_id,course,module_id);
CREATE TABLE cc_app.card_reviews (
  id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES cc_auth."user"(id) ON DELETE CASCADE,
  card_id text NOT NULL, course text NOT NULL, module_id text NOT NULL,
  rating integer NOT NULL CHECK(rating BETWEEN 0 AND 3), reviewed_at timestamptz NOT NULL DEFAULT now(), due_at timestamptz NOT NULL
);
CREATE INDEX reviews_due_idx ON cc_app.card_reviews(user_id,due_at);
CREATE TABLE cc_app.practice_sessions (
  id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES cc_auth."user"(id) ON DELETE CASCADE,
  course text NOT NULL, module_id text NOT NULL, questions jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '2 hours',
  submitted_at timestamptz, result jsonb
);
CREATE INDEX practice_owner_created_idx ON cc_app.practice_sessions(user_id,created_at DESC);
CREATE TABLE cc_app.paper_attempts (
  id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES cc_auth."user"(id) ON DELETE CASCADE,
  paper_id text NOT NULL, marks numeric NOT NULL CHECK(marks>=0), maximum numeric NOT NULL CHECK(maximum>0 AND maximum>=marks),
  feedback text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX paper_owner_created_idx ON cc_app.paper_attempts(user_id,created_at DESC);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['user','session','account','verification','request_limits','mail_outbox'] LOOP
    EXECUTE format('ALTER TABLE cc_auth.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('CREATE POLICY backend_only ON cc_auth.%I FOR ALL TO cc_runtime USING(true) WITH CHECK(true)',t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['study_state','cards','card_reviews','practice_sessions','paper_attempts'] LOOP
    EXECUTE format('ALTER TABLE cc_app.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE cc_app.%I FORCE ROW LEVEL SECURITY',t);
    EXECUTE format('CREATE POLICY own_rows ON cc_app.%I FOR ALL TO cc_runtime USING(user_id=NULLIF(current_setting(''cc.user_id'',true),'''')) WITH CHECK(user_id=NULLIF(current_setting(''cc.user_id'',true),''''))',t);
  END LOOP;
END $$;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA cc_auth,cc_app TO cc_runtime;
REVOKE ALL ON ALL TABLES IN SCHEMA cc_auth,cc_app FROM PUBLIC;
-- No Supabase anon/authenticated role access; Better Auth is NOT Supabase Auth.
DO $$ BEGIN
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON SCHEMA cc_auth,cc_app FROM anon; REVOKE ALL ON ALL TABLES IN SCHEMA cc_auth,cc_app FROM anon; END IF;
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON SCHEMA cc_auth,cc_app FROM authenticated; REVOKE ALL ON ALL TABLES IN SCHEMA cc_auth,cc_app FROM authenticated; END IF;
END $$;
