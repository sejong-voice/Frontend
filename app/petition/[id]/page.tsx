"use client"

import { use, useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  commentService,
  type CommentReportReason,
  type CommentResponse,
} from "@/app/api/comments"
import {
  postService,
  type PostReportReason,
  type VoteChoice,
  type VoteSummaryResponse,
} from "@/app/api/posts"
import { useAuth } from "@/components/auth/auth-provider"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { PetitionBody } from "@/components/petition/petition-body"
import {
  PetitionComments,
  type Comment,
  type ReplyData,
} from "@/components/petition/petition-comments"
import {
  PetitionDetailHeader,
  type PetitionStatus,
} from "@/components/petition/petition-detail-header"
import { PetitionOfficialResponse } from "@/components/petition/petition-official-response"
import { PetitionStatusBanner } from "@/components/petition/petition-status-banner"
import { PetitionVote } from "@/components/petition/petition-vote"
import { PetitionActions } from "@/components/petition/petition-actions"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface PetitionDetailResponse {
  id: string
  userId: string
  userStudentNo: string
  councilId: string
  councilName: string
  title: string
  content: string
  status: PetitionStatus
  postVotingDuration: string
  createdAt: string
  votingEndAt: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

const ANONYMOUS_LABEL = "익명"

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\s/g, "")
    .replace(/\.$/, "")
}

function mapReply(reply: CommentResponse): ReplyData {
  return {
    id: reply.id,
    author: ANONYMOUS_LABEL,
    content: reply.content,
    date: formatDate(reply.createdAt),
    canDelete: reply.canDelete,
  }
}

function mapComment(comment: CommentResponse): Comment {
  return {
    id: comment.id,
    author: ANONYMOUS_LABEL,
    content: comment.content,
    date: formatDate(comment.createdAt),
    canDelete: comment.canDelete,
    replies: (comment.children || []).map(mapReply),
  }
}

function getTotalCommentCount(comments: Comment[]) {
  return comments.reduce((acc, comment) => acc + 1 + comment.replies.length, 0)
}

