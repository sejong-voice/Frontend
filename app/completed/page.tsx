"use client"

import { useState, useMemo } from "react"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { FilterBar } from "@/components/petition/filter-bar"
import {
  PetitionList,
  type Petition,
} from "@/components/petition/petition-list"

const petitions: Petition[] = [
  {
    id: 3,
    status: "COMPLETED",
    title: "교내 셔틀버스 배차 간격 단축 건의",
    comments: 31,
    votes: 456,
    studentId: "20190782",
    date: "2026.01.25",
    council: "총학생회",
  },
  {
    id: 7,
    status: "COMPLETED",
    title: "장학금 선발 기준 투명성 강화 건의",
    comments: 22,
    votes: 378,
    studentId: "20180523",
    date: "2026.01.15",
    council: "총학생회",
  },
  {
    id: 10,
    status: "COMPLETED",
    title: "학교 공식 앱 UI/UX 개선 건의",
    comments: 19,
    votes: 267,
    studentId: "20190244",
    date: "2026.01.08",
    council: "총학생회",
  },
  {
    id: 14,
    status: "REJECTED",
    title: "학생회비 사용 내역 분기별 공개 의무화 요청",
    comments: 4,
    votes: 373,
    studentId: "20170412",
    date: "2026.01.03",
    council: "총학생회",
  },
]

export default function CompletedPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPetitions = useMemo(() => {
    return petitions.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {"완료된 청원"}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {"처리가 완료되었거나 반려된 청원 목록입니다."}
            </p>
          </div>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <PetitionList petitions={filteredPetitions} from="completed" />
        </div>
      </main>
    </div>
  )
}
