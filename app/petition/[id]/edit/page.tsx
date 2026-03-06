"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ConnectedHeader as SiteHeader } from "@/components/layout/connected-header"
import { useAuth } from "@/components/auth/auth-provider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, Info, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

const MAX_CONTENT_LENGTH = 2000

interface PostData {
  id: number
  title: string
  content: string
  councilId: number
  authorId: number
}

export default function EditPetitionPage() {
  const { loading, user, isActive, isAdmin, isSuper } = useAuth()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<PostData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if not logged in or if ADMIN/SUPER
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (isAdmin || isSuper) {
        // ADMIN/SUPER는 청원 수정 불가
        router.replace("/")
      }
    }
  }, [loading, user, isAdmin, isSuper, router])

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data)
          setTitle(data.title)
          setContent(data.content)
        } else {
          router.replace("/")
        }
      } catch {
        router.replace("/")
      } finally {
        setIsLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId, router])

  const contentLength = content.length

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요."
    }
    if (!content.trim()) {
      newErrors.content = "내용을 입력해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    if (!isActive) {
      alert("계정이 활성 상태가 아니어서 청원을 수정할 수 없습니다.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (res.ok) {
        router.push(`/petition/${postId}`)
      } else {
        const errorData = await res.json()
        alert(errorData.error || "청원 수정에 실패했습니다.")
      }
    } catch {
      alert("청원 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push(`/petition/${postId}`)
  }

  if (loading || isLoading || !user || isAdmin || isSuper) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Back link */}
          <Link
            href={`/petition/${postId}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {"청원으로 돌아가기"}
          </Link>

          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {"청원 수정"}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {"청원의 제목과 내용을 수정할 수 있습니다."}
            </p>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{"작성자"}</span>
            <span className="text-sm font-medium text-foreground">{user?.studentNo}</span>
          </div>

          {/* Notice banner */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {"담당 학생회와 투표 기간은 수정할 수 없습니다."}
            </p>
          </div>

          {/* Not active warning */}
          {!isActive && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">
                {"계정이 활성 상태가 아니어서 청원을 수정할 수 없습니다."}
              </p>
            </div>
          )}

          {/* Form fields */}
          <div className="flex flex-col gap-6">
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
                  {"수정 중..."}
                </>
              ) : (
                "수정하기"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
