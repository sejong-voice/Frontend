"use client"

import { useState } from "react"
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
import { Info, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const categories = ["학사제도", "학교시설", "학생복지", "기타"] as const
const councils = [
  { value: "department", label: "학과 학생회" },
  { value: "college", label: "단과대 학생회" },
  { value: "general", label: "총학생회" },
] as const
const votePeriods = [
  { value: "1w", label: "1주" },
  { value: "2w", label: "2주" },
  { value: "1m", label: "1달" },
] as const

const MAX_CONTENT_LENGTH = 2000

export function PetitionForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [category, setCategory] = useState<string>("")
  const [council, setCouncil] = useState<string>("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [votePeriod, setVotePeriod] = useState("1w")

  const contentLength = content.length

  function handleSubmit() {
    alert("청원이 등록되었습니다.")
    router.push("/my-petitions")
  }

  function handleCancel() {
    router.push("/my-petitions")
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Author info */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{"작성자"}</span>
        <span className="text-sm font-medium text-foreground">{user?.id}</span>
        <span className="text-xs text-muted-foreground">{"(게시 시 익명 처리됩니다)"}</span>
      </div>

      {/* Notice banner */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {"욕설\u00B7비속어가 포함된 청원은 등록되지 않습니다."}
        </p>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-6">
        {/* Category */}
        <fieldset className="flex flex-col gap-2.5">
          <legend className="text-sm font-medium text-foreground">
            {"카테고리"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  category === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Council */}
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="council-select"
            className="text-sm font-medium text-foreground"
          >
            {"담당 학생회"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </label>
          <Select value={council} onValueChange={setCouncil}>
            <SelectTrigger id="council-select" className="w-full md:w-72">
              <SelectValue placeholder="학생회를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {councils.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          />
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
            className="resize-none"
          />
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs tabular-nums",
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
        </fieldset>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={handleCancel}>
          {"취소"}
        </Button>
        <Button type="button" onClick={handleSubmit}>
          {"등록하기"}
        </Button>
      </div>
    </div>
  )
}
