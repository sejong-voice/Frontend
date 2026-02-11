"use client"

import { useState, useMemo } from "react"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { PageHeader } from "@/components/layout/page-header"
import { FilterBar } from "@/components/petition/filter-bar"
import {
  PetitionList,
  type Petition,
  type PetitionCategory,
} from "@/components/petition/petition-list"

const petitions: Petition[] = [
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
    id: 2,
    status: "진행중",
    category: "학교시설",
    title: "중앙도서관 24시간 열람실 운영 재개 요청",
    comments: 18,
    votes: 287,
    studentId: "20220315",
    date: "2026.01.28",
  },
  {
    id: 3,
    status: "답변완료",
    category: "학생복지",
    title: "교내 셔틀버스 배차 간격 단축 건의",
    comments: 31,
    votes: 456,
    studentId: "20190782",
    date: "2026.01.25",
  },
  {
    id: 4,
    status: "승인됨",
    category: "학사제도",
    title: "계절학기 수강 신청 기간 확대 요청",
    comments: 12,
    votes: 198,
    studentId: "20200456",
    date: "2026.01.22",
  },
  {
    id: 5,
    status: "미승인",
    category: "기타",
    title: "캠퍼스 내 반려동물 동반 출입 허용 건의",
    comments: 45,
    votes: 89,
    studentId: "20230198",
    date: "2026.01.20",
  },
  {
    id: 6,
    status: "진행중",
    category: "학교시설",
    title: "학생회관 카페테리아 메뉴 다양화 요청",
    comments: 8,
    votes: 156,
    studentId: "20211034",
    date: "2026.01.18",
  },
  {
    id: 7,
    status: "답변완료",
    category: "학생복지",
    title: "장학금 선발 기준 투명성 강화 건의",
    comments: 22,
    votes: 378,
    studentId: "20180523",
    date: "2026.01.15",
  },
  {
    id: 8,
    status: "진행중",
    category: "학사제도",
    title: "복수전공 학점 인정 범위 확대 요청",
    comments: 15,
    votes: 234,
    studentId: "20200891",
    date: "2026.01.12",
  },
  {
    id: 9,
    status: "승인됨",
    category: "학교시설",
    title: "공학관 강의실 냉난방 시설 개선 요청",
    comments: 27,
    votes: 421,
    studentId: "20210667",
    date: "2026.01.10",
  },
  {
    id: 10,
    status: "답변완료",
    category: "기타",
    title: "학교 공식 앱 UI/UX 개선 건의",
    comments: 19,
    votes: 267,
    studentId: "20190244",
    date: "2026.01.08",
  },
  {
    id: 14,
    status: "반려",
    category: "학생복지",
    title: "학생회비 사용 내역 분기별 공개 의무화 요청",
    comments: 4,
    votes: 373,
    studentId: "20170412",
    date: "2026.01.03",
  },
]

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("전체")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPetitions = useMemo(() => {
    return petitions.filter((p) => {
      const matchesCategory =
        activeCategory === "전체" || p.category === activeCategory
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

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
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-8">
          <PageHeader stats={stats} />
          <FilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <PetitionList petitions={filteredPetitions} />
        </div>
      </main>
    </div>
  )
}
