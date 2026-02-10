import React from "react"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  XCircle,
  MessageSquareText,
  AlertCircle,
} from "lucide-react"
import type { PetitionStatus } from "@/components/petition/petition-detail-header"

interface PetitionStatusBannerProps {
  status: PetitionStatus
}

const config: Partial<
  Record<
    PetitionStatus,
    {
      icon: React.ElementType
      message: string
      bg: string
      text: string
    }
  >
> = {
  승인됨: {
    icon: CheckCircle2,
    message: "투표 조건을 충족하여 승인되었습니다. 학생회의 답변을 기다리고 있습니다.",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
  },
  미승인: {
    icon: XCircle,
    message:
      "투표 기간 종료 후 승인 조건에 도달하지 못하여 승인되지 않았습니다.",
    bg: "bg-secondary border-border",
    text: "text-muted-foreground",
  },
  답변완료: {
    icon: MessageSquareText,
    message: "학생회의 공식 답변이 등록되었습니다. 아래에서 확인하세요.",
    bg: "bg-green-50 border-green-200",
    text: "text-green-800",
  },
  반려: {
    icon: AlertCircle,
    message:
      "학생회의 검토 결과 본 청원은 반려되었습니다. 아래에서 사유를 확인하세요.",
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
  },
}

export function PetitionStatusBanner({ status }: PetitionStatusBannerProps) {
  const cfg = config[status]
  if (!cfg) return null

  const Icon = cfg.icon

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-5 py-4",
        cfg.bg
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", cfg.text)} />
      <p className={cn("text-sm leading-relaxed", cfg.text)}>{cfg.message}</p>
    </div>
  )
}
