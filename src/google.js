import { OAuth2Client } from "google-auth-library";

const APP_BASE_URL = (process.env.APP_BASE_URL || "").replace(/\/$/, "");
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";

const ALLOWED_EMAILS = (process.env.OAUTH_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export function isEnabled() {
    return Boolean(CLIENT_ID && CLIENT_SECRET && APP_BASE_URL && ALLOWED_EMAILS.length);
}

function redirectUri() {
    return `${APP_BASE_URL}/auth/google/callback`;
}

function newClient() {
    return new OAuth2Client({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: redirectUri(),
    });
}

export function authUrl(state) {
    return newClient().generateAuthUrl({
        access_type: "online",
        scope: ["openid", "email"],
        state,
        prompt: "select_account",
    });
}

export async function emailFromCode(code) {
    const client = newClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
        email: (payload.email || "").toLowerCase(),
        verified: payload.email_verified === true,
    };
}

export function isAllowed(email) {
    return ALLOWED_EMAILS.includes(email);
}
