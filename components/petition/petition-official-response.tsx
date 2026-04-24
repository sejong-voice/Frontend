import { Building2, Clock, Pencil } from "lucide-react"
import { formatToKST } from "@/lib/utils"
import type { PostStatement } from "./petition-list"

interface PetitionOfficialResponseProps {
  statements: PostStatement[]
  respondent: string
  showAdditionalAction?: boolean
  onAddAdditional?: () => void
}

export function PetitionOfficialResponse({
  statements = [],
  respondent,
  showAdditionalAction = false,
  onAddAdditional,
}: PetitionOfficialResponseProps) {
  if (statements.length === 0) return null;

  // The first statement (sequence 1)
  const mainStatement = statements.find(s => s.sequence === 1) || statements[0];
  // Subsequent statements (sequence > 1)
  const additionalStatements = statements
    .filter(s => s.id !== mainStatement.id)
    .sort((a, b) => a.sequence - b.sequence);

  const formatDateTime = (value: string) => {
    return formatToKST(value, "datetime");
  };

  return (
    <div className="flex flex-col gap-4">
      <section
        className="rounded-lg border-2 border-primary/20 bg-accent/50"
        aria-label="학생회 공식 입장"
      >
        <div className="border-b border-primary/10 px-6 py-4 md:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                {"학생회 공식 입장"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {showAdditionalAction && additionalStatements.length === 0 && onAddAdditional && (
                <button
                  type="button"
                  onClick={onAddAdditional}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <Pencil className="h-3 w-3" />
                  {"추가 답변 작성"}
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDateTime(mainStatement.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {"작성자 "}
            {respondent}
          </p>
        </div>
        <div className="px-6 py-5 md:px-8">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {mainStatement.content}
          </p>

          {mainStatement.images && mainStatement.images.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-primary/10 pt-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{"첨부 이미지"}</span>
                <span className="text-xs text-muted-foreground">{`(${mainStatement.images.length})`}</span>
              </div>
              <div className="flex flex-col items-center gap-6">
                {mainStatement.images.map((img, index) => (
                  <div 
                    key={img.imageId || index} 
                    className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition-transform hover:scale-[1.01]"
                  >
                    <img 
                      src={img.imageUrl} 
                      alt="Official response attachment" 
                      className="mx-auto block max-h-[500px] w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Additional Threaded Responses */}
      {additionalStatements.map((statement, sIdx) => (
        <div key={statement.id} className="relative pl-6 md:pl-10">
          <div className="absolute left-3 top-0 h-full w-0.5 bg-primary/10 md:left-5" />
          <div className="absolute left-[9px] top-6 h-3 w-3 rounded-full border-2 border-primary/20 bg-background md:left-[17px]" />
          
          <section
            className="rounded-lg border-2 border-primary/15 bg-card shadow-sm"
            aria-label={`학생회 추가 답변 ${statement.sequence}`}
          >
            <div className="border-b border-border/60 px-6 py-3 md:px-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {`추가 답변 ${statement.sequence - 1}`}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDateTime(statement.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 md:px-8">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {statement.content}
              </p>

              {statement.images && statement.images.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-border/60 pt-6 mt-6">
                  <div className="flex flex-col items-center gap-6">
                    {statement.images.map((img, index) => (
                      <div 
                        key={img.imageId || index} 
                        className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img 
                          src={img.imageUrl} 
                          alt="Additional response attachment" 
                          className="mx-auto block max-h-[500px] w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      ))}
    </div>
  )
}
