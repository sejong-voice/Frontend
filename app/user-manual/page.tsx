"use client"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ConnectedHeader } from "@/components/layout/connected-header"

const studentManualImages = Array.from({ length: 8 }, (_, index) => ({
  src: `/user-manual${index + 1}.png`,
  alt: `일반 학생 사용 매뉴얼 ${index + 1}`,
}))

const councilManualImages = Array.from({ length: 3 }, (_, index) => ({
  src: `/council-manual${index + 1}.png`,
  alt: `학생회 사용 매뉴얼 ${index + 1}`,
}))

export default function UserManualPage() {
  const { loading, user, isAdmin } = useAuth()
  const isStudent = user?.role === "STUDENT"

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {"사용 매뉴얼"}
            </h1>
          </div>

          {isStudent ? (
            <div className="mx-auto flex w-full max-w-[430px] flex-col items-center gap-6">
              {studentManualImages.map((image) => (
                <div
                  key={image.src}
                  className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="block w-full"
                  />
                </div>
              ))}
            </div>
          ) : isAdmin ? (
            <div className="mx-auto flex w-full max-w-[430px] flex-col items-center gap-6">
              {councilManualImages.map((image) => (
                <div
                  key={image.src}
                  className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="block w-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {"로그인 후 사용자 유형에 맞는 매뉴얼을 확인할 수 있습니다."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
