import { createAuthClient } from "better-auth/react"
import { oidcClient, adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from 'workers/auth'
import { ac, roles } from 'workers/auth/permission'

export const authClient = createAuthClient({
  // Also add plugins to backend at workers/auth/index.ts
  plugins: [
    oidcClient(),
    adminClient({ ac, roles }),
    inferAdditionalFields<typeof auth>()
  ],
})
