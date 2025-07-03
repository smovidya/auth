import type { D1Database, IncomingRequestCfProperties } from "@cloudflare/workers-types";
import { APIError, betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { admin, anonymous, bearer, createAuthMiddleware, customSession, openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { oidcProvider, jwt } from "better-auth/plugins";
import { schema } from "../db";
import { sso } from 'better-auth/plugins/sso';

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
        appName: "Science Chula Central Authentication",
        logger: {
          level: "info",
          log(level, message, ...args) {
            if (level === "error") {
              console.error(message, ...args);
            } else {
              console.log(message, ...args);
            }
          },
        },
        socialProviders: {
          google: {
            clientId: env?.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
            clientSecret: env?.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
          }
        },
        user: {
          additionalFields: {
            ssoUid: {
              type: "string",
              defaultValue: "",
              input: false,
              required: false,
            },
            ssoRoles: {
              type: "string",
              defaultValue: "[]",
              required: false,
              input: false,
            },
            ssoOuid: {
              type: "string",
              defaultValue: "",
              required: false,
              input: false,
              unique: true,
            },
            ssoGecos: {
              type: "string",
              defaultValue: "",
              required: false,
              input: false,
            }
          }
        },
        plugins: [
          anonymous(),
          oidcProvider({
            loginPage: "/sign-in",
            consentPage: "/consent",
            metadata: {
              issuer: "https://auth.smovidya-chula.workers.dev",
            },
            scopes: ["openid", "student_profile"],
          }),
          bearer(),
          admin(),
          sso(),
          openAPI()
        ],
        rateLimit: {
          // Enable rate limiting
          enabled: true,
        },
        advanced: {
          cookiePrefix: "smovidya",
          crossSubDomainCookies: {
            enabled: true,
            domain: ".smovidya-chula.workers.dev",
          }
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