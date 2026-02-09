import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calendar, Folder, User, Building2 } from "lucide-react"
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
  반려: "border-red-200 bg-red-50 text-red-700",
}

interface PetitionDetailHeaderProps {
  title: string
  status: PetitionStatus
  category: string
  author: string
  date: string
  council: string
}

export function PetitionDetailHeader({
  title,
  status,
  category,
  author,
  date,
  council,
}: PetitionDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {"전체 청원 목록"}
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusStyles[status])}
          >
            {status}
          </Badge>
          <span className="text-xs text-muted-foreground">{category}</span>
        </div>

        <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {author}
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
