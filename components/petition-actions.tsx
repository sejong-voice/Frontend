import { Button } from "@/components/ui/button"
import { Pencil, Trash2, CheckCircle, XCircle, FileText } from "lucide-react"
import type { PetitionStatus } from "@/components/petition-detail-header"

interface PetitionActionsProps {
  status: PetitionStatus
  isAuthor: boolean
  isAdmin: boolean
}

export function PetitionActions({
  status,
  isAuthor,
  isAdmin,
}: PetitionActionsProps) {
  const showAuthorActions = isAuthor && status === "진행중"
  const showAdminActions = isAdmin && status === "승인됨"

  if (!showAuthorActions && !showAdminActions) return null

  return (
    <section
      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-4"
      aria-label="관리 액션"
    >
      {showAuthorActions && (
        <>
          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
            <Pencil className="h-3.5 w-3.5" />
            {"수정"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {"삭제"}
          </Button>
        </>
      )}
      {showAdminActions && (
        <>
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            {"학생회 관리:"}
          </span>
          <Button size="sm" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            {"완료 처리"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            <XCircle className="h-3.5 w-3.5" />
            {"반려 처리"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
            <FileText className="h-3.5 w-3.5" />
            {"공식 입장문 작성"}
          </Button>
        </>
      )}
    </section>
  )
}
