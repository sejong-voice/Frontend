import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MessageSquare, Vote } from "lucide-react"

export type PetitionStatus = "VOTING" | "APPROVED" | "PENDING" | "COMPLETED" | "REJECTED"

export interface Petition {
  id: number
  status: PetitionStatus
  title: string
  comments: number
  votes: number
  studentId: string
  date: string
  council: string
}

const statusLabels: Record<PetitionStatus, string> = {
  VOTING: "투표중",
  APPROVED: "승인됨",
  PENDING: "대기중",
  COMPLETED: "완료",
  REJECTED: "반려",
}

const statusStyles: Record<PetitionStatus, string> = {
  VOTING: "border-primary/30 bg-accent text-accent-foreground",
  APPROVED: "border-blue-200 bg-blue-50 text-blue-700",
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
}

interface PetitionListProps {
  petitions: Petition[]
  from?: string
}

export function PetitionList({ petitions, from = "all" }: PetitionListProps) {
  if (petitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-20">
        <p className="text-sm text-muted-foreground">
          {"검색 결과가 없습니다."}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Desktop table header */}
      <div className="hidden border-b border-border bg-secondary/50 px-6 py-3 md:grid md:grid-cols-[100px_1fr_120px_140px_100px]  md:items-center md:gap-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"상태"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"제목"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"담당"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {"참여"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
          {"작성일"}
        </span>
      </div>

      {/* Petition rows */}
      <ul role="list">
        {petitions.map((petition, index) => (
          <li key={petition.id}>
            <Link
              href={`/petition/${petition.id}?from=${from}`}
              className={cn(
                "block transition-colors hover:bg-muted/50",
                index !== petitions.length - 1 && "border-b border-border"
              )}
            >
              {/* Desktop row */}
              <div className="hidden px-6 py-4 md:grid md:grid-cols-[100px_1fr_120px_140px_100px] md:items-center md:gap-4">
                <div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      statusStyles[petition.status]
                    )}
                  >
                    {statusLabels[petition.status]}
                  </Badge>
                </div>
                <span className="truncate text-sm font-medium text-foreground">
                  {petition.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {petition.council}
                </span>
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
                <span className="text-right text-xs text-muted-foreground">
                  {petition.date}
                </span>
              </div>

              {/* Mobile row */}
              <div className="flex flex-col gap-2 px-5 py-4 md:hidden">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      statusStyles[petition.status]
                    )}
                  >
                    {statusLabels[petition.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {petition.council}
                  </span>
                </div>
                <span className="truncate text-sm font-medium text-foreground">
                  {petition.title}
                </span>
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
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
