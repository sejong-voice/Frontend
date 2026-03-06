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
    id: 1,
    status: "VOTING",
    title: "졸업요건 중 영어 인증 기준 완화 요청",
    comments: 24,
    votes: 312,
    studentId: "20210001",
    date: "2026.02.01",
    council: "총학생회",
  },
  {
    id: 2,
    status: "VOTING",
    title: "중앙도서관 24시간 열람실 운영 재개 요청",
    comments: 18,
    votes: 287,
    studentId: "20220315",
    date: "2026.01.28",
    council: "총학생회",
  },
  {
    id: 4,
    status: "APPROVED",
    title: "계절학기 수강 신청 기간 확대 요청",
    comments: 12,
    votes: 198,
    studentId: "20200456",
    date: "2026.01.22",
    council: "단과대학 학생회",
  },
  {
    id: 6,
    status: "VOTING",
    title: "학생회관 카페테리아 메뉴 다양화 요청",
    comments: 8,
    votes: 156,
    studentId: "20211034",
    date: "2026.01.18",
    council: "총학생회",
  },
  {
    id: 8,
    status: "VOTING",
    title: "복수전공 학점 인정 범위 확대 요청",
    comments: 15,
    votes: 234,
    studentId: "20200891",
    date: "2026.01.12",
    council: "단과대학 학생회",
  },
  {
    id: 9,
    status: "APPROVED",
    title: "공학관 강의실 냉난방 시설 개선 요청",
    comments: 27,
    votes: 421,
    studentId: "20210667",
    date: "2026.01.10",
    council: "단과대학 학생회",
  },
]

export default function VotingPage() {
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
              {"투표중인 청원"}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {"현재 투표가 진행 중이거나 승인되어 답변 대기 중인 청원 목록입니다."}
            </p>
          </div>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <PetitionList petitions={filteredPetitions} from="voting" />
        </div>
      </main>
    </div>
  )
}
