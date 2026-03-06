"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Info, User, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

type VotingDuration = "ONE_WEEK" | "TWO_WEEKS" | "FOUR_WEEKS"

interface Council {
  id: number
  name: string
}

const votePeriods: { value: VotingDuration; label: string }[] = [
  { value: "ONE_WEEK", label: "1주" },
  { value: "TWO_WEEKS", label: "2주" },
  { value: "FOUR_WEEKS", label: "4주" },
]

const MAX_CONTENT_LENGTH = 2000

export function PetitionForm() {
  const router = useRouter()
  const { user, isActive } = useAuth()
  const [councils, setCouncils] = useState<Council[]>([])
  const [councilId, setCouncilId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [votePeriod, setVotePeriod] = useState<VotingDuration>("ONE_WEEK")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const contentLength = content.length

  // Fetch councils from API
  useEffect(() => {
    async function fetchCouncils() {
      try {
        const res = await fetch("/api/councils")
        if (res.ok) {
          const data = await res.json()
          setCouncils(data)
        }
      } catch {
        // Handle error silently
      }
    }
    fetchCouncils()
  }, [])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요."
    }
    if (!content.trim()) {
      newErrors.content = "내용을 입력해주세요."
    }
    if (!councilId) {
      newErrors.council = "담당 학생회를 선택해주세요."
    }
    if (!votePeriod) {
      newErrors.votePeriod = "투표 기간을 선택해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    if (!isActive) {
      alert("계정이 활성 상태가 아니어서 청원을 작성할 수 없습니다.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          councilId: parseInt(councilId),
          postVotingDuration: votePeriod,
        }),
      })

      if (res.ok) {
        router.push("/my-petitions")
      } else {
        const errorData = await res.json()
        alert(errorData.error || "청원 등록에 실패했습니다.")
      }
    } catch {
      alert("청원 등록 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push("/")
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Author info */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{"작성자"}</span>
        <span className="text-sm font-medium text-foreground">{user?.studentNo}</span>
        <span className="text-xs text-muted-foreground">{"(게시 시 익명 처리됩니다)"}</span>
      </div>

      {/* Notice banner */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {"욕설\u00B7비속어가 포함된 청원은 등록되지 않습니다."}
        </p>
      </div>

      {/* Not active warning */}
      {!isActive && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">
            {"계정이 활성 상태가 아니어서 청원을 작성할 수 없습니다."}
          </p>
        </div>
      )}

      {/* Form fields */}
      <div className="flex flex-col gap-6">
        {/* Council */}
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="council-select"
            className="text-sm font-medium text-foreground"
          >
            {"담당 학생회"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </label>
          <Select value={councilId} onValueChange={setCouncilId}>
            <SelectTrigger id="council-select" className={cn("w-full md:w-72", errors.council && "border-destructive")}>
              <SelectValue placeholder="학생회를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {councils.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.council && (
            <p className="text-xs text-destructive">{errors.council}</p>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="petition-title"
            className="text-sm font-medium text-foreground"
          >
            {"제목"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </label>
          <Input
            id="petition-title"
            type="text"
            placeholder="청원 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(errors.title && "border-destructive")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="petition-content"
            className="text-sm font-medium text-foreground"
          >
            {"내용"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </label>
          <Textarea
            id="petition-content"
            placeholder="문제 상황과 개선이 필요한 이유를 구체적으로 작성해 주세요"
            rows={10}
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                setContent(e.target.value)
              }
            }}
            className={cn("resize-none", errors.content && "border-destructive")}
          />
          <div className="flex justify-between">
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content}</p>
            )}
            <span
              className={cn(
                "ml-auto text-xs tabular-nums",
                contentLength > MAX_CONTENT_LENGTH * 0.9
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {contentLength}
              {" / "}
              {MAX_CONTENT_LENGTH}
            </span>
          </div>
        </div>

        {/* Vote period */}
        <fieldset className="flex flex-col gap-2.5">
          <legend className="text-sm font-medium text-foreground">
            {"투표 기간"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </legend>
          <div className="flex items-center gap-2">
            {votePeriods.map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => setVotePeriod(period.value)}
                className={cn(
                  "rounded-md border px-5 py-2 text-sm font-medium transition-colors",
                  votePeriod === period.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
          {errors.votePeriod && (
            <p className="text-xs text-destructive">{errors.votePeriod}</p>
          )}
        </fieldset>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          {"취소"}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !isActive}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {"등록 중..."}
            </>
          ) : (
            "등록하기"
          )}
        </Button>
      </div>
    </div>
  )
}
