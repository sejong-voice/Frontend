"use client"

import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calendar, User, Building2, Folder } from "lucide-react"
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
}

export function PetitionDetailHeader({
  title,
  status,
  category,
  studentId,
  date,
  council,
}: PetitionDetailHeaderProps) {
  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from")
  const back = (fromParam && referrerMap[fromParam]) || referrerMap.all

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
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusStyles[status])}
          >
            {status}
          </Badge>
        </div>

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
