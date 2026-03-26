"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import type { PostReportReason } from "@/app/api/posts"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ArrowLeft, Building2, Calendar, Flag, Folder, User } from "lucide-react"

export type PetitionStatus = 
  | "VOTING" 
  | "APPROVED" 
  | "PENDING" 
  | "COMPLETED" 
  | "REJECTED" 
  | "DELETED"

export const statusLabelMap: Record<PetitionStatus, string> = {
  VOTING: "투표중",
  APPROVED: "검토중",
  PENDING: "부결",
  COMPLETED: "처리완료",
  REJECTED: "반려",
  DELETED: "삭제됨",
}

const statusStyles: Record<PetitionStatus, string> = {
  VOTING: "border-primary/30 bg-accent text-accent-foreground",
  APPROVED: "border-blue-200 bg-blue-50 text-blue-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  PENDING: "border-border bg-secondary text-muted-foreground",
  REJECTED: "border-orange-200 bg-orange-50 text-orange-700",
  DELETED: "border-red-200 bg-red-50 text-red-700",
}

const referrerMap: Record<string, { href: string; label: string }> = {
  all: { href: "/", label: "전체 청원" },
  "in-progress": { href: "/in-progress", label: "진행중" },
  answered: { href: "/answered", label: "답변완료" },
  my: { href: "/my-petitions", label: "내 청원" },
}

const POST_REPORT_REASON_OPTIONS: { value: PostReportReason; label: string }[] = [
  { value: "SPAM", label: "스팸/광고" },
  { value: "ABUSE", label: "욕설/비방" },
  { value: "HATE", label: "혐오/차별" },
  { value: "PRIVACY", label: "개인정보 노출" },
  { value: "DUPLICATE", label: "중복 청원" },
  { value: "OTHER", label: "기타" },
]

function getReportErrorMessage(error: unknown, fallback: string): string {
  const message = (
    error as {
      response?: { data?: { message?: string } }
    }
  )?.response?.data?.message

  return typeof message === "string" && message.trim() ? message : fallback
}

function maskStudentId(id: string): string {
  if (id.length <= 3) return id
  return id.slice(0, -3) + "***"
}

interface PetitionDetailHeaderProps {
  title: string
  status: PetitionStatus
  category: string
  studentId: string
  userName?: string
  date: string
  council: string
  showReportAction?: boolean
  onReport?: (reason: PostReportReason) => Promise<void>
}

export function PetitionDetailHeader({
  title,
  status,
  category,
  studentId,
  userName,
  date,
  council,
  showReportAction = false,
  onReport,
}: PetitionDetailHeaderProps) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")
  const back = (fromParam && referrerMap[fromParam]) || referrerMap.all
  const [showReportConfirm, setShowReportConfirm] = useState(false)
  const [selectedReason, setSelectedReason] = useState<PostReportReason>("SPAM")
  const [isReporting, setIsReporting] = useState(false)
  const [reportFeedback, setReportFeedback] = useState<string | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)

  function openReportConfirm() {
    setShowReportConfirm(true)
    setReportFeedback(null)
    setReportError(null)
  }

  async function handleReport() {
    if (!onReport || isReporting) return

    setIsReporting(true)
    setReportError(null)
    try {
      await onReport(selectedReason)
      setShowReportConfirm(false)
      setReportFeedback("신고가 접수되었습니다.")
    } catch (error) {
      setReportError(
        getReportErrorMessage(
          error,
          "게시글 신고에 실패했습니다. 잠시 후 다시 시도해 주세요."
        )
      )
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={back.href}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {back.label + " 목록으로"}
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusStyles[status])}
          >
            {statusLabelMap[status] || status}
          </Badge>

          {showReportAction && !showReportConfirm && (
            <button
              onClick={openReportConfirm}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              type="button"
            >
              <Flag className="h-3.5 w-3.5" />
              신고
            </button>
          )}
        </div>

        {showReportConfirm && (
          <div className="flex max-w-sm flex-col gap-2 rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
            <span>신고 사유를 선택해 주세요.</span>
            <Select
              value={selectedReason}
              onValueChange={(value) => setSelectedReason(value as PostReportReason)}
              disabled={isReporting}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="신고 사유 선택" />
              </SelectTrigger>
              <SelectContent>
                {POST_REPORT_REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleReport}
                disabled={isReporting}
                className="font-medium text-destructive disabled:opacity-60"
                type="button"
              >
                {isReporting ? "처리 중..." : "확인"}
              </button>
              <button
                onClick={() => setShowReportConfirm(false)}
                disabled={isReporting}
                className="disabled:opacity-60"
                type="button"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {reportFeedback && (
          <p className="text-xs text-green-700">{reportFeedback}</p>
        )}

        {reportError && (
          <p className="text-xs text-destructive">{reportError}</p>
        )}

        <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {userName || maskStudentId(studentId)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {council}
          </span>
          <span className="flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            {category}
          </span>
        </div>
      </div>
    </div>
  )
}
