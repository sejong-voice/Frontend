"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"

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
  categories?: { id: string; name: string }[]
  activeCategoryId?: string
  onCategoryChange?: (id: string) => void
  councilKeyword?: string
  onCouncilKeywordChange?: (keyword: string) => void
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
  categories = [],
  activeCategoryId,
  onCategoryChange,
  councilKeyword = "",
  onCouncilKeywordChange,
  hideCouncilFilter = false,
  hideStatusFilter = false,
}: FilterBarProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
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

          {onCategoryChange && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="카테고리 필터">
              <button
                role="tab"
                aria-selected={activeCategoryId === "ALL" || !activeCategoryId}
                onClick={() => onCategoryChange("ALL")}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                  activeCategoryId === "ALL" || !activeCategoryId
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                {"전체"}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={activeCategoryId === c.id}
                  onClick={() => onCategoryChange(c.id)}
                  className={cn(
                    "rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                    activeCategoryId === c.id
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
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
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <span className="text-sm font-medium text-muted-foreground mr-1">{"학생회 필터:"}</span>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full md:w-64 justify-between font-normal h-9 text-sm"
              >
                {activeCouncilId === "ALL"
                  ? "전체 학생회"
                  : councils.find((c) => c.id === activeCouncilId)?.name || "학생회 선택"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-64 p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="학생회 이름으로 검색..."
                  value={councilKeyword}
                  onValueChange={onCouncilKeywordChange}
                />
                <CommandList>
                  {councils.length === 0 && councilKeyword && <CommandEmpty>{"검색 결과가 없습니다."}</CommandEmpty>}
                  <CommandGroup>
                    <CommandItem
                      value="ALL"
                      onSelect={() => {
                        onCouncilChange("ALL")
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          activeCouncilId === "ALL" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {"전체 학생회"}
                    </CommandItem>
                    {councils.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={c.id}
                        onSelect={() => {
                          onCouncilChange(c.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            activeCouncilId === c.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

    </div>
  )
}
