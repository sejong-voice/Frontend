"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ConnectedHeader as SiteHeader } from "@/components/layout/connected-header"
import { FilterBar } from "@/components/petition/filter-bar"
import { MyPetitionList } from "@/components/petition/my-petition-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Petition } from "@/components/petition/petition-list"

const myPetitions: Petition[] = [
  {
    id: 1,
    status: "진행중",
    category: "학사제도",
    title: "졸업요건 중 영어 인증 기준 완화 요청",
    comments: 24,
    votes: 312,
    studentId: "20210001",
    date: "2026.02.01",
  },
  {
    id: 4,
    status: "승인됨",
    category: "학사제도",
    title: "계절학기 수강 신청 기간 확대 요청",
    comments: 12,
    votes: 198,
    studentId: "20210001",
    date: "2026.01.22",
  },
  {
    id: 11,
    status: "진행중",
    category: "학생복지",
    title: "기숙사 외박 신청 절차 간소화 요청",
    comments: 3,
    votes: 0,
    studentId: "20210001",
    date: "2026.02.05",
  },
  {
    id: 12,
    status: "답변완료",
    category: "학교시설",
    title: "정보관 PC실 모니터 교체 건의",
    comments: 9,
    votes: 145,
    studentId: "20210001",
    date: "2026.01.14",
  },
  {
    id: 13,
    status: "미승인",
    category: "기타",
    title: "교내 자판기 제품 종류 확대 건의",
    comments: 2,
    votes: 0,
    studentId: "20210001",
    date: "2026.01.05",
  },
]

export default function MyPetitionsPage() {
  const [activeCategory, setActiveCategory] = useState("전체")
  const [searchQuery, setSearchQuery] = useState("")
  const [petitions, setPetitions] = useState(myPetitions)

  const filteredPetitions = useMemo(() => {
    return petitions.filter((p) => {
      const matchesCategory =
        activeCategory === "전체" || p.category === activeCategory
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [petitions, activeCategory, searchQuery])

  const stats = useMemo(() => {
    const inProgress = petitions.filter(
      (p) => p.status === "진행중" || p.status === "승인됨"
    ).length
    const answered = petitions.filter(
      (p) => p.status === "답변완료"
    ).length
    return [
      { label: "진행중", count: inProgress },
      { label: "답변완료", count: answered },
      { label: "전체", count: petitions.length },
    ]
  }, [petitions])

  function handleEdit(id: number) {
    // Mock: navigate to edit page
    alert(`청원 #${id} 수정 페이지로 이동합니다.`)
  }

  function handleDelete(id: number) {
    const target = petitions.find((p) => p.id === id)
    if (!target || target.votes > 0) return
    if (confirm("정말 이 청원을 삭제하시겠습니까?")) {
      setPetitions((prev) => prev.filter((p) => p.id !== id))
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
                  {"내 청원"}
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {"내가 작성한 청원의 현황을 확인하고 관리할 수 있습니다."}
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
                {"청원 작성"}
              </Link>
            </Button>
          </div>

          <FilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <MyPetitionList
            petitions={filteredPetitions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  )
}
