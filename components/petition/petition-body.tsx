interface PetitionBodyProps {
  content: string
  images?: { id: string; url: string }[]
}

export function PetitionBody({ content, images = [] }: PetitionBodyProps) {
  return (
    <article className="rounded-lg border border-border bg-card px-6 py-8 md:px-8">
      <div className="max-w-none text-[15px] leading-relaxed text-foreground whitespace-pre-line mb-8">
        {content}
      </div>
      
      {images.length > 0 && (
        <div className="flex flex-col gap-4">
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
                  alt="Petition attachment" 
                  className="max-h-[300px] w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
