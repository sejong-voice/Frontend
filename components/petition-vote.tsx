"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThumbsUp, ThumbsDown, CheckCircle2, Info } from "lucide-react"
import type { PetitionStatus } from "@/components/petition-detail-header"

interface PetitionVoteProps {
  status: PetitionStatus
  votesFor: number
  votesAgainst: number
  threshold: number
}

export function PetitionVote({
  status,
  votesFor: initialFor,
  votesAgainst: initialAgainst,
  threshold,
}: PetitionVoteProps) {
  const [votesFor, setVotesFor] = useState(initialFor)
  const [votesAgainst, setVotesAgainst] = useState(initialAgainst)
  const [userVote, setUserVote] = useState<"for" | "against" | null>(null)

  const totalVotes = votesFor + votesAgainst
  const forPercent =
    totalVotes > 0 ? Math.round((votesFor / totalVotes) * 100) : 0
  const againstPercent = totalVotes > 0 ? 100 - forPercent : 0
  const isActive = status === "진행중"
  const isApproved = status === "승인됨" || status === "답변완료"
  const meetsThreshold = votesFor >= threshold

  function handleVote(type: "for" | "against") {
    if (!isActive) return

    if (userVote === type) {
      // Toggle off
      if (type === "for") setVotesFor((v) => v - 1)
      else setVotesAgainst((v) => v - 1)
      setUserVote(null)
    } else if (userVote === null) {
      // Fresh vote
      if (type === "for") setVotesFor((v) => v + 1)
      else setVotesAgainst((v) => v + 1)
      setUserVote(type)
    } else {
      // Switch vote
      if (type === "for") {
        setVotesFor((v) => v + 1)
        setVotesAgainst((v) => v - 1)
      } else {
        setVotesAgainst((v) => v + 1)
        setVotesFor((v) => v - 1)
      }
      setUserVote(type)
    }
  }

  return (
    <section
      className="rounded-lg border-2 border-border bg-card px-6 py-6 md:px-8"
      aria-label="투표 영역"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {"투표 현황"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {"총 "}
            <span className="font-semibold text-foreground">{totalVotes}</span>
            {"명 참여"}
          </span>
        </div>

        {/* Vote bar */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <ThumbsUp className="h-4 w-4" />
              {"찬성 "}
              {forPercent}
              {"%"}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              {"반대 "}
              {againstPercent}
              {"%"}
              <ThumbsDown className="h-4 w-4" />
            </span>
          </div>

          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
            {totalVotes > 0 && (
              <>
                <div
                  className="rounded-l-full bg-primary transition-all duration-500"
                  style={{ width: `${forPercent}%` }}
                />
                <div
                  className="rounded-r-full bg-muted-foreground/30 transition-all duration-500"
                  style={{ width: `${againstPercent}%` }}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {"찬성 "}
              {votesFor}
              {"표"}
            </span>
            <span>
              {"반대 "}
              {votesAgainst}
              {"표"}
            </span>
          </div>
        </div>

        {/* Vote buttons */}
        {isActive ? (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleVote("for")}
              className={cn(
                "flex-1 gap-2",
                userVote === "for"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
              )}
              variant={userVote === "for" ? "default" : "outline"}
            >
              <ThumbsUp className="h-4 w-4" />
              {"찬성"}
              {userVote === "for" && (
                <span className="text-xs opacity-75">{"(선택됨)"}</span>
              )}
            </Button>
            <Button
              onClick={() => handleVote("against")}
              className={cn(
                "flex-1 gap-2",
                userVote === "against"
                  ? "bg-foreground text-background"
                  : "bg-transparent"
              )}
              variant={userVote === "against" ? "default" : "outline"}
            >
              <ThumbsDown className="h-4 w-4" />
              {"반대"}
              {userVote === "against" && (
                <span className="text-xs opacity-75">{"(선택됨)"}</span>
              )}
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {"투표가 마감되었습니다."}
          </p>
        )}

        {/* Status hint */}
        <div
          className={cn(
            "flex items-start gap-2 rounded-md px-4 py-3 text-sm",
            meetsThreshold || isApproved
              ? "bg-green-50 text-green-700"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {meetsThreshold || isApproved ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>
            {isApproved
              ? "투표 조건을 충족하여 승인되었습니다."
              : meetsThreshold
                ? "승인 조건을 충족하였습니다. 조기 승인이 진행됩니다."
                : `승인 기준(찬성 ${threshold}표)에 아직 도달하지 않았습니다.`}
          </span>
        </div>
      </div>
    </section>
  )
}
