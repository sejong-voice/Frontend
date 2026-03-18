"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, Loader2, LogIn, ThumbsDown, ThumbsUp } from "lucide-react"
import type { VoteChoice, VoteSummaryResponse } from "@/app/api/posts"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PetitionVoteProps extends VoteSummaryResponse {
  isActive: boolean
  onVote?: (choice: VoteChoice) => Promise<void>
}

export function PetitionVote({
  agreeCount,
  disagreeCount,
  totalCount,
  isActive,
  onVote,
}: PetitionVoteProps) {
  const { user } = useAuth()
  const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null)
  const [pendingChoice, setPendingChoice] = useState<VoteChoice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const agreePercent =
    totalCount > 0 ? Math.round((agreeCount / totalCount) * 100) : 0
  const disagreePercent = totalCount > 0 ? 100 - agreePercent : 0

  async function handleVote(choice: VoteChoice) {
    if (!user || !isActive || !onVote || isSubmitting) return

    setIsSubmitting(true)
    setPendingChoice(choice)
    setFeedback(null)

    try {
      await onVote(choice)
      setSelectedChoice(choice)
      setFeedback({
        type: "success",
        message: "투표가 반영되었습니다.",
      })
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "투표를 처리하지 못했습니다."

      setFeedback({
        type: "error",
        message,
      })
    } finally {
      setIsSubmitting(false)
      setPendingChoice(null)
    }
  }

  return (
    <section
      className="rounded-lg border-2 border-border bg-card px-6 py-6 md:px-8"
      aria-label="투표 현황"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">투표 현황</h2>
          <span className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{totalCount}</span>명
            참여
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <ThumbsUp className="h-4 w-4" />
              찬성 {agreePercent}%
            </span>
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              반대 {disagreePercent}%
              <ThumbsDown className="h-4 w-4" />
            </span>
          </div>

          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
            {totalCount > 0 && (
              <>
                <div
                  className="rounded-l-full bg-primary transition-all duration-500"
                  style={{ width: `${agreePercent}%` }}
                />
                <div
                  className="rounded-r-full bg-muted-foreground/30 transition-all duration-500"
                  style={{ width: `${disagreePercent}%` }}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>찬성 {agreeCount}표</span>
            <span>반대 {disagreeCount}표</span>
          </div>
        </div>

        {isActive ? (
          user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleVote("AGREE")}
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 gap-2",
                    selectedChoice === "AGREE"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  )}
                  variant={selectedChoice === "AGREE" ? "default" : "outline"}
                >
                  {isSubmitting && pendingChoice === "AGREE" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="h-4 w-4" />
                  )}
                  찬성
                </Button>
                <Button
                  onClick={() => handleVote("DISAGREE")}
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 gap-2",
                    selectedChoice === "DISAGREE"
                      ? "bg-foreground text-background"
                      : "bg-transparent"
                  )}
                  variant={selectedChoice === "DISAGREE" ? "default" : "outline"}
                >
                  {isSubmitting && pendingChoice === "DISAGREE" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="h-4 w-4" />
                  )}
                  반대
                </Button>
              </div>

              {feedback && (
                <div
                  className={cn(
                    "rounded-md px-4 py-3 text-sm",
                    feedback.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {feedback.message}
                </div>
              )}
            </div>
          ) : (
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                로그인 후 투표에 참여할 수 있습니다
              </Link>
            </Button>
          )
        ) : (
          <div className="rounded-md bg-secondary px-4 py-3 text-center text-sm text-muted-foreground">
            투표가 마감되었습니다.
          </div>
        )}

        {feedback?.type === "success" && (
          <div className="flex items-start gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>현재 투표 현황이 새로 반영되었습니다.</span>
          </div>
        )}
      </div>
    </section>
  )
}
