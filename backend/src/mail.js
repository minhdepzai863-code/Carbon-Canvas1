import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
  createHash,
} from "node:crypto";
import nodemailer from "nodemailer";

export function encryptMessage(message, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify(message), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}
export function decryptMessage(payload, key) {
  const data = Buffer.from(payload, "base64");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    data.subarray(0, 12),
  );
  cipher.setAuthTag(data.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString(
      "utf8",
    ),
  );
}
export function createMailQueue(pool, config) {
  return async ({ to, subject, url }) => {
    const message = {
      to,
      subject,
      text: `${subject}\n\n${url}\n\nIf you did not request this, ignore this email.`,
    };
    const fingerprint = createHash("sha256")
      .update(subject + url)
      .digest("hex");
    await pool.query(
      `INSERT INTO cc_auth.mail_outbox(id,payload,fingerprint) VALUES($1,$2,$3) ON CONFLICT(fingerprint) DO NOTHING`,
      [
        randomUUID(),
        encryptMessage(message, config.EMAIL_ENCRYPTION_KEY),
        fingerprint,
      ],
    );
  };
}
export function createTransport(config) {
  const url = new URL(config.SMTP_URL);
  return nodemailer.createTransport({
    host: url.hostname,
    port: Number(url.port || (url.protocol === "smtps:" ? 465 : 587)),
    secure: url.protocol === "smtps:",
    requireTLS: true,
    auth: {
      user: decodeURIComponent(url.username),
      pass: decodeURIComponent(url.password),
    },
    tls: { rejectUnauthorized: true },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  });
}
export async function deliverOne(pool, config, transport) {
  const { rows } =
    await pool.query(`UPDATE cc_auth.mail_outbox SET locked_until=now()+interval '2 minutes', attempts=attempts+1
    WHERE id=(SELECT id FROM cc_auth.mail_outbox WHERE sent_at IS NULL AND attempts<8 AND next_attempt_at<=now()
      AND (locked_until IS NULL OR locked_until<now()) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`);
  if (!rows.length) return false;
  const row = rows[0];
  try {
    await transport.sendMail({
      from: config.EMAIL_FROM,
      messageId: `<${row.id}@carboncanvas.local>`,
      ...decryptMessage(row.payload, config.EMAIL_ENCRYPTION_KEY),
    });
    await pool.query(
      "UPDATE cc_auth.mail_outbox SET sent_at=now(),payload=NULL,locked_until=NULL WHERE id=$1",
      [row.id],
    );
  } catch {
    await pool.query(
      `UPDATE cc_auth.mail_outbox SET locked_until=NULL,next_attempt_at=now()+LEAST(3600,POWER(2,attempts)*15)*interval '1 second' WHERE id=$1`,
      [row.id],
    );
    console.error("Email delivery failed; queued retry");
  }
  return true;
}
