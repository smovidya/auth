import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { env } from 'cloudflare:workers';

type Variables = {
    auth: ReturnType<typeof createAuth>;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Simple health check
app.get("/api/ping", c => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// CORS configuration for auth routes
app.use(
    "/api/auth/**",
    cors({
        origin: env.BETTER_AUTH_URL, // In production, replace with your actual domain
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);


app.on(["POST", "GET"], "/api/auth/**", (c) => {
    const auth = createAuth(c.env, (c.req.raw as any).cf || {});
    return auth.handler(c.req.raw)
});

export default app;
export type AuthApp = typeof app