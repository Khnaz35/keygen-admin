import crypto from "crypto";
import * as google from "../google.js";

export function login(req, res) {
    if (req.session && req.session.authenticated) {
        return res.redirect("/");
    }

    res.render("login", {
        title: "Sign in",
        googleEnabled: google.isEnabled(),
        error: req.query.error || "",
    });
}

export function start(req, res) {
    if (!google.isEnabled()) {
        return res.status(503).send("Google sign-in is not configured.");
    }

    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    res.redirect(google.authUrl(state));
}

export async function callback(req, res) {
    if (!google.isEnabled()) {
        return res.redirect("/login");
    }

    const { code, state } = req.query;

    if (!code || !state || state !== req.session.oauthState) {
        return res.redirect("/login?error=state");
    }

    delete req.session.oauthState;

    try {
        const { email, verified } = await google.emailFromCode(code);

        if (!verified || !google.isAllowed(email)) {
            return res.redirect("/login?error=denied");
        }

        req.session.regenerate((err) => {
            if (err) {
                return res.redirect("/login?error=server");
            }

            req.session.authenticated = true;
            req.session.email = email;
            return res.redirect("/");
        });
    } catch (e) {
        return res.redirect("/login?error=google");
    }
}

export function logout(req, res) {
    req.session.destroy(() => {
        res.redirect("/login");
    });
}
