"use client"

import { useState } from "react"
import Link from "next/link"
import type { CommentReportReason } from "@/app/api/comments"
import {
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Flag,
  LogIn,
  MessageSquare,
  Reply,
  Send,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface ReplyData {
  id: string
  author: string
  content: string
  date: string
  canDelete: boolean
}

export interface Comment {
  id: string
  author: string
  content: string
  date: string
  canDelete: boolean
  replies: ReplyData[]
}

const COMMENT_REPORT_REASON_OPTIONS: {
  value: CommentReportReason
  label: string
}[] = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "ABUSE", label: "욕설/비방" },
  { value: "HATE", label: "혐오/차별" },
  { value: "PRIVACY", label: "개인정보 노출" },
  { value: "OTHER", label: "기타" },
]

interface PetitionCommentsProps {
  comments: Comment[]
  totalCount: number
  readOnly?: boolean
  onCreateComment?: (content: string) => Promise<void>
  onCreateReply?: (parentId: string, content: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
  onReportComment?: (
    commentId: string,
    reason: CommentReportReason
  ) => Promise<void>
}

function CommentItem({
  comment,
  isReply = false,
  onReply,
  showActions = false,
  onDelete,
  onReport,
  disableReplyAction = false,
}: {
  comment: Comment | ReplyData
  isReply?: boolean
  onReply?: () => void
  showActions?: boolean
  onDelete?: (commentId: string) => Promise<void>
  onReport?: (
    commentId: string,
    reason: CommentReportReason
  ) => Promise<void>
  disableReplyAction?: boolean
}) {
  const [showReportConfirm, setShowReportConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [reportFeedback, setReportFeedback] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedReportReason, setSelectedReportReason] =
    useState<CommentReportReason>("SPAM")

  async function handleDelete() {
    if (!onDelete || isDeleting) return

    setIsDeleting(true)
    setActionError(null)
    try {
      await onDelete(comment.id)
      setShowDeleteConfirm(false)
    } catch {
      setActionError("댓글 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setIsDeleting(false)
    }
  }

  function openReportConfirm() {
    setShowReportConfirm(true)
    setReportFeedback(null)
    setActionError(null)
  }

  async function handleReport() {
    if (!onReport || isReporting) return

    setIsReporting(true)
    setActionError(null)
    try {
      await onReport(comment.id, selectedReportReason)
      setShowReportConfirm(false)
      setReportFeedback("신고가 접수되었습니다.")
    } catch {
      setActionError("댓글 신고에 실패했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <div className={cn("flex gap-3", isReply && "ml-10 md:ml-12")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-secondary text-xs text-muted-foreground">
          {comment.author.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author}
          </span>
          <span className="text-xs text-muted-foreground">{comment.date}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>

        {showActions && (
          <div className="mt-1 flex items-center gap-3">
            {!isReply && onReply && (
              <button
                onClick={onReply}
                disabled={disableReplyAction}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                type="button"
              >
                <Reply className="h-3 w-3" />
                답글
              </button>
            )}

            {comment.canDelete && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                type="button"
              >
                <Trash2 className="h-3 w-3" />
                삭제
              </button>
            )}

            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  댓글을 삭제하시겠습니까?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-xs font-medium text-destructive disabled:opacity-60"
                  type="button"
                >
                  {isDeleting ? "처리 중..." : "확인"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="text-xs text-muted-foreground disabled:opacity-60"
                  type="button"
                >
                  취소
                </button>
              </div>
            )}

            {!comment.canDelete && !showReportConfirm && (
              <button
                onClick={openReportConfirm}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                type="button"
              >
                <Flag className="h-3 w-3" />
                신고
              </button>
            )}

            {showReportConfirm && (
              <div className="flex min-w-[220px] flex-col gap-2 rounded-md border border-border bg-card p-3">
                <span className="text-xs text-muted-foreground">
                  신고 사유를 선택해 주세요.
                </span>
                <Select
                  value={selectedReportReason}
                  onValueChange={(value) =>
                    setSelectedReportReason(value as CommentReportReason)
                  }
                  disabled={isReporting}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="신고 사유 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMENT_REPORT_REASON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReport}
                    disabled={isReporting}
                    className="text-xs font-medium text-destructive disabled:opacity-60"
                    type="button"
                  >
                    {isReporting ? "처리 중..." : "확인"}
                  </button>
                  <button
                    onClick={() => setShowReportConfirm(false)}
                    disabled={isReporting}
                    className="text-xs text-muted-foreground disabled:opacity-60"
                    type="button"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {reportFeedback && (
          <p className="mt-1 text-xs text-green-700">{reportFeedback}</p>
        )}

        {actionError && (
          <p className="mt-1 text-xs text-destructive">{actionError}</p>
        )}
      </div>
    </div>
  )
}

function ReplyInput({
  onCancel,
  onSubmit,
  onSubmittingChange,
}: {
  onCancel: () => void
  onSubmit?: (content: string) => Promise<void>
  onSubmittingChange?: (isSubmitting: boolean) => void
}) {
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!text.trim() || !onSubmit) return

    setIsSubmitting(true)
    onSubmittingChange?.(true)
    setSubmitError(null)
    try {
      await onSubmit(text.trim())
      setText("")
      onCancel()
    } catch {
      setSubmitError("답글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setIsSubmitting(false)
      onSubmittingChange?.(false)
    }
  }

  return (
    <div className="ml-10 flex flex-col gap-2 rounded-md border border-border bg-secondary/50 p-3 md:ml-12">
      <Textarea
        placeholder="답글을 입력해 주세요."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isSubmitting}
        className="min-h-[60px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs"
        >
          취소
        </Button>
        <Button
          size="sm"
          disabled={!text.trim() || isSubmitting || !onSubmit}
          className="gap-1 text-xs"
          onClick={handleSubmit}
        >
          <Send className="h-3 w-3" />
          {isSubmitting ? "등록 중..." : "답글 등록"}
        </Button>
      </div>
      {submitError && (
        <p className="text-xs text-destructive">{submitError}</p>
      )}
    </div>
  )
}

function CommentThread({
  comment,
  showActions,
  onCreateReply,
  onDeleteComment,
  onReportComment,
}: {
  comment: Comment
  showActions: boolean
  onCreateReply?: (parentId: string, content: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
  onReportComment?: (
    commentId: string,
    reason: CommentReportReason
  ) => Promise<void>
}) {
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const hasReplies = comment.replies.length > 0

  return (
    <div className="flex flex-col gap-4">
      <CommentItem
        comment={comment}
        onReply={() => {
          if (isSubmittingReply) return
          setShowReplyInput((prev) => !prev)
        }}
        showActions={showActions}
        onDelete={onDeleteComment}
        onReport={onReportComment}
        disableReplyAction={isSubmittingReply}
      />

      {hasReplies && (
        <>
          <button
            onClick={() => setShowReplies((prev) => !prev)}
            className="ml-11 flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 md:ml-12"
            type="button"
          >
            <CornerDownRight className="h-3 w-3" />
            {showReplies ? (
              <>
                답글 숨기기
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                답글 {comment.replies.length}개 보기
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>

          {showReplies && (
            <div className="flex flex-col gap-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply
                  showActions={showActions}
                  onDelete={onDeleteComment}
                  onReport={onReportComment}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showReplyInput && showActions && (
        <ReplyInput
          onCancel={() => {
            if (isSubmittingReply) return
            setShowReplyInput(false)
          }}
          onSubmittingChange={setIsSubmittingReply}
          onSubmit={
            onCreateReply
              ? async (content) => {
                  await onCreateReply(comment.id, content)
                  setShowReplies(true)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}

export function PetitionComments({
  comments,
  totalCount,
  readOnly = false,
  onCreateComment,
  onCreateReply,
  onDeleteComment,
  onReportComment,
}: PetitionCommentsProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const showActions = !readOnly && !!user

  async function handleCreateComment() {
    if (!newComment.trim() || !onCreateComment) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onCreateComment(newComment.trim())
      setNewComment("")
    } catch {
      setSubmitError("댓글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-label="댓글 영역">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">댓글</h2>
          <span className="text-sm text-muted-foreground">{totalCount}개</span>
        </div>

        {!readOnly && (
          <>
            {user ? (
              <div className="rounded-lg border border-border bg-card p-4">
                <Textarea
                  placeholder="댓글을 남겨보세요."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!newComment.trim() || isSubmitting || !onCreateComment}
                    className="gap-1.5"
                    onClick={handleCreateComment}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmitting ? "등록 중..." : "등록"}
                  </Button>
                </div>
                {submitError && (
                  <p className="mt-3 text-xs text-destructive">{submitError}</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    로그인 후 댓글을 작성할 수 있습니다
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        {comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              아직 등록된 댓글이 없습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={cn(
                  "py-5",
                  index !== comments.length - 1 && "border-b border-border"
                )}
              >
                <CommentThread
                  comment={comment}
                  showActions={showActions}
                  onCreateReply={onCreateReply}
                  onDeleteComment={onDeleteComment}
                  onReportComment={onReportComment}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
