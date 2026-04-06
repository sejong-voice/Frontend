import { Building2, Clock } from "lucide-react"

interface PetitionOfficialResponseProps {
  content: string
  respondent: string
  date: string
  images?: { id: string; url: string }[]
}

export function PetitionOfficialResponse({
  content,
  respondent,
  date,
  images = [],
}: PetitionOfficialResponseProps) {
  return (
    <section
      className="rounded-lg border-2 border-primary/20 bg-accent/50"
      aria-label="학생회 공식 입장"
    >
      <div className="border-b border-primary/10 px-6 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {"학생회 공식 입장"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {date}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {"작성자: "}
          {respondent}
        </p>
      </div>
      <div className="px-6 py-5 md:px-8">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line mb-6">
          {content}
        </p>

        {images.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-primary/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{"첨부 이미지"}</span>
              <span className="text-xs text-muted-foreground">{`(${images.length})`}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {images.map((img, index) => (
                <div 
                  key={index} 
                  className="overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <img 
                    src={img.url} 
                    alt="Official response attachment" 
                    className="max-h-[250px] w-auto object-contain"
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
