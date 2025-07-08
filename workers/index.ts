import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { env } from 'cloudflare:workers';
import { createRequestHandler } from "react-router";

declare module "react-router" {
    export interface AppLoadContext {
        cloudflare: {
            env: Env;
            ctx: ExecutionContext;
        };
    }
}

type Variables = {
    auth: ReturnType<typeof createAuth>;
};


const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE
);

const apiRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Simple health check
apiRouter.get("/api/ping", c => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// CORS configuration for auth routes
apiRouter.use(
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

apiRouter.on(["POST", "GET"], "/api/auth/**", (c) => {
    const auth = createAuth(c.env, (c.req.raw as any).cf || {});
    return auth.handler(c.req.raw)
});

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if (url.pathname.startsWith("/api/auth")) {
            return apiRouter.fetch(request, env, ctx);
        }
        if (url.pathname.startsWith("/.well-known")) {
            return apiRouter.fetch(request, env, ctx);
        }
        return requestHandler(request, {
            cloudflare: { env, ctx },
        });
    },
} satisfies ExportedHandler<Env>;

export type AuthApp = typeof apiRouter
