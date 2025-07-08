import "./welcome.css"
import { authClient } from '~/lib/auth-client'

export function Welcome({ message }: { message: string }) {
  const {
    data: session,
    isPending, //loading state
    error, //error object
  } = authClient.useSession()

  return (
    <>
      {isPending && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {session && (
        <div>
          <p>Welcome, {session.user.name}!</p>
          <p>Email: {session.user.email}</p>
          <button onClick={() => authClient.signOut()}>Sign Out</button>
        </div>
      )}
      {!session && !isPending && (
        <>
          <p>You are not signed in.</p>
          <p>To continue, sign in with your Chula SSO Account</p>
          <div style={{ display: 'flex', gap: "0.5rem", flexDirection: 'column' }}>
            <button onClick={async () => await authClient.signIn.social({
              provider: "google",
            })}>
              Sing in with Chula SSO
            </button>
            <button onClick={async () => await authClient.signIn.anonymous()}>
              Anonymous signin (testing only)
            </button>
          </div>
        </>
      )}
    </>
  )
}
