const PUBLIC_PATHS = ["/login", "/auth/google", "/auth/google/callback", "/app.css"];

function isPublic(path) {
    if (path === "/webhooks/paddle") {
        return true;
    }

    return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export function locals(req, res, next) {
    res.locals.brandName = process.env.BRAND_NAME || "License Admin";
    res.locals.brandLogo = process.env.BRAND_LOGO_URL || "";
    res.locals.sessionEmail = (req.session && req.session.email) || "";
    next();
}

export function requireAuth(req, res, next) {
    if (isPublic(req.path)) {
        return next();
    }

    if (req.session && req.session.authenticated) {
        return next();
    }

    return res.redirect("/login");
}
