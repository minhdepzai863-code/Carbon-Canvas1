-- Cache the verified transaction identity once per statement, not once per row.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['study_state','cards','card_reviews','practice_sessions','paper_attempts','ai_assessments'] LOOP
    EXECUTE format('ALTER POLICY own_rows ON cc_app.%I USING(user_id=(SELECT NULLIF(current_setting(''cc.user_id'',true),''''))) WITH CHECK(user_id=(SELECT NULLIF(current_setting(''cc.user_id'',true),'''')))',t);
  END LOOP;
END $$;
-- Migration metadata is intentionally inaccessible to non-owner clients.
CREATE POLICY no_client_access ON cc_meta.schema_migrations FOR ALL TO PUBLIC USING(false) WITH CHECK(false);
