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

interface PetitionDetailResponse {
  id: string
  userId: string
  userStudentNo: string
  councilId: string
  councilName: string
  title: string
  content: string
  status: PetitionStatus
  resultContent?: string | null
  resultCreatedAt?: string | null
  resultUpdatedAt?: string | null
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

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}.${month}.${day} ${hours}:${minutes}`
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
  }, [id])

  const handleCreateComment = useCallback(
    async (content: string) => {
      await commentService.createComment({
        postId: id,
        parentId: null,
        content,
      })

      try {
        await fetchComments()
      } catch (refreshError) {
        console.error("댓글 목록 갱신 실패:", refreshError)
      }
    },
    [fetchComments, id]
  )

  const handleCreateReply = useCallback(
    async (parentId: string, content: string) => {
      await commentService.createComment({
        postId: id,
        parentId,
        content,
      })

      try {
        await fetchComments()
      } catch (refreshError) {
        console.error("대댓글 목록 갱신 실패:", refreshError)
      }
    },
    [fetchComments, id]
  )

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      await commentService.deleteComment(commentId)

      try {
        await fetchComments()
      } catch (refreshError) {
        console.error("댓글 삭제 후 목록 갱신 실패:", refreshError)
      }
    },
    [fetchComments]
  )

  const handleReportComment = useCallback(
    async (commentId: string, reason: CommentReportReason) => {
      await commentService.reportComment(commentId, { reason })
    },
    []
  )

  const handleReportPost = useCallback(
    async (reason: PostReportReason) => {
      await postService.reportPost(id, { reason })
    },
    [id]
  )

  const handleVote = useCallback(
    async (choice: VoteChoice) => {
      await postService.castVote(id, { choice })

      try {
        await fetchVoteSummary()
      } catch (refreshError) {
        console.error("투표 결과 갱신 실패:", refreshError)
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
        const [
          postResult,
          voteSummaryResult,
          commentsResult,
          assignedPetitionsResult,
        ] = await Promise.allSettled([
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
      } catch (fetchError) {
        console.error("게시글 상세 조회 실패:", fetchError)

        if (!isMounted) return
        setPetition(null)
        setError("게시글 정보를 불러오지 못했습니다.")
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
  }, [id, isAdmin])

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
  const shouldShowOfficialResponse =
    (petition.status === "COMPLETED" || petition.status === "REJECTED") &&
    !!petition.resultContent?.trim()
  const officialResponseDateSource =
    petition.resultCreatedAt || petition.resultUpdatedAt || ""
  const officialResponseDate = officialResponseDateSource
    ? `게시 ${formatDateTime(officialResponseDateSource)}`
    : "-"
  const isOfficialResponseEdited =
    !!petition.resultCreatedAt &&
    !!petition.resultUpdatedAt &&
    petition.resultCreatedAt !== petition.resultUpdatedAt

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

          {shouldShowOfficialResponse && (
            <PetitionOfficialResponse
              content={petition.resultContent ?? ""}
              respondent={petition.councilName}
              date={officialResponseDate}
              isEdited={isOfficialResponseEdited}
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
