CREATE SCHEMA cc_guest;
REVOKE ALL ON SCHEMA cc_guest FROM PUBLIC;
CREATE TABLE cc_guest.request_limits (
  key text PRIMARY KEY CHECK(key ~ '^[a-f0-9]{64}$'), count integer NOT NULL CHECK(count BETWEEN 0 AND 500), expires_at timestamptz NOT NULL
);
CREATE INDEX guest_limits_expiry_idx ON cc_guest.request_limits(expires_at);
ALTER TABLE cc_guest.request_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_guest.request_limits FORCE ROW LEVEL SECURITY;
CREATE POLICY backend_only ON cc_guest.request_limits FOR ALL TO cc_runtime USING(true) WITH CHECK(true);
GRANT USAGE ON SCHEMA cc_guest TO cc_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON cc_guest.request_limits TO cc_runtime;

-- SECURITY INVOKER: the caller must already have backend permissions. No
-- anonymous Data API access or user/answer data is stored in this quota table.
CREATE FUNCTION public.consume_guest_ai_budgets(p_rules jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,cc_guest AS $$
DECLARE r record; v_now timestamptz := clock_timestamp(); v_count integer; v_expiry timestamptz; v_retry integer := 0;
BEGIN
  IF jsonb_typeof(p_rules)<>'array' OR jsonb_array_length(p_rules) NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Invalid quota rules'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_to_recordset(p_rules) AS x(key text,window_seconds integer,maximum integer)
    WHERE key IS NULL OR key !~ '^[a-f0-9]{64}$' OR window_seconds IS NULL OR window_seconds NOT BETWEEN 1 AND 86400 OR maximum IS NULL OR maximum NOT BETWEEN 1 AND 500)
    OR (SELECT count(DISTINCT key) FROM jsonb_to_recordset(p_rules) AS x(key text)) <> jsonb_array_length(p_rules) THEN RAISE EXCEPTION 'Invalid quota rules'; END IF;
  -- One bounded operation serializes the low-volume guest testing budgets. All
  -- buckets pass before any is charged, so blocked spam cannot exhaust global budget.
  PERFORM pg_advisory_xact_lock(17397101);
  DELETE FROM cc_guest.request_limits WHERE key IN(SELECT key FROM cc_guest.request_limits WHERE expires_at<v_now ORDER BY expires_at LIMIT 50);
  FOR r IN SELECT * FROM jsonb_to_recordset(p_rules) AS x(key text,window_seconds integer,maximum integer) ORDER BY key LOOP
    SELECT count,expires_at INTO v_count,v_expiry FROM cc_guest.request_limits WHERE key=r.key;
    IF v_expiry>v_now AND v_count>=r.maximum THEN v_retry:=GREATEST(v_retry,CEIL(EXTRACT(EPOCH FROM v_expiry-v_now))::integer); END IF;
  END LOOP;
  IF v_retry>0 THEN RETURN jsonb_build_object('allowed',false,'retryAfter',v_retry); END IF;
  FOR r IN SELECT * FROM jsonb_to_recordset(p_rules) AS x(key text,window_seconds integer,maximum integer) ORDER BY key LOOP
    INSERT INTO cc_guest.request_limits(key,count,expires_at) VALUES(r.key,1,v_now+r.window_seconds*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN request_limits.expires_at<=v_now THEN 1 ELSE request_limits.count+1 END,
      expires_at=CASE WHEN request_limits.expires_at<=v_now THEN EXCLUDED.expires_at ELSE request_limits.expires_at END;
  END LOOP;
  RETURN jsonb_build_object('allowed',true,'retryAfter',NULL);
END $$;
REVOKE ALL ON FUNCTION public.consume_guest_ai_budgets(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_guest_ai_budgets(jsonb) TO cc_runtime;
DO $$ BEGIN
  IF EXISTS(SELECT FROM pg_roles WHERE rolname='service_role') THEN
    GRANT USAGE ON SCHEMA cc_guest TO service_role;
    GRANT SELECT,INSERT,UPDATE,DELETE ON cc_guest.request_limits TO service_role;
    CREATE POLICY machine_backend ON cc_guest.request_limits FOR ALL TO service_role USING(true) WITH CHECK(true);
    GRANT EXECUTE ON FUNCTION public.consume_guest_ai_budgets(jsonb) TO service_role;
  END IF;
END $$;
