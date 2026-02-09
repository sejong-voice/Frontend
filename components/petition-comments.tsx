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
} from "lucide-react"

interface Reply {
  id: number
  author: string
  content: string
  date: string
}

export interface Comment {
  id: number
  author: string
  content: string
  date: string
  replies: Reply[]
}

interface PetitionCommentsProps {
  comments: Comment[]
  totalCount: number
}

function CommentItem({
  comment,
  isReply = false,
}: {
  comment: Comment | Reply
  isReply?: boolean
}) {
  const [showReportConfirm, setShowReportConfirm] = useState(false)
  const initial = comment.author.replace("*", "")[0] || "?"

  return (
    <div
      className={cn(
        "flex gap-3",
        isReply && "ml-10 md:ml-12"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-secondary text-xs text-muted-foreground">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author}
          </span>
          <span className="text-xs text-muted-foreground">{comment.date}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {comment.content}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {!showReportConfirm ? (
            <button
              onClick={() => setShowReportConfirm(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              type="button"
            >
              <Flag className="h-3 w-3" />
              {"신고"}
            </button>
          ) : (
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
      </div>
    </div>
  )
}

function CommentThread({ comment }: { comment: Comment }) {
  const [showReplies, setShowReplies] = useState(false)
  const hasReplies = comment.replies.length > 0

  return (
    <div className="flex flex-col gap-4">
      <CommentItem comment={comment} />
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
                <CommentItem key={reply.id} comment={reply as Comment} isReply />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function PetitionComments({
  comments,
  totalCount,
}: PetitionCommentsProps) {
  const [newComment, setNewComment] = useState("")

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

        {/* Comment input */}
        <div className="rounded-lg border border-border bg-card p-4">
          <Textarea
            placeholder="의견을 남겨주세요 (익명으로 게시됩니다)"
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
              <CommentThread comment={comment} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
