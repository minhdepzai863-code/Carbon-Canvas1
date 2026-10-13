import { betterAuth } from "better-auth";
import { createLimiter } from "./rate-limit.js";
import { createMailQueue } from "./mail.js";

export function createAuth(pool, config) {
  const enqueue = createMailQueue(pool, config);
  return betterAuth({
    database: pool,
    secret: config.BETTER_AUTH_SECRET,
    baseURL: config.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins: [config.FRONTEND_ORIGIN, config.BETTER_AUTH_URL],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: true,
      autoSignIn: false,
      resetPasswordTokenExpiresIn: 900,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) =>
        enqueue({
          to: user.email,
          url,
          subject: "Reset your CarbonCanvas password",
        }),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: false,
      expiresIn: 3600,
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url }) =>
        enqueue({
          to: user.email,
          url,
          subject: "Verify your CarbonCanvas email",
        }),
    },
    session: {
      expiresIn: 604800,
      disableSessionRefresh: true,
      freshAge: 900,
      cookieCache: { enabled: false },
    },
    verification: { storeIdentifier: "hashed" },
    advanced: {
      useSecureCookies: config.NODE_ENV === "production",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
        path: "/",
      },
      ipAddress: { ipAddressHeaders: ["x-cc-client-ip"] },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customStorage: {
        consume: createLimiter(pool, config.BETTER_AUTH_SECRET),
      },
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 600, max: 5 },
        "/request-password-reset": { window: 900, max: 3 },
        "/send-verification-email": { window: 900, max: 3 },
      },
    },
    logger: { disabled: true },
  });
}
