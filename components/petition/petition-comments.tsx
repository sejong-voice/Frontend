"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Flag,
  CornerDownRight,
  Send,
  ChevronDown,
  ChevronUp,
  Trash2,
  Reply,
  LogIn,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

interface ReplyData {
  id: number
  author: string
  content: string
  date: string
  isMine: boolean
}

export interface Comment {
  id: number
  author: string
  content: string
  date: string
  isMine: boolean
  replies: ReplyData[]
}

interface PetitionCommentsProps {
  comments: Comment[]
  totalCount: number
}

function CommentItem({
  comment,
  isReply = false,
  onReply,
  isLoggedIn = false,
}: {
  comment: Comment | ReplyData
  isReply?: boolean
  onReply?: () => void
  isLoggedIn?: boolean
}) {
  const [showReportConfirm, setShowReportConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  return (
    <div className={cn("flex gap-3", isReply && "ml-10 md:ml-12")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-secondary text-xs text-muted-foreground">
          {"익"}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {"익명"}
          </span>
          <span className="text-xs text-muted-foreground">{comment.date}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {comment.content}
        </p>
        {isLoggedIn && (
        <div className="mt-1 flex items-center gap-3">
          {/* Reply button (only for top-level comments) */}
          {!isReply && onReply && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              type="button"
            >
              <Reply className="h-3 w-3" />
              {"답글"}
            </button>
          )}

          {/* Delete button - only for my comments */}
          {comment.isMine && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              type="button"
            >
              <Trash2 className="h-3 w-3" />
              {"삭제"}
            </button>
          )}
          {showDeleteConfirm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {"삭제하시겠습니까?"}
              </span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs font-medium text-destructive"
                type="button"
              >
                {"확인"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs text-muted-foreground"
                type="button"
              >
                {"취소"}
              </button>
            </div>
          )}

          {/* Report button - only for others' comments */}
          {!comment.isMine && !showReportConfirm && (
            <button
              onClick={() => setShowReportConfirm(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              type="button"
            >
              <Flag className="h-3 w-3" />
              {"신고"}
            </button>
          )}
          {showReportConfirm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {"신고하시겠습니까?"}
              </span>
              <button
                onClick={() => setShowReportConfirm(false)}
                className="text-xs font-medium text-destructive"
                type="button"
              >
                {"확인"}
              </button>
              <button
                onClick={() => setShowReportConfirm(false)}
                className="text-xs text-muted-foreground"
                type="button"
              >
                {"취소"}
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

function ReplyInput({ onCancel }: { onCancel: () => void }) {
  const [text, setText] = useState("")

  return (
    <div className="ml-10 flex flex-col gap-2 rounded-md border border-border bg-secondary/50 p-3 md:ml-12">
      <Textarea
        placeholder="답글을 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[60px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-xs"
        >
          {"취소"}
        </Button>
        <Button size="sm" disabled={!text.trim()} className="gap-1 text-xs">
          <Send className="h-3 w-3" />
          {"답글 등록"}
        </Button>
      </div>
    </div>
  )
}

function CommentThread({ comment, isLoggedIn }: { comment: Comment; isLoggedIn: boolean }) {
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const hasReplies = comment.replies.length > 0

  return (
    <div className="flex flex-col gap-4">
      <CommentItem
        comment={comment}
        onReply={() => setShowReplyInput(!showReplyInput)}
        isLoggedIn={isLoggedIn}
      />

      {hasReplies && (
        <>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="ml-11 flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 md:ml-12"
            type="button"
          >
            <CornerDownRight className="h-3 w-3" />
            {showReplies ? (
              <>
                {"답글 숨기기"}
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                {"답글 "}
                {comment.replies.length}
                {"개 보기"}
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
          {showReplies && (
            <div className="flex flex-col gap-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply as unknown as Comment}
                  isReply
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showReplyInput && (
        <ReplyInput onCancel={() => setShowReplyInput(false)} />
      )}
    </div>
  )
}

export function PetitionComments({
  comments,
  totalCount,
}: PetitionCommentsProps) {
  const { user, isActive: isUserActive, isAdmin, isSuper } = useAuth()
  const [newComment, setNewComment] = useState("")

  // ADMIN/SUPER는 댓글 작성 불가 (학생만 가능)
  const canWriteComment = user && isUserActive && !isAdmin && !isSuper

  return (
    <section aria-label="댓글 영역">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            {"댓글"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {totalCount}
            {"개"}
          </span>
        </div>

        {/* Comment input - only for students, ADMIN/SUPER don't see comment form */}
        {canWriteComment ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <Textarea
              placeholder="의견을 남겨주세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                disabled={!newComment.trim()}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {"등록"}
              </Button>
            </div>
          </div>
        ) : user && !isUserActive && !isAdmin && !isSuper ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <p className="text-center text-sm text-muted-foreground">
              {"계정이 활성 상태가 아니어서 댓글을 작성할 수 없습니다."}
            </p>
          </div>
        ) : !user ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                {"로그인 후 댓글을 작성할 수 있습니다"}
              </Link>
            </Button>
          </div>
        ) : null}

        {/* Comment list */}
        <div className="flex flex-col gap-0">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={cn(
                "py-5",
                index !== comments.length - 1 && "border-b border-border"
              )}
            >
              <CommentThread comment={comment} isLoggedIn={!!user} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
