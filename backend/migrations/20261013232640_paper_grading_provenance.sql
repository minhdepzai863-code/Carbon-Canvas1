-- Additive migration; old attempts remain explicitly self-reported. Existing
-- FORCE RLS, ownership policy, grants and owner/created index are unchanged.
ALTER TABLE cc_app.paper_attempts ADD COLUMN grading_method text NOT NULL
  DEFAULT 'self-reported'
  CHECK (grading_method IN ('self-reported', 'markscheme-answer-key'));
COMMENT ON COLUMN cc_app.paper_attempts.grading_method IS
  'Set by backend only. Never accept a claimed grading method from a client.';
-- The historical 001 cards course constraint retains legacy Undergraduate
-- rows. The active catalogue and API validation now allow only ALEVEL and IB;
-- removing a curriculum must not erase an existing learner record.
