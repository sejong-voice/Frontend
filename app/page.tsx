"use client"

import { useState, useMemo, useEffect } from "react"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { PageHeader } from "@/components/layout/page-header"
import { FilterBar } from "@/components/petition/filter-bar"
import {
  PetitionList,
  type Petition,
} from "@/components/petition/petition-list"
import { postService } from "@/app/api/posts"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Loader2 } from "lucide-react"

export default function Page() {
  const [activeStatus, setActiveStatus] = useState("ALL")
  const [activeCouncilId, setActiveCouncilId] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<{
    content: Petition[]
    totalPages: number
    totalElements: number
    number: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPetitions = async () => {
    setIsLoading(true)
    try {
      const res = await postService.getPosts({
        page,
        size: 10,
        keyword: searchQuery || undefined,
        status: activeStatus === "ALL" ? undefined : activeStatus,
        councilId: activeCouncilId === "ALL" ? undefined : activeCouncilId,
        sort: "createdAt,DESC"
      })
      setData(res.data)
    } catch (error) {
      console.error("청원 목록 로드 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPetitions()
  }, [page, searchQuery, activeStatus, activeCouncilId])

  const stats = useMemo(() => {
    const total = data?.totalElements || 0
    return [
      { label: "전체", count: total },
    ]
  }, [data])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < (data?.totalPages || 0)) {
      setPage(newPage)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-8">
          <PageHeader stats={stats} />
          <FilterBar
            activeStatus={activeStatus}
            onStatusChange={(s) => {
              setActiveStatus(s)
              setPage(0)
            }}
            activeCouncilId={activeCouncilId}
            onCouncilChange={(id) => {
              setActiveCouncilId(id)
              setPage(0)
            }}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setPage(0) // 검색 시 첫 페이지로
            }}
          />

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <PetitionList petitions={data?.content || []} />
              
              {data && data.totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page - 1)
                        }}
                        className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {[...Array(data.totalPages)].map((_, i) => {
                      // 페이지가 너무 많을 경우를 대비해 현재 페이지 주변만 표시하는 로직 (간략화)
                      if (
                        data.totalPages <= 7 ||
                        i === 0 ||
                        i === data.totalPages - 1 ||
                        (i >= page - 1 && i <= page + 1)
                      ) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={page === i}
                              onClick={(e) => {
                                e.preventDefault()
                                handlePageChange(i)
                              }}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      } else if (
                        (i === 1 && page > 2) ||
                        (i === data.totalPages - 2 && page < data.totalPages - 3)
                      ) {
                        return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
                      }
                      return null
                    })}

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page + 1)
                        }}
                        className={page === data.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
