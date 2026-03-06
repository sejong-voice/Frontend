"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  StopCircle,
} from "lucide-react"
import type { PetitionStatus } from "@/components/petition/petition-detail-header"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

interface PetitionActionsProps {
  petitionId: number
  status: PetitionStatus
  isAuthor: boolean
  councilId: number
  totalVotes: number
}

export function PetitionActions({
  petitionId,
  status,
  isAuthor,
  councilId,
  totalVotes,
}: PetitionActionsProps) {
  const { isSuper, isAdmin, canManageCouncil } = useAuth()
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState("")

  // 담당 ADMIN 또는 SUPER만 해당 학생회 청원을 관리 가능
  const canManage = canManageCouncil(councilId)

  // 작성자 액션: 작성자 본인 + STUDENT만 (ADMIN/SUPER는 청원 작성/수정 안함)
  const showAuthorActions = isAuthor && !isAdmin && !isSuper

  // 관리자 액션: 담당 ADMIN 또는 SUPER + VOTING 또는 APPROVED 상태
  const showAdminActions = canManage && (status === "VOTING" || status === "APPROVED")

  // 삭제 권한: 작성자(투표 0일 때만)
  const canAuthorDelete = isAuthor && totalVotes === 0 && !isAdmin && !isSuper

  // SUPER 전역 삭제 권한: SUPER는 모든 게시글 삭제 가능
  const showSuperDelete = isSuper

  if (!showAuthorActions && !showAdminActions && !showSuperDelete) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Author actions */}
      {showAuthorActions && (
        <section
          className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-4"
          aria-label="작성자 액션"
        >
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            {"작성자 관리:"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent"
            asChild
          >
            <Link href={`/petition/${petitionId}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              {"수정"}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canAuthorDelete}
            className="gap-1.5 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:text-muted-foreground disabled:opacity-50"
            title={
              !canAuthorDelete
                ? "투표 참여자가 있는 청원은 삭제할 수 없습니다."
                : undefined
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
            {"삭제"}
          </Button>
          {!canAuthorDelete && (
            <span className="text-xs text-muted-foreground">
              {"투표 참여자가 있어 삭제할 수 없습니다."}
            </span>
          )}
        </section>
      )}

      {/* SUPER delete action - can delete any post */}
      {showSuperDelete && (
        <section
          className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-destructive/20 bg-destructive/5 px-6 py-4"
          aria-label="전역 관리자 액션"
        >
          <span className="mr-1 text-xs font-medium text-destructive">
            {"전역 관리자:"}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {"게시글 삭제"}
          </Button>
        </section>
      )}

      {/* Admin actions */}
      {showAdminActions && (
        <section
          className="flex flex-col gap-4 rounded-lg border-2 border-primary/15 bg-accent/30 px-6 py-5"
          aria-label="학생회 관리 영역"
        >
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-foreground">
              {"학생회 관리자 처리"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {status === "VOTING" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-transparent text-orange-600 hover:bg-orange-50 hover:text-orange-700"
              >
                <StopCircle className="h-3.5 w-3.5" />
                {"조기 마감"}
              </Button>
            )}
            {status === "APPROVED" && (
              <>
                <Button size="sm" className="gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {"완료 처리"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {"반려 처리"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent"
                  onClick={() => setShowResponseForm(!showResponseForm)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {showResponseForm ? "입장문 작성 취소" : "공식 입장문 작성"}
                </Button>
              </>
            )}
          </div>

          {/* Inline response form */}
          {showResponseForm && (
            <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">
                {"공식 입장문 작성"}
              </p>
              <Textarea
                placeholder="학생회 공식 입장을 입력하세요..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[120px] resize-none text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {responseText.length}
                  {" / 2000자"}
                </span>
                <Button
                  size="sm"
                  disabled={!responseText.trim()}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {"등록"}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
