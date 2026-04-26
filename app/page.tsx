"use client"

import { useState, useMemo, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { PageHeader } from "@/components/layout/page-header"
import { FilterBar } from "@/components/petition/filter-bar"
import {
  PetitionList,
  type Petition,
} from "@/components/petition/petition-list"
import { postService } from "@/app/api/posts"
import { councilService, Council } from "@/app/api/councils"
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
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

function DashboardContent() {
  const { isAdmin } = useAuth()
  const searchParams = useSearchParams()

  const [activeStatus, setActiveStatus] = useState(searchParams.get("status") || "ALL")
  const [activeCouncilId, setActiveCouncilId] = useState(searchParams.get("councilId") || "ALL")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "0", 10))

  const [councils, setCouncils] = useState<Council[]>([])
  const [councilKeyword, setCouncilKeyword] = useState("")
  const [data, setData] = useState<{
    content: Petition[]
    totalPages: number
    totalElements: number
    number: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 뒤로가기 버튼 등으로 URL 파라미터가 변경되었을 때 로컬 상태 동기화
  useEffect(() => {
    setActiveStatus(searchParams.get("status") || "ALL")
    setActiveCouncilId(searchParams.get("councilId") || "ALL")
    setSearchQuery(searchParams.get("query") || "")
    setPage(parseInt(searchParams.get("page") || "0", 10))
  }, [searchParams])

  // 로컬 상태와 URL 파라미터를 동시에 업데이트
  const updateStateAndUrl = useCallback((updates: { status?: string; councilId?: string; query?: string; page?: number }) => {
    if (updates.status !== undefined) setActiveStatus(updates.status)
    if (updates.councilId !== undefined) setActiveCouncilId(updates.councilId)
    if (updates.query !== undefined) setSearchQuery(updates.query)
    if (updates.page !== undefined) setPage(updates.page)

    // Next.js 라우터 대신 브라우저 History API를 통해 URL을 부드럽게 업데이트
    // 입력창 깜빡임 등 리렌더링 버그 예방
    const params = new URLSearchParams(window.location.search)
    if (updates.status !== undefined) {
      if (updates.status === "ALL") params.delete("status")
      else params.set("status", updates.status)
    }
    if (updates.councilId !== undefined) {
      if (updates.councilId === "ALL") params.delete("councilId")
      else params.set("councilId", updates.councilId)
    }
    if (updates.query !== undefined) {
      if (!updates.query) params.delete("query")
      else params.set("query", updates.query)
    }
    if (updates.page !== undefined) {
      if (updates.page === 0) params.delete("page")
      else params.set("page", updates.page.toString())
    }
    
    // update URL
    const newUrl = `${window.location.pathname}?${params.toString()}`
    // remove trailing ? if params are completely empty
    const finalUrl = newUrl.endsWith('?') ? newUrl.slice(0, -1) : newUrl
    window.history.replaceState({ ...window.history.state, as: finalUrl, url: finalUrl }, '', finalUrl)
  }, [])

  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      try {
        const res = await councilService.getCouncils(councilKeyword)
        if (active) setCouncils(res.data)
      } catch (error) {
        console.error("학생회 목록 로드 실패:", error)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [councilKeyword])

  const fetchPetitions = useCallback(async () => {
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
      toast.error("청원 목록을 불러오지 못했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery, activeStatus, activeCouncilId])

  useEffect(() => {
    // 디바운스 처리
    const delay = setTimeout(() => {
      fetchPetitions()
    }, 200)
    return () => clearTimeout(delay)
  }, [fetchPetitions])

  const stats = useMemo(() => {
    const total = data?.totalElements || 0
    return [
      { label: "전체", count: total },
    ]
  }, [data])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < (data?.totalPages || 0)) {
      updateStateAndUrl({ page: newPage })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader stats={stats} />
      <FilterBar
        activeStatus={activeStatus}
        onStatusChange={(s) => updateStateAndUrl({ status: s, page: 0 })}
        activeCouncilId={activeCouncilId}
        onCouncilChange={(id) => updateStateAndUrl({ councilId: id, page: 0 })}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateStateAndUrl({ query: q, page: 0 })}
        councils={councils}
        councilKeyword={councilKeyword}
        onCouncilKeywordChange={setCouncilKeyword}
        hideCouncilFilter={isAdmin}
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
  )
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  )
}
