import { LoginForm } from "~/components/login-form"
import { authClient } from "~/lib/auth-client"
import type { Route } from './+types/login'

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authClient.getSession()
  const url = new URL(request.url)
  const returnToTarget = new URL(request.url)
  returnToTarget.pathname = '/dashboard'
  returnToTarget.search = ''
  const parsedReturnTo = new URL(returnToTarget.toString())

  if (!parsedReturnTo.origin || parsedReturnTo.origin !== url.origin) {
    parsedReturnTo.pathname = '/dashboard'
    parsedReturnTo.search = ''
  }

  if (session.data) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: parsedReturnTo.toString(),
      },
    })
  }

  return {
    return_to: parsedReturnTo.toString(),
  }
}

export default async function LoginPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm return_to={loaderData.return_to} />
      </div>
    </div>
  )
}
