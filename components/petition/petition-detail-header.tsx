"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calendar, User, Building2, Flag, Folder } from "lucide-react"
import Link from "next/link"

export type PetitionStatus =
  | "진행중"
  | "승인됨"
  | "미승인"
  | "답변완료"
  | "반려"

const statusStyles: Record<PetitionStatus, string> = {
  진행중: "border-primary/30 bg-accent text-accent-foreground",
  승인됨: "border-blue-200 bg-blue-50 text-blue-700",
  답변완료: "border-green-200 bg-green-50 text-green-700",
  미승인: "border-border bg-secondary text-muted-foreground",
  반려: "border-orange-200 bg-orange-50 text-orange-700",
}

const referrerMap: Record<string, { href: string; label: string }> = {
  all: { href: "/", label: "전체 청원" },
  "in-progress": { href: "/in-progress", label: "진행중" },
  answered: { href: "/answered", label: "답변완료" },
  my: { href: "/my-petitions", label: "내 청원" },
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
  date: string
  council: string
  showReportAction?: boolean
  onReport?: () => Promise<void>
}

export function PetitionDetailHeader({
  title,
  status,
  category,
  studentId,
  date,
  council,
  showReportAction = false,
  onReport,
}: PetitionDetailHeaderProps) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")
  const back = (fromParam && referrerMap[fromParam]) || referrerMap.all
  const [showReportConfirm, setShowReportConfirm] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [reportFeedback, setReportFeedback] = useState<string | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)

  async function handleReport() {
    if (!onReport || isReporting) return

    setIsReporting(true)
    setReportError(null)
    try {
      await onReport()
      setShowReportConfirm(false)
      setReportFeedback("신고가 접수되었습니다.")
    } catch {
      setReportError("게시글 신고에 실패했습니다. 잠시 후 다시 시도해 주세요.")
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
            {status}
          </Badge>

          {showReportAction && !showReportConfirm && (
            <button
              onClick={() => setShowReportConfirm(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              type="button"
            >
              <Flag className="h-3.5 w-3.5" />
              신고
            </button>
          )}
        </div>

        {showReportConfirm && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>이 게시글을 신고하시겠습니까?</span>
            <button
              onClick={handleReport}
              disabled={isReporting}
              className="font-medium text-destructive disabled:opacity-60"
              type="button"
            >
              {isReporting ? "처리중.." : "확인"}
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
            {"익명 (" + maskStudentId(studentId) + ")"}
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
