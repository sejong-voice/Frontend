"use client"

import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export function LoginScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <Image
            src="/sejong-logo.png"
            alt="세종대학교 로고"
            width={72}
            height={72}
            className="rounded-xl"
            priority
          />
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {"세종 신문고"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {"세종대학교 재학생 인증 후 이용 가능합니다."}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {"세종대학교 학생회 | 세종대 AUTH 인증 기반 서비스"}
        </p>
      </div>
    </div>
  )
}
