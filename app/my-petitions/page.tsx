"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ConnectedHeader as SiteHeader } from "@/components/layout/connected-header"
import { FilterBar } from "@/components/petition/filter-bar"
import { MyPetitionList } from "@/components/petition/my-petition-list"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import type { Petition } from "@/components/petition/petition-list"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

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

export default function MyPetitionsPage() {
  const { loading, user, isAdmin } = useAuth()
  const router = useRouter()
  const [activeStatus, setActiveStatus] = useState("ALL")
  const [activeCouncilId, setActiveCouncilId] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [councils, setCouncils] = useState<Council[]>([])
  const [data, setData] = useState<{
    content: Petition[]
    totalPages: number
    totalElements: number
    number: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInitialData = async () => {
    try {
      const res = await councilService.getCouncils()
      setCouncils(res.data)
    } catch (error) {
      console.error("학생회 목록 로드 실패:", error)
    }
  }

  const fetchMyPetitions = async () => {
    setIsLoading(true)
    try {
      const res = await postService.getPosts({
        page,
        size: 10,
        keyword: searchQuery || undefined,
        status: activeStatus === "ALL" ? undefined : activeStatus,
        councilId: activeCouncilId === "ALL" ? undefined : activeCouncilId,
        mine: isAdmin ? undefined : true,
        assignedToMe: isAdmin ? true : undefined,
        sort: "createdAt,DESC"
      })
      setData(res.data)
    } catch (error) {
      console.error("내 청원 로드 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    } else if (user) {
      fetchInitialData()
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchMyPetitions()
    }
  }, [page, searchQuery, activeStatus, activeCouncilId, user])

  const stats = useMemo(() => {
    const total = data?.totalElements || 0
    return [
      { label: isAdmin ? "전체 내 입장문" : "전체 내 청원", count: total },
    ]
  }, [data, isAdmin])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  function handleEdit(id: string) {
    router.push(`/petition/${id}/edit`)
  }

  async function handleDelete(id: string) {
    if (confirm("정말 이 청원을 삭제하시겠습니까?")) {
      try {
        await postService.deletePost(id)
        toast.success("청원이 성공적으로 삭제되었습니다.")
        fetchMyPetitions()
      } catch (error: any) {
        console.error("삭제 실패:", error)
        toast.error(error.response?.data?.message || "삭제 권한이 없거나 이미 투표가 진행되어 삭제할 수 없습니다.")
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < (data?.totalPages || 0)) {
      setPage(newPage)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:flex-1">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {isAdmin ? "내 입장문" : "내 청원"}
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {isAdmin ? "내가 작성한 입장문의 현황을 확인하고 관리할 수 있습니다." : "내가 작성한 청원의 현황을 확인하고 관리할 수 있습니다."}
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
            <Button asChild className="shrink-0">
              <Link href="/petition/new">
                <Plus className="mr-1.5 h-4 w-4" />
                {isAdmin ? "입장문 작성" : "청원 작성"}
              </Link>
            </Button>
          </div>

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
              setPage(0)
            }}
            councils={councils}
            hideCouncilFilter={isAdmin}
          />

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <MyPetitionList
                petitions={data?.content || []}
                onEdit={handleEdit as any}
                onDelete={handleDelete as any}
              />
              
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
                    
                    {[...Array(data.totalPages)].map((_, i) => (
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
                    ))}

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
