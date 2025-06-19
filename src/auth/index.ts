import type { D1Database, IncomingRequestCfProperties } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { anonymous } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "../db";

// Single auth configuration that handles both CLI and runtime scenarios
function createAuth(env?: Env, cf?: IncomingRequestCfProperties) {
  // Use actual DB for runtime, empty object for CLI
  const db = env ? drizzle(env.AUTH_DB, { schema, logger: true }) : ({} as any);

  return betterAuth({
    ...withCloudflare(
      {
        autoDetectIpAddress: true, // Auto-detect IP from Cloudflare headers
        geolocationTracking: true, // Track geolocation in sessions
        cf: cf || {},
        d1: env
          ? {
            db,
            options: {
              usePlural: true,
              debugLogs: true,
            },
          }
          : undefined,
        kv: env?.KV,
      },
      {
        plugins: [anonymous()],
        rateLimit: {
          // Enable rate limiting
          enabled: true,
        },
      }
    ),
    // Only add database adapter for CLI schema generation
    ...(env
      ? {}
      : {
        database: drizzleAdapter({} as D1Database, {
          provider: "sqlite",
          usePlural: true,
          debugLogs: true,
        }),
      }),
  });
}

// Export for CLI schema generation
export const auth = createAuth();

// Export for runtime usage
export { createAuth };