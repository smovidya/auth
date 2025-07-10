import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { authClient } from '~/lib/auth-client'
import { useState } from 'react'
import { Loader } from 'lucide-react'
import { useLocation } from 'react-router'

function GoogleSignInButton({ return_to }: { return_to?: string | null }) {
  const [loading, setLoading] = useState(false)
  function handleLogin() {
    setLoading(true)
    authClient.signIn.social({
      provider: "google",
      callbackURL: return_to || "/dashboard",
    })
  }

  return <Button className="w-full" onClick={handleLogin}>
    {loading ? (
      <Loader className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        เข้าสู่ระบบด้วยบัญชีนิสิต
      </>
    )}
  </Button>
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  let location = useLocation()
  let return_to = location.search ? new URLSearchParams(location.search).get('return_to') : undefined

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-muted relative hidden md:block">
            <img
              src="/img/KxCUTU-505.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  ยินดีต้อนรับสู่วิทยา
                </h1>
                <p className="text-muted-foreground text-balance">
                  ระบบจัดการบริการยืนยันตัวตน
                </p>
              </div>
              <GoogleSignInButton return_to={return_to} />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        โดยการเข้าสู่ระบบ คุณยอมรับว่าได้อ่านและเข้าใจ<a href="/privacy-policy">นโยบายข้อมูลส่วนบุคคล</a>และปฏิบัติตาม<a href="/terms-of-use">ข้อกำหนดการใช้บริการ</a>
      </div>
    </div>
  )
}
