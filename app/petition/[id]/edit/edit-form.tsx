"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Info, User, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { postService } from "@/app/api/posts"
import { toast } from "sonner"

const MAX_CONTENT_LENGTH = 2000

export function PetitionEditForm({ id }: { id: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const contentLength = content.length

  useEffect(() => {
    async function loadPetition() {
      try {
        const res = await postService.getPost(id)
        setTitle(res.data.title)
        setContent(res.data.content)
      } catch (error) {
        console.error("청원 정보 로드 실패:", error)
        toast.error("청원 정보를 불러올 수 없습니다.")
        router.push("/my-petitions")
      } finally {
        setIsLoading(false)
      }
    }
    loadPetition()
  }, [id, router])

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해 주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      await postService.updatePost(id, {
        title,
        content,
      })
      toast.success("청원이 수정되었습니다.")
      router.push("/my-petitions")
    } catch (error: any) {
      console.error("청원 수정 실패:", error)
      toast.error(error.response?.data?.message || "청물 수정에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push("/my-petitions")
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Author info */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{"작성자"}</span>
        <span className="text-sm font-medium text-foreground">{user?.name}</span>
      </div>

      {/* Notice banner */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {"투표가 시작된 이후에는 내용 수정이 제한될 수 있습니다."}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="petition-title" className="text-sm font-medium text-foreground">
            {"제목"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </label>
          <Input
            id="petition-title"
            type="text"
            placeholder="수정할 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="petition-content" className="text-sm font-medium text-foreground">
            {"내용"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </label>
          <Textarea
            id="petition-content"
            placeholder="수정할 내용을 입력하세요"
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
            <span className={cn("text-xs tabular-nums", contentLength > MAX_CONTENT_LENGTH * 0.9 ? "text-destructive" : "text-muted-foreground")}>
              {contentLength} / {MAX_CONTENT_LENGTH}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          {"취소"}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {"수정 중..."}
            </>
          ) : (
            "수정하기"
          )}
        </Button>
      </div>
    </div>
  )
}
