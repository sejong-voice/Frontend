"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function FilterBar({
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex items-center justify-end">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="청원 검색…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="청원 검색"
        />
      </div>
    </div>
  )
}
