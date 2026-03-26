"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statuses = [
  { label: "전체", value: "ALL" },
  { label: "투표중", value: "VOTING" },
  { label: "검토중", value: "APPROVED" },
  { label: "부결", value: "PENDING" },
  { label: "처리완료", value: "COMPLETED" },
  { label: "반려", value: "REJECTED" },
]

interface FilterBarProps {
  activeStatus: string
  onStatusChange: (status: string) => void
  activeCouncilId: string
  onCouncilChange: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  councils: { id: string; name: string }[]
  hideCouncilFilter?: boolean
  hideStatusFilter?: boolean
}

export function FilterBar({
  activeStatus,
  onStatusChange,
  activeCouncilId,
  onCouncilChange,
  searchQuery,
  onSearchChange,
  councils,
  hideCouncilFilter = false,
  hideStatusFilter = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {!hideStatusFilter && (
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="상태 필터">
            {statuses.map((status) => (
              <button
                key={status.value}
                role="tab"
                aria-selected={activeStatus === status.value}
                onClick={() => onStatusChange(status.value)}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                  activeStatus === status.value
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}

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

      {!hideCouncilFilter && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">{"학생회 필터:"}</span>
          <Select value={activeCouncilId} onValueChange={onCouncilChange}>
            <SelectTrigger className="w-full md:w-48 h-9 text-sm">
              <SelectValue placeholder="학생회 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{"전체 학생회"}</SelectItem>
              {councils?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
