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
} from "lucide-react"
import type { PetitionStatus } from "@/components/petition/petition-detail-header"

interface PetitionActionsProps {
  status: PetitionStatus
  isAuthor: boolean
  isAdmin: boolean
  totalVotes: number
}

export function PetitionActions({
  status,
  isAuthor,
  isAdmin,
  totalVotes,
}: PetitionActionsProps) {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState("")

  const showAuthorActions = isAuthor
  const showAdminActions = isAdmin && status === "승인됨"
  const canDelete = isAuthor

  if (!showAuthorActions && !showAdminActions) return null

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
          >
            <Pencil className="h-3.5 w-3.5" />
            {"수정"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {"삭제"}
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
