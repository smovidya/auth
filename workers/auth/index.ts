import type { D1Database, IncomingRequestCfProperties } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { admin, bearer, jwt, oAuthProxy, openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { oidcProvider } from "better-auth/plugins";
import { schema } from "../db";
import { ac, roles } from './permission';

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
            console.log(message, ...args);
          },
        },
        socialProviders: {
          google: {
            clientId: env?.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
            clientSecret: env?.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
            // Set this for oAuthProxy to work
            redirectURI: "https://auth.smovidya-chula.workers.dev/api/auth/callback/google",
          }
        },
        user: {
          additionalFields: {
            // Use ouid because some users might be university staff
            // might be different from university's convention, but it's
            // for our use only.
            // Not to confuse with the OIDC `sub` field or
            // https://en.wikipedia.org/wiki/Organizationally_unique_identifier
            ouid: {
              type: "string",
              input: false,
              unique: true,
            },
            name: {
              type: "string",
              input: false,
            },
            thainame: {
              type: "string",
              input: false,
            },
            program: {
              type: "string",
              input: false,
              required: false,
            },
            programName: {
              type: "string",
              input: false,
              required: false,
            },
          },
          changeEmail: {
            enabled: false,
          },
        },
        // Also add plugins client-side in app/lib/auth-client.ts
        plugins: [
          // Disable anonymous login
          // anonymous({
          //   emailDomainName: "smovidya.local",
          // }),
          oidcProvider({
            loginPage: "/login",
            consentPage: "/consent",
            metadata: {
              issuer: "https://auth.smovidya-chula.workers.dev",
            },
            generateClientSecret() {
              // Generate a random client secret for OIDC clients
              return "vidya-cs-" + crypto.getRandomValues(new Uint8Array(32)).join("");
            },
            generateClientId() {
              // Generate a random client ID for OIDC clients
              return "vidya-ci-" + crypto.getRandomValues(new Uint8Array(32)).join("");
            },
          }),
          bearer(),
          admin({
            ac,
            roles,
            bannedUserMessage: "บัญชีของคุณถูกระงับการใช้ระบบ กรุณาติดต่อ smovidya.it.team[at]gmail.com",
          }),
          openAPI(),
          jwt(),
          oAuthProxy({
            productionURL: "https://auth.smovidya-chula.workers.dev",
          })
        ],
        rateLimit: {
          // Enable rate limiting
          enabled: true,
        },
        advanced: {
          cookiePrefix: "smovidya",
        },
        trustedOrigins(request) {
          const url = new URL(request.url);
          // Allow requests from the same origin as the request
          return [url.origin || env?.BETTER_AUTH_URL];
        },
        databaseHooks: {
          user: {
            create: {
              before: async (user) => {
                if (user.email.endsWith("@student.chula.ac.th") || user.email.endsWith("@chula.ac.th")) {
                  const ouid = user.email.split("@")[0];
                  // Set OUID for student and staff accounts
                  return {
                    data: {
                      ...user,
                      ouid,
                    },
                  };
                }
                return { data: { ...user, ouid: user.email } };
              },
            }
          }
        }
      },
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