import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-secret-in-production'
);

const COOKIE_NAME = 'km_token';
const TOKEN_TTL   = '7d';

// Signs a JWT with HS256 containing the given payload (email, username, role), valid for 7 days.
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(SECRET);
}

// Verifies the JWT signature and expiry using the app secret; returns the decoded payload or throws.
export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}

export { COOKIE_NAME };
