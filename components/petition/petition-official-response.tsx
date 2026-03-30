import { Building2, Clock, Pencil } from "lucide-react"

interface PetitionOfficialResponseProps {
  content: string
  respondent: string
  date: string
  isEdited?: boolean
  showEditAction?: boolean
  onEdit?: () => void
}

export function PetitionOfficialResponse({
  content,
  respondent,
  date,
  isEdited = false,
  showEditAction = false,
  onEdit,
}: PetitionOfficialResponseProps) {
  return (
    <section
      className="rounded-lg border-2 border-primary/20 bg-accent/50"
      aria-label="학생회 공식 입장"
    >
      <div className="border-b border-primary/10 px-6 py-4 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              학생회 공식 입장
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {showEditAction && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Pencil className="h-3 w-3" />
                수정
              </button>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{date}</span>
              </div>
              {isEdited && (
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
                  수정
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">작성자 {respondent}</p>
      </div>
      <div className="px-6 py-5 md:px-8">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {content}
        </p>
      </div>
    </section>
  )
}