export default function PetitionDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { user, isAdmin } = useAuth()
  const [petition, setPetition] = useState<PetitionDetailResponse | null>(null)
  const [voteSummary, setVoteSummary] = useState<VoteSummaryResponse | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [canManageAsAdmin, setCanManageAsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchComments = useCallback(async () => {
    const result = await commentService.getCommentsByPost(id)
    setComments(result.data.map(mapComment))
  }, [id])

  const fetchVoteSummary = useCallback(async () => {
    const result = await postService.getVoteSummary(id)
    setVoteSummary(result.data)
  }, [id, isAdmin])

  const handleCreateComment = useCallback(
    async (content: string) => {
      try {
        await commentService.createComment({
          postId: id,
          parentId: null,
          content,
        })
        toast.success("댓글이 등록되었습니다.")
        await fetchComments()
      } catch (error: any) {
        console.error("댓글 등록 실패:", error)
        toast.error(error.response?.data?.message || "댓글 등록에 실패했습니다.")
      }
    },
    [fetchComments, id]
  )

  const handleCreateReply = useCallback(
    async (parentId: string, content: string) => {
      try {
        await commentService.createComment({
          postId: id,
          parentId,
          content,
        })
        toast.success("답글이 등록되었습니다.")
        await fetchComments()
      } catch (error: any) {
        console.error("답글 등록 실패:", error)
        toast.error(error.response?.data?.message || "답글 등록에 실패했습니다.")
      }
    },
    [fetchComments, id]
  )

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      try {
        await commentService.deleteComment(commentId)
        toast.success("댓글이 삭제되었습니다.")
        await fetchComments()
      } catch (error: any) {
        console.error("댓글 삭제 실패:", error)
        toast.error(error.response?.data?.message || "댓글 삭제에 실패했습니다.")
      }
    },
    [fetchComments]
  )

  const handleReportComment = useCallback(async (commentId: string) => {
    try {
      await commentService.reportComment(commentId, { reason: "OTHER" })
      toast.success("신고가 접수되었습니다.")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "신고 처리에 실패했습니다.")
    }
  }, [])

  const handleReportPost = useCallback(async () => {
    try {
      await postService.reportPost(id, { reason: "OTHER" })
      toast.success("신고가 접수되었습니다.")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "신고 처리에 실패했습니다.")
    }
  }, [id])

  const handleVote = useCallback(
    async (choice: VoteChoice) => {
      try {
        await postService.castVote(id, { choice })
        toast.success(choice === "AGREE" ? "동의하셨습니다." : "비동의하셨습니다.")
        await fetchVoteSummary()
      } catch (error: any) {
        console.error("투표 실패:", error)
        toast.error(error.response?.data?.message || "투표 처리에 실패했습니다.")
      }
    },
    [fetchVoteSummary, id]
  )

  useEffect(() => {
    let isMounted = true

    async function fetchPetition() {
      setIsLoading(true)
      setError("")
      setVoteSummary(null)
      setComments([])
      setCanManageAsAdmin(false)

      try {
        const [postResult, voteSummaryResult, commentsResult, assignedPetitionsResult] =
          await Promise.allSettled([
            postService.getPost(id),
            postService.getVoteSummary(id),
            commentService.getCommentsByPost(id),
            isAdmin ? postService.getPosts({ assignedToMe: true }) : Promise.resolve(null),
          ])

        if (!isMounted) return

        if (postResult.status === "rejected") {
          throw postResult.reason
        }

        setPetition(postResult.value.data as PetitionDetailResponse)

        if (voteSummaryResult.status === "fulfilled") {
          setVoteSummary(voteSummaryResult.value.data)
        } else {
          console.error("투표 요약 조회 실패:", voteSummaryResult.reason)
        }

        if (commentsResult.status === "fulfilled") {
          setComments(commentsResult.value.data.map(mapComment))
        } else {
          console.error("댓글 목록 조회 실패:", commentsResult.reason)
        }
        if (isAdmin) {
          if (assignedPetitionsResult.status === "fulfilled") {
            setCanManageAsAdmin(
              assignedPetitionsResult.value?.data.content.some((post) => post.id === id) ?? false
            )
          } else {
            console.error("할당 청원 조회 실패:", assignedPetitionsResult.reason)
          }
        }
      } catch (err) {
        console.error("게시글 상세 조회 실패:", err)

        if (!isMounted) return
        setPetition(null)
        setError("게시글 정보를 불러오지 못했습니다.")
        toast.error("게시글 정보를 불러오지 못했습니다.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPetition()

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!petition) {
    return (
      <div className="min-h-screen bg-background">
        <ConnectedHeader />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {error || "게시글을 찾을 수 없습니다."}
            </p>
          </div>
        </main>
      </div>
    )
  }

  const totalCommentCount = getTotalCommentCount(comments)
  const canReportPost = !!user && petition.userId !== user.id
  const isAuthor = !!user && petition.userId === user.id
  const officialResponseContent =
    petition.status === "COMPLETED"
      ? "학생회의 공식 입장문이 등록되었습니다."
      : petition.status === "REJECTED"
        ? "학생회의 반려 의견이 등록되었습니다."
        : null

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-col gap-6">
          <PetitionDetailHeader
            title={petition.title}
            status={petition.status}
            category="미분류"
            studentId={petition.userStudentNo}
            date={formatDate(petition.createdAt)}
            council={petition.councilName}
            showReportAction={canReportPost}
            onReport={handleReportPost}
          />

          <Separator />

          {/* Status banner for non-active petitions */}
          {petition.status !== "VOTING" && (
            <PetitionStatusBanner status={petition.status} />
          )}

          <PetitionBody content={petition.content} />

          {voteSummary && (
            <PetitionVote
              {...voteSummary}
              isActive={petition.status === "VOTING"}
              votingEndAt={petition.votingEndAt}
              onVote={handleVote}
            />
          )}

          <PetitionActions
            petitionId={id}
            status={petition.status}
            isAuthor={isAuthor}
            canManageAsAdmin={canManageAsAdmin}
            totalVotes={voteSummary?.totalCount || 0}
          />

          {officialResponseContent && (
            <PetitionOfficialResponse
              content={officialResponseContent}
              respondent={petition.councilName}
              date="-"
            />
          )}

          <Separator />

          <PetitionComments
            comments={comments}
            totalCount={totalCommentCount}
            onCreateComment={handleCreateComment}
            onCreateReply={handleCreateReply}
            onDeleteComment={handleDeleteComment}
            onReportComment={handleReportComment}
          />
        </div>
      </main>
    </div>
  )
}
