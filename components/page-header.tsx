interface StatItem {
  label: string
  count: number
}

interface PageHeaderProps {
  stats: StatItem[]
}

export function PageHeader({ stats }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {"전체 청원"}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {"학생들이 제출한 모든 청원을 확인할 수 있습니다."}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </span>
            <span className="text-lg font-bold text-foreground">
              {stat.count}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                {"건"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
