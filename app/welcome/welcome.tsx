import { Button } from '~/components/ui/button'
import { authClient } from '~/lib/auth-client'

export function Welcome() {
  const session = authClient.useSession()
  return (
    <div className="h-screen container m-auto p-10 flex items-center justify-center">
      <main>
        <h1 className="text-2xl">ระบบจัดการบริการยืนยันตัวตน</h1>
        <span>
          สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
        </span>
        <div>
          <p className="text-muted-foreground text-sm">
            ระบบนี้ใช้สำหรับยืนยันตัวตนของนิสิตคณะวิทยาศาสตร์
            จุฬาลงกรณ์มหาวิทยาลัย เพื่อเข้าถึงบริการต่างๆ ของสโมสรนิสิต
          </p>
          {session.data ? (
            <>
              <p className="text-muted-foreground text-sm">
                ยินดีต้อนรับ, {session.data.user.name}!
              </p>
              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={() => authClient.signOut()}
              >
                ออกจากระบบ
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                กรุณาเข้าสู่ระบบด้วยบัญชีนิสิตของคุณ
              </p>
              <a href="/login">
                <Button variant="secondary" className="w-full mt-4">
                  เข้าสู่ระบบ
                </Button>
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  )
}