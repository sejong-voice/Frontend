"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageSquare, Vote, Pencil, Trash2 } from "lucide-react"
import type { Petition, PetitionStatus } from "@/components/petition/petition-list"

const statusStyles: Record<PetitionStatus, { label: string; style: string }> = {
  VOTING: { label: "진행중", style: "border-primary/30 bg-accent text-accent-foreground" },
  APPROVED: { label: "승인됨", style: "border-blue-200 bg-blue-50 text-blue-700" },
  COMPLETED: { label: "답변완료", style: "border-green-200 bg-green-50 text-green-700" },
  PENDING: { label: "승인대기", style: "border-border bg-secondary text-muted-foreground" },
  REJECTED: { label: "반려", style: "border-orange-200 bg-orange-50 text-orange-700" },
  DELETED: { label: "삭제됨", style: "border-red-200 bg-red-50 text-red-700" },
}

interface MyPetitionListProps {
  petitions: Petition[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function MyPetitionList({
  petitions,
  onEdit,
  onDelete,
}: MyPetitionListProps) {
  if (petitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-20">
        <p className="text-sm text-muted-foreground">
          {"작성한 청원이 없습니다."}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Desktop table header */}
      <div className="hidden border-b border-border bg-secondary/50 px-6 py-3 md:grid md:grid-cols-[100px_80px_1fr_120px_100px_90px] md:items-center md:gap-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"상태"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"분류"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"제목"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"참여"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"작성일"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
          {"관리"}
        </span>
      </div>

      {/* Petition rows */}
      <ul role="list">
        {petitions.map((petition, index) => {
          const statusKey = petition.status?.toUpperCase() as PetitionStatus
          const isExpired = petition.votingEndAt && new Date(petition.votingEndAt) < new Date()
          const effectiveStatus = (statusKey === "VOTING" && isExpired) ? "PENDING" : statusKey
          const statusInfo = statusStyles[effectiveStatus] || { label: petition.status, style: "" }

          return (
            <li key={petition.id}>
              <div
                className={cn(
                  "transition-colors",
                  index !== petitions.length - 1 && "border-b border-border"
                )}
              >
                {/* Desktop row */}
                <div className="hidden md:grid md:grid-cols-[100px_80px_1fr_120px_100px_90px] md:items-center md:gap-4 px-6 py-4">
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        statusInfo.style
                      )}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {petition.councilName || "기타"}
                  </span>
                  <Link
                    href={`/petition/${petition.id}?from=my`}
                    className="truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {petition.title}
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Vote className="h-3.5 w-3.5" />
                      {petition.votes}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {petition.comments}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {petition.createdAt ? new Date(petition.createdAt).toLocaleDateString() : "-"}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault()
                        onEdit?.(petition.id)
                      }}
                      aria-label={`${petition.title} 수정`}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {"수정"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        onDelete?.(petition.id)
                      }}
                      aria-label={`${petition.title} 삭제`}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {"삭제"}
                    </Button>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="flex flex-col gap-2 px-5 py-4 md:hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          statusInfo.style
                        )}
                      >
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {petition.councilName || "기타"}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.preventDefault()
                          onEdit?.(petition.id)
                        }}
                        aria-label={`${petition.title} 수정`}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                        "h-7 px-2 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        )}
                        onClick={(e) => {
                          e.preventDefault()
                          onDelete?.(petition.id)
                        }}
                        aria-label={`${petition.title} 삭제`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Link
                    href={`/petition/${petition.id}?from=my`}
                    className="truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {petition.title}
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Vote className="h-3.5 w-3.5" />
                        {petition.votes}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {petition.comments}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {petition.createdAt ? new Date(petition.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
