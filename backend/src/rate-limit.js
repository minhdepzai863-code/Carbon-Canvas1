import { createHmac } from "node:crypto";

// One atomic statement serializes concurrent increments across API processes.
export function createLimiter(pool, secret) {
  return async (key, { window, max }) => {
    const hashed = createHmac("sha256", secret).update(key).digest("hex");
    const { rows } = await pool.query(
      `
      INSERT INTO cc_auth.request_limits(key, count, expires_at)
      VALUES ($1, 1, clock_timestamp() + $2 * interval '1 second')
      ON CONFLICT(key) DO UPDATE SET
        count=CASE WHEN cc_auth.request_limits.expires_at <= clock_timestamp() THEN 1 ELSE LEAST(cc_auth.request_limits.count+1,1000000) END,
        expires_at=CASE WHEN cc_auth.request_limits.expires_at <= clock_timestamp() THEN clock_timestamp()+$2*interval '1 second' ELSE cc_auth.request_limits.expires_at END
      RETURNING count, GREATEST(1,CEIL(EXTRACT(EPOCH FROM expires_at-clock_timestamp())))::integer AS retry_after`,
      [hashed, window],
    );
    return {
      allowed: rows[0].count <= max,
      retryAfter: rows[0].count <= max ? null : rows[0].retry_after,
    };
  };
}
