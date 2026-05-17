"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, LogIn, ThumbsDown, ThumbsUp } from "lucide-react"
import type { VoteChoice, VoteSummaryResponse } from "@/app/api/posts"
import { useAuth } from "@/components/auth/auth-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PetitionVoteProps extends VoteSummaryResponse {
  isActive: boolean
  canVote?: boolean
  myVoteChoice?: VoteChoice | null
  votingEndAt?: string
  onVote?: (choice: VoteChoice) => Promise<void>
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function formatRatioPercent(value: number) {
  const percent = value <= 1 ? value * 100 : value
  return Math.round(percent)
}

export function PetitionVote({
  agreeCount,
  disagreeCount,
  totalCount,
  minVote,
  remainingVotesToMinVote,
  requiredAgreeRatio,
  agreeRatio,
  isActive,
  canVote = true,
  myVoteChoice = null,
  votingEndAt,
  onVote,
}: PetitionVoteProps) {
  const { user, isAdmin } = useAuth()
  const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(
    myVoteChoice,
  )
  const [pendingChoice, setPendingChoice] = useState<VoteChoice | null>(null)
  const [confirmChoice, setConfirmChoice] = useState<VoteChoice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const actualTotalVotes = agreeCount + disagreeCount
  const agreePercent = actualTotalVotes > 0 ? Math.round((agreeCount / actualTotalVotes) * 100) : 0
  const disagreePercent = actualTotalVotes > 0 ? 100 - agreePercent : 0
  const hasApprovalCriteria =
    isFiniteNumber(minVote) &&
    isFiniteNumber(remainingVotesToMinVote) &&
    isFiniteNumber(requiredAgreeRatio) &&
    isFiniteNumber(agreeRatio)
  const remainingVoteCount = hasApprovalCriteria
    ? Math.max(remainingVotesToMinVote, 0)
    : 0
  const currentAgreeRatioPercent = hasApprovalCriteria
    ? formatRatioPercent(agreeRatio)
    : agreePercent
  const requiredAgreeRatioPercent = hasApprovalCriteria
    ? formatRatioPercent(requiredAgreeRatio)
    : 0
  const votingEndDate = votingEndAt
    ? new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date(votingEndAt))
        .replace(/\s/g, "")
        .replace(/\.$/, "")
    : null

  useEffect(() => {
    setSelectedChoice(myVoteChoice)
  }, [myVoteChoice])

  function openVoteConfirm(choice: VoteChoice) {
    if (!user || !isActive || !onVote || isSubmitting) return

    setFeedback(null)

    if (selectedChoice !== null) {
      void handleVote(choice)
      return
    }

    setConfirmChoice(choice)
  }

  async function handleVote(choice: VoteChoice) {
    if (!user || !isActive || !onVote || isSubmitting) return

    setConfirmChoice(null)
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
    <>
      <section
        className="rounded-lg border-2 border-border bg-card px-6 py-6 md:px-8"
        aria-label="투표 현황"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">투표 현황</h2>
            <span className="text-sm text-muted-foreground">
              총 <span className="font-semibold text-foreground">{actualTotalVotes}</span>명
              참여
            </span>
          </div>

          {votingEndDate && (
            <p className="text-sm text-muted-foreground">
              투표 마감: {votingEndDate}
            </p>
          )}

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
              {actualTotalVotes > 0 && (
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

          {hasApprovalCriteria && (
            <div className="flex flex-col gap-1.5 rounded-md bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">최소 투표수</span>{" "}
                {actualTotalVotes} / {minVote}표 · {remainingVoteCount}표 더 필요
              </p>
              <p>
                <span className="font-medium text-foreground">찬성률</span>{" "}
                {currentAgreeRatioPercent}% / 기준 {requiredAgreeRatioPercent}%
              </p>
            </div>
          )}

          {isActive ? (
            isAdmin ? (
              <div className="rounded-md bg-secondary px-4 py-3 text-center text-sm text-muted-foreground">
                학생회(관리자) 계정은 투표에 참여할 수 없습니다.
              </div>
            ) : user ? (
              canVote === false ? (
                <div className="rounded-md bg-secondary px-4 py-3 text-center text-sm text-muted-foreground">
                  본인 소속 또는 상위 학생회 게시글에만 투표할 수 있습니다.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => openVoteConfirm("AGREE")}
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
                      onClick={() => openVoteConfirm("DISAGREE")}
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
              )
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

      <AlertDialog
        open={confirmChoice !== null}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setConfirmChoice(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>투표하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              투표 후에는 취소할 수 없습니다. 다만 다른 입장으로 다시
              투표하는 것은 가능합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting || confirmChoice === null}
              onClick={(event) => {
                event.preventDefault()
                if (!confirmChoice) return
                void handleVote(confirmChoice)
              }}
            >
              {isSubmitting ? "투표 중..." : "투표하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
