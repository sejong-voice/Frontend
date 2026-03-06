"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Loader2,
  Settings,
  FileText,
  Vote,
  BarChart3,
  Clock,
  StopCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Send,
} from "lucide-react"

type PostStatus = "VOTING" | "APPROVED" | "PENDING" | "COMPLETED" | "REJECTED"

interface AssignedPost {
  id: number
  title: string
  status: PostStatus
  council: string
  councilId: number
  votesFor: number
  votesAgainst: number
  voteEndDate: string
  createdAt: string
}

const statusLabels: Record<PostStatus, string> = {
  VOTING: "투표중",
  APPROVED: "승인됨",
  PENDING: "대기중",
  COMPLETED: "완료",
  REJECTED: "반려",
}

const statusStyles: Record<PostStatus, string> = {
  VOTING: "border-primary/30 bg-accent text-accent-foreground",
  APPROVED: "border-blue-200 bg-blue-50 text-blue-700",
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
}

export default function OperationsPage() {
  const { loading, user, isAdmin, isSuper } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<AssignedPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [selectedPost, setSelectedPost] = useState<AssignedPost | null>(null)
  const [resultContent, setResultContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch assigned posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts?assignedToMe=true", {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setPosts(data)
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingPosts(false)
      }
    }

    if (user && (isAdmin || isSuper)) {
      fetchPosts()
    }
  }, [user, isAdmin, isSuper])

  // Stats
  const stats = useMemo(() => {
    const voting = posts.filter((p) => p.status === "VOTING").length
    const approved = posts.filter((p) => p.status === "APPROVED").length
    const totalVotes = posts.reduce((sum, p) => sum + p.votesFor + p.votesAgainst, 0)
    return { voting, approved, totalVotes }
  }, [posts])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (!isAdmin && !isSuper) {
        router.replace("/")
      }
    }
  }, [loading, user, isAdmin, isSuper, router])

  async function handleEarlyClose(postId: number) {
    if (!confirm("투표를 조기 마감하시겠습니까?")) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/close`, {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        // Update local state
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, status: "APPROVED" as PostStatus } : p
          )
        )
        if (selectedPost?.id === postId) {
          setSelectedPost((prev) =>
            prev ? { ...prev, status: "APPROVED" as PostStatus } : null
          )
        }
        alert("투표가 조기 마감되었습니다.")
      } else {
        const error = await res.json()
        alert(error.error || "조기 마감에 실패했습니다.")
      }
    } catch {
      alert("오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResult(postId: number, status: "COMPLETED" | "REJECTED") {
    if (!resultContent.trim()) {
      alert("처리 결과 입장문을 입력해주세요.")
      return
    }

    const statusText = status === "COMPLETED" ? "완료" : "반려"
    if (!confirm(`게시글을 ${statusText} 처리하시겠습니까?`)) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/result`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, resultContent }),
      })

      if (res.ok) {
        // Update local state
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, status } : p))
        )
        setSelectedPost(null)
        setResultContent("")
        alert(`게시글이 ${statusText} 처리되었습니다.`)
      } else {
        const error = await res.json()
        alert(error.error || "처리에 실패했습니다.")
      }
    } catch {
      alert("오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !user || (!isAdmin && !isSuper)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Detail view
  if (selectedPost) {
    const totalVotes = selectedPost.votesFor + selectedPost.votesAgainst
    const forPercent = totalVotes > 0 ? Math.round((selectedPost.votesFor / totalVotes) * 100) : 0
    const againstPercent = totalVotes > 0 ? 100 - forPercent : 0

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ConnectedHeader />

        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedPost(null)
                setResultContent("")
              }}
              className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {"목록으로 돌아가기"}
            </button>

            {/* Post summary */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium", statusStyles[selectedPost.status])}
                    >
                      {statusLabels[selectedPost.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {selectedPost.council}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedPost.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {"투표 마감: " + selectedPost.voteEndDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vote statistics */}
              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  {"투표 통계"}
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
                    <p className="text-xs text-muted-foreground">{"총 투표"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedPost.votesFor}</p>
                    <p className="text-xs text-muted-foreground">{"찬성"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedPost.votesAgainst}</p>
                    <p className="text-xs text-muted-foreground">{"반대"}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="h-3 w-3" />
                      {forPercent + "%"}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      {againstPercent + "%"}
                      <ThumbsDown className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${forPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-4">
                {/* Early close - only for VOTING status */}
                {selectedPost.status === "VOTING" && (
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">{"조기 마감"}</p>
                      <p className="text-sm text-muted-foreground">
                        {"투표를 즉시 종료하고 결과를 확정합니다."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      onClick={() => handleEarlyClose(selectedPost.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <StopCircle className="h-3.5 w-3.5" />
                      )}
                      {"조기 마감"}
                    </Button>
                  </div>
                )}

                {/* Result input - only for APPROVED status */}
                {selectedPost.status === "APPROVED" && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="font-medium text-foreground mb-2">{"결과 입력"}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {"안건 처리 결과를 입력하고 최종 상태를 결정합니다."}
                    </p>

                    <Textarea
                      placeholder="처리 결과 입장문을 입력하세요"
                      rows={4}
                      value={resultContent}
                      onChange={(e) => setResultContent(e.target.value)}
                      className="mb-4 resize-none"
                    />

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleResult(selectedPost.id, "COMPLETED")}
                        disabled={isSubmitting || !resultContent.trim()}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        {"완료 처리"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleResult(selectedPost.id, "REJECTED")}
                        disabled={isSubmitting || !resultContent.trim()}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {"반려 처리"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Completed/Rejected - show status */}
                {(selectedPost.status === "COMPLETED" || selectedPost.status === "REJECTED") && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {"이 게시글은 이미 처리 완료되었습니다."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // List view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ConnectedHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Settings className="h-6 w-6" />
              {"운영 페이지"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {"담당 학생회의 청원을 관리하고 답변을 작성할 수 있습니다."}
            </p>
          </div>

          {/* Quick stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.voting}</p>
                  <p className="text-sm text-muted-foreground">{"투표중 청원"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Vote className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">{"승인 대기"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalVotes}</p>
                  <p className="text-sm text-muted-foreground">{"총 투표 수"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Post list */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-secondary/50 px-6 py-3">
              <h2 className="text-sm font-medium text-foreground">{"담당 게시글"}</h2>
            </div>

            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {"담당 게시글이 없습니다."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post) => {
                  const totalVotes = post.votesFor + post.votesAgainst
                  const forPercent = totalVotes > 0 ? Math.round((post.votesFor / totalVotes) * 100) : 0

                  return (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-medium", statusStyles[post.status])}
                          >
                            {statusLabels[post.status]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.council}
                          </span>
                        </div>
                        <p className="truncate text-sm font-medium text-foreground">
                          {post.title}
                        </p>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Vote className="h-3 w-3" />
                            {totalVotes + "표"}
                          </span>
                          <span className="flex items-center gap-1 text-green-600">
                            <ThumbsUp className="h-3 w-3" />
                            {forPercent + "%"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.voteEndDate}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
