interface PetitionBodyProps {
  content: string
}

export function PetitionBody({ content }: PetitionBodyProps) {
  return (
    <article className="rounded-lg border border-border bg-card px-6 py-8 md:px-8">
      <div className="max-w-none text-[15px] leading-relaxed text-foreground whitespace-pre-line">
        {content}
      </div>
    </article>
  )
}
