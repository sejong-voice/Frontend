import { Building2, Clock } from "lucide-react"

interface PetitionOfficialResponseProps {
  title?: string
  content: string
  respondent: string
  date: string
  images?: { imageId: string; imageUrl: string }[]
}

export function PetitionOfficialResponse({
  title = "학생회 공식 입장",
  content,
  respondent,
  date,
  images = [],
}: PetitionOfficialResponseProps) {
  return (
    <section
      className="rounded-lg border-2 border-primary/20 bg-accent/50"
      aria-label={title}
    >
      <div className="border-b border-primary/10 px-6 py-4 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{date}</span>
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
          {content}
        </p>

        {images.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-primary/10 pt-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{"첨부 이미지"}</span>
              <span className="text-xs text-muted-foreground">{`(${images.length})`}</span>
            </div>
            <div className="flex flex-col items-center gap-6">
              {images.map((img, index) => (
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
  )
}
