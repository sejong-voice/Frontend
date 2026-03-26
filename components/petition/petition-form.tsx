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
import { Info, User, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { postService, type PostVotingDuration } from "@/app/api/posts"
import { councilService, Council } from "@/app/api/councils"
import { toast } from "sonner"
import { useEffect } from "react"
import { Petition } from "@/components/petition/petition-list"

const categories = ["학사제도", "학교시설", "학생복지", "기타"] as const
const votePeriods = [
  { value: "ONE_WEEK", label: "1주" },
  { value: "TWO_WEEK", label: "2주" },
  { value: "FOUR_WEEK", label: "4주" },
] as const satisfies ReadonlyArray<{ value: PostVotingDuration; label: string }>

const MAX_CONTENT_LENGTH = 2000

export function PetitionForm() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [category, setCategory] = useState<string>("")
  const [council, setCouncil] = useState<string>("")
  const [councils, setCouncils] = useState<Council[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [votePeriod, setVotePeriod] = useState<PostVotingDuration>("ONE_WEEK")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Admin fields
  const [assignedPetitions, setAssignedPetitions] = useState<Petition[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string>("")
  const [resultStatus, setResultStatus] = useState<"COMPLETED" | "REJECTED">("COMPLETED")

  const contentLength = content.length

  useEffect(() => {
    councilService.getCouncils().then(res => setCouncils(res.data)).catch(console.error)
    
    if (isAdmin) {
      postService.getPosts({ assignedToMe: true })
        .then(res => setAssignedPetitions(res.data.content))
        .catch(console.error)
    }
  }, [isAdmin])

  async function handleSubmit() {
    if (!isAdmin && (!title.trim() || !content.trim() || !council)) {
      toast.error("모든 필드를 입력해 주세요.")
      return
    }

    if (isAdmin && (!selectedPostId || !content.trim())) {
      toast.error("연결할 청원과 내용을 입력해 주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      if (isAdmin) {
        await postService.submitPostResult(selectedPostId, {
          status: resultStatus,
          resultContent: content,
        })
      } else {
        await postService.createPost({
          title,
          content,
          councilId: council,
          postVotingDuration: votePeriod,
        })
      }
      toast.success(isAdmin ? "입장문이 등록되었습니다." : "청원이 등록되었습니다.")
      router.push("/my-petitions")
    } catch (error: any) {
      console.error(isAdmin ? "입장문 등록 실패:" : "청원 등록 실패:", error)
      toast.error(error.response?.data?.message || (isAdmin ? "입장문 등록에 실패했습니다." : "청원 등록에 실패했습니다."))
    } finally {
      setIsSubmitting(false)
    }
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
        <span className="text-sm font-medium text-foreground">{user?.name}</span>
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
        {/* Petition Link for Admin */}
        {isAdmin && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="petition-select"
                className="text-sm font-medium text-foreground"
              >
                {"연결할 청원 선택"}
                <span className="ml-1 text-destructive">{"*"}</span>
              </label>
              <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                <SelectTrigger id="petition-select" className="w-full">
                  <SelectValue placeholder="입장문을 작성할 청원을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {assignedPetitions.length === 0 ? (
                    <SelectItem value="none" disabled>{"할당된 청원이 없습니다."}</SelectItem>
                  ) : (
                    assignedPetitions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <fieldset className="flex flex-col gap-2.5">
              <legend className="text-sm font-medium text-foreground">
                {"답변 상태 및 결과"}
                <span className="ml-1 text-destructive">{"*"}</span>
              </legend>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResultStatus("COMPLETED")}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    resultStatus === "COMPLETED"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  {"완료 (승인/해결)"}
                </button>
                <button
                  type="button"
                  onClick={() => setResultStatus("REJECTED")}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    resultStatus === "REJECTED"
                      ? "border-destructive bg-destructive text-destructive-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  {"반려 (불가/거부)"}
                </button>
              </div>
            </fieldset>
          </div>
        )}

        {/* Category (Student Only) */}
        {!isAdmin && (
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
        )}

        {/* Council (Student Only) */}
        {!isAdmin && (
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
                {councils.length === 0 ? (
                  <SelectItem value="loading" disabled>{"학생회 목록 로딩 중..."}</SelectItem>
                ) : (
                  councils.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Title (Student Only) */}
        {!isAdmin && (
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
        )}

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
            placeholder={isAdmin ? "청원에 대한 학생회의 공식 입장을 구체적으로 작성해 주세요" : "문제 상황과 개선이 필요한 이유를 구체적으로 작성해 주세요"}
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

        {/* Vote period (Student Only) */}
        {!isAdmin && (
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
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {"취소"}
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
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
