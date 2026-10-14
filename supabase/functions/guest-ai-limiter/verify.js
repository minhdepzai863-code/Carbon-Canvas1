import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
const team = "minhdepzai863-codes-projects";
const issuers = new Map([
  [
    "https://oidc.vercel.com",
    createRemoteJWKSet(new URL("https://oidc.vercel.com/.well-known/jwks")),
  ],
  [
    `https://oidc.vercel.com/${team}`,
    createRemoteJWKSet(
      new URL(`https://oidc.vercel.com/${team}/.well-known/jwks`),
    ),
  ],
]);
export async function verifyCaller(token, keyOverride) {
  const issuer = decodeJwt(token).iss;
  if (!issuers.has(issuer)) throw new Error("Untrusted issuer");
  const { payload } = await jwtVerify(
    token,
    keyOverride || issuers.get(issuer),
    {
      issuer,
      audience: `https://vercel.com/${team}`,
      algorithms: ["RS256"],
      clockTolerance: 5,
      maxTokenAge: "2h",
    },
  );
  if (
    payload.owner_id !== "team_xvwNs4n8v9KoZ82RwTHeS4lu" ||
    payload.project_id !== "prj_JDxayPsEudjSrKtQkJyQ0nAkLpJJ" ||
    !["preview", "production"].includes(payload.environment) ||
    payload.sub !==
      `owner:${team}:project:carbon-canvas1:environment:${payload.environment}`
  )
    throw new Error("Untrusted workload");
  return payload;
}
