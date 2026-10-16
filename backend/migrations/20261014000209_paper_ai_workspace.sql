CREATE TABLE cc_app.ai_assessments (
  id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES cc_auth."user"(id) ON DELETE CASCADE,
  paper_id text NOT NULL, reference text NOT NULL, answer text NOT NULL CHECK(length(answer)<=10000),
  result jsonb NOT NULL, scheme_sha256 text NOT NULL CHECK(length(scheme_sha256)=64), model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_assessments_owner_paper_idx ON cc_app.ai_assessments(user_id,paper_id,created_at DESC);
ALTER TABLE cc_app.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_app.ai_assessments FORCE ROW LEVEL SECURITY;
CREATE POLICY own_rows ON cc_app.ai_assessments FOR ALL TO cc_runtime
  USING(user_id=NULLIF(current_setting('cc.user_id',true),'')) WITH CHECK(user_id=NULLIF(current_setting('cc.user_id',true),''));
GRANT SELECT,INSERT,UPDATE,DELETE ON cc_app.ai_assessments TO cc_runtime;
REVOKE ALL ON cc_app.ai_assessments FROM PUBLIC;
