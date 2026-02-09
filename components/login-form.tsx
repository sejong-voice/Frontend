"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!studentId.trim() || !password.trim()) {
      setError("학번과 비밀번호를 모두 입력해주세요.")
      return
    }

    setIsLoading(true)

    // Simulate API call — in production this would call Sejong AUTH API
    setTimeout(() => {
      // Demo: any input works for success flow
      if (studentId === "error") {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.")
        setIsLoading(false)
        return
      }
      router.push("/")
    }, 1200)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="student-id"
          className="text-sm font-medium text-foreground"
        >
          {"학번 (아이디)"}
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
    </form>
  )
}
