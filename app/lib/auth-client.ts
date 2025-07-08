import { createAuthClient } from "better-auth/react"
import { anonymousClient, oidcClient, adminClient, ssoClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  // Also add plugins to backend at workers/auth/index.ts
  plugins: [
    anonymousClient(),
    oidcClient(),
    adminClient(),
    ssoClient(),
  ],
})
