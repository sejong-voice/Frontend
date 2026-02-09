import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MessageSquare, Vote } from "lucide-react"

export type PetitionStatus = "진행중" | "승인됨" | "답변완료" | "미승인" | "반려"
export type PetitionCategory = "학사제도" | "학교시설" | "학생복지" | "기타"

export interface Petition {
  id: number
  status: PetitionStatus
  category: PetitionCategory
  title: string
  comments: number
  votes: number
  author: string
  date: string
}

const statusStyles: Record<PetitionStatus, string> = {
  진행중: "border-primary/30 bg-accent text-accent-foreground",
  승인됨: "border-blue-200 bg-blue-50 text-blue-700",
  답변완료: "border-green-200 bg-green-50 text-green-700",
  미승인: "border-border bg-secondary text-muted-foreground",
  반려: "border-orange-200 bg-orange-50 text-orange-700",
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
      <div className="hidden border-b border-border bg-secondary/50 px-6 py-3 md:grid md:grid-cols-[100px_80px_1fr_140px_100px_100px]  md:items-center md:gap-4">
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
          {"작성자"}
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
              <div className="hidden px-6 py-4 md:grid md:grid-cols-[100px_80px_1fr_140px_100px_100px] md:items-center md:gap-4">
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
                <span className="truncate text-sm font-medium text-foreground">
                  {petition.title}
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
                <span className="text-xs text-muted-foreground">
                  {petition.author}
                </span>
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
                    {petition.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {petition.category}
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{petition.author}</span>
                    <span>{"·"}</span>
                    <span>{petition.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
