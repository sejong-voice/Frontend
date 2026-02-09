"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageSquare, Vote, Pencil, Trash2 } from "lucide-react"
import type { Petition, PetitionStatus } from "@/components/petition-list"

const statusStyles: Record<PetitionStatus, string> = {
  진행중: "border-primary/30 bg-accent text-accent-foreground",
  승인됨: "border-blue-200 bg-blue-50 text-blue-700",
  답변완료: "border-green-200 bg-green-50 text-green-700",
  미승인: "border-border bg-secondary text-muted-foreground",
  반려: "border-orange-200 bg-orange-50 text-orange-700",
}

interface MyPetitionListProps {
  petitions: Petition[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
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
          const canDelete = petition.votes === 0

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
                        statusStyles[petition.status]
                      )}
                    >
                      {petition.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {petition.category}
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
                    {petition.date}
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
                        "h-7 px-2 text-xs",
                        canDelete
                          ? "text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          : "text-muted-foreground/40 cursor-not-allowed"
                      )}
                      disabled={!canDelete}
                      onClick={(e) => {
                        e.preventDefault()
                        if (canDelete) onDelete?.(petition.id)
                      }}
                      aria-label={
                        canDelete
                          ? `${petition.title} 삭제`
                          : `${petition.title} 삭제 불가 - 투표 참여자 존재`
                      }
                      title={
                        !canDelete
                          ? "투표 참여자가 있어 삭제할 수 없습니다"
                          : undefined
                      }
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
                          statusStyles[petition.status]
                        )}
                      >
                        {petition.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {petition.category}
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
                          "h-7 px-2 text-xs",
                          canDelete
                            ? "text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            : "text-muted-foreground/40 cursor-not-allowed"
                        )}
                        disabled={!canDelete}
                        onClick={(e) => {
                          e.preventDefault()
                          if (canDelete) onDelete?.(petition.id)
                        }}
                        aria-label={
                          canDelete
                            ? `${petition.title} 삭제`
                            : `${petition.title} 삭제 불가`
                        }
                        title={
                          !canDelete
                            ? "투표 참여자가 있어 삭제할 수 없습니다"
                            : undefined
                        }
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
                      {petition.date}
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
