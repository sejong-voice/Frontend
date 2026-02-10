"use client"

import React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export function LoginForm() {
  const { refreshMe } = useAuth()
  const router = useRouter()
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!studentId.trim() || !password.trim()) {
      setError("학번과 비밀번호를 모두 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.")
        setIsLoading(false)
        return
      }

      // Cookie is set by the server; refresh auth state
      await refreshMe()
      router.push("/")
    } catch {
      setError("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="student-id"
          className="text-sm font-medium text-foreground"
        >
          {"학번"}
        </label>
        <Input
          id="student-id"
          type="text"
          placeholder="학번을 입력하세요"
          value={studentId}
          onChange={(e) => {
            setStudentId(e.target.value)
            if (error) setError("")
          }}
          autoComplete="username"
          className="h-11"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          {"비밀번호"}
        </label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (error) setError("")
          }}
          autoComplete="current-password"
          className="h-11"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        className="mt-1 h-11 w-full text-sm font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {"로그인 중..."}
          </>
        ) : (
          "로그인"
        )}
      </Button>

      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {"테스트 계정: 20210001 / 1234 (학생) | admin / admin (관리자)"}
      </p>
    </form>
  )
}
