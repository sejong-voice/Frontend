"use client"

import { use } from "react"
import { ConnectedHeader } from "@/components/connected-header"
import { PetitionDetailHeader } from "@/components/petition-detail-header"
import type { PetitionStatus } from "@/components/petition-detail-header"
import { PetitionBody } from "@/components/petition-body"
import { PetitionVote } from "@/components/petition-vote"
import { PetitionStatusBanner } from "@/components/petition-status-banner"
import { PetitionOfficialResponse } from "@/components/petition-official-response"
import { PetitionComments, type Comment } from "@/components/petition-comments"
import { PetitionActions } from "@/components/petition-actions"
import { Separator } from "@/components/ui/separator"


// --- Mock data ---

interface PetitionData {
  id: number
  title: string
  status: PetitionStatus
  category: string
  author: string
  date: string
  council: string
  content: string
  votesFor: number
  votesAgainst: number
  threshold: number
  officialResponse: {
    content: string
    respondent: string
    date: string
  } | null
  comments: Comment[]
  isAuthor: boolean
  isAdmin: boolean
}

const petitionsDB: Record<string, PetitionData> = {
  "1": {
    id: 1,
    title: "졸업요건 중 영어 인증 기준 완화 요청",
    status: "진행중",
    category: "학사제도",
    author: "김도현",
    date: "2026.02.01",
    council: "총학생회",
    content: `안녕하세요. 본 청원은 현행 졸업요건 중 영어 인증 기준에 대한 완화를 요청드리기 위해 작성합니다.

현재 세종대학교는 졸업 요건으로 공인 영어 시험(TOEIC, TOEFL, IELTS 등)의 일정 점수 이상을 요구하고 있습니다. 그러나 이 기준이 학과의 특성과 무관하게 일괄 적용되고 있어, 비영어권 전공 학생들에게 불필요한 부담이 되고 있습니다.

구체적으로 다음과 같은 문제점이 있습니다:

1. 이공계열 학생들의 경우 전공 학습에 투자해야 할 시간을 영어 시험 준비에 과도하게 소비하고 있습니다.
2. 경제적으로 어려운 학생들이 반복적인 시험 응시료 부담을 안고 있습니다.
3. 교내 영어 교육 프로그램의 수료로 대체할 수 있는 방안이 충분하지 않습니다.

따라서 다음과 같이 제안합니다:
- 학과별 특성을 고려한 차등적 영어 인증 기준 적용
- 교내 영어 교육 프로그램 수료를 통한 대체 경로 확대
- 인증 점수 기준의 현실적 하향 조정

많은 학생들의 관심과 지지를 부탁드립니다. 감사합니다.`,
    votesFor: 248,
    votesAgainst: 64,
    threshold: 300,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "이승민",
        content:
          "정말 공감합니다. 저도 4학년인데 졸업 요건 때문에 TOEIC을 세 번이나 봤네요. 시험비만 해도 부담이 큽니다.",
        date: "2026.02.02",
        isMine: false,
        replies: [
          {
            id: 11,
            author: "박지영",
            content:
              "저도 같은 상황입니다. 교내 프로그램으로 대체할 수 있었으면 좋겠어요.",
            date: "2026.02.02",
            isMine: false,
          },
          {
            id: 12,
            author: "김도현",
            content:
              "맞습니다. 현재 이 부분도 포함하여 요청드린 상태입니다. 지지 감사합니다.",
            date: "2026.02.03",
            isMine: true,
          },
        ],
      },
      {
        id: 2,
        author: "정하윤",
        content:
          "영어가 중요하지 않다는 건 아니지만, 모든 학과에 동일한 기준을 적용하는 건 맞지 않다고 봅니다.",
        date: "2026.02.03",
        isMine: false,
        replies: [],
      },
      {
        id: 3,
        author: "최은서",
        content:
          "다른 대학교들은 이미 교내 영어 수업 이수로 대체 가능한 곳이 많더라고요. 우리 학교도 이런 유연한 정책이 필요합니다.",
        date: "2026.02.04",
        isMine: true,
        replies: [
          {
            id: 31,
            author: "한서준",
            content:
              "맞아요. 타대학 사례를 좀 정리해서 근거 자료로 제시하면 좋을 것 같아요.",
            date: "2026.02.05",
            isMine: false,
          },
        ],
      },
      {
        id: 4,
        author: "윤채원",
        content:
          "솔직히 반대 의견도 있을 수 있지만, 최소한 학과별 차등 적용은 합리적이라고 생각합니다.",
        date: "2026.02.06",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: true,
    isAdmin: false,
  },
  "3": {
    id: 3,
    title: "교내 셔틀버스 배차 간격 단축 건의",
    status: "답변완료",
    category: "학생복지",
    author: "박서진",
    date: "2026.01.25",
    council: "총학생회",
    content: `세종대학교 셔틀버스 이용 학생입니다.

현재 셔틀버스의 배차 간격이 약 20~25분으로 운영되고 있어, 수업 전후 대기 시간이 매우 길어 불편을 겪고 있습니다. 특히 출퇴근 시간대와 점심시간에는 탑승하지 못하고 다음 버스를 기다리는 경우가 빈번합니다.

개선 요청 사항:
1. 피크 시간대(08:00~10:00, 12:00~13:30, 17:00~19:00) 배차 간격을 10분 이내로 단축
2. 실시간 버스 위치 확인 시스템 도입
3. 배차 간격 관련 정기적인 학생 의견 수렴

많은 학생분들의 동의와 참여를 부탁드립니다.`,
    votesFor: 389,
    votesAgainst: 67,
    threshold: 300,
    officialResponse: {
      content: `안녕하세요, 총학생회입니다.

본 청원에 대해 학교 교통팀 및 총무처와 협의한 결과를 안내드립니다.

1. 피크 시간대 배차 간격 단축: 2026년 3월 학기 시작부터 피크 시간대 배차 간격을 15분으로 단축하기로 확정하였습니다. 향후 예산 확보에 따라 10분 이내 단축을 목표로 하고 있습니다.

2. 실시간 위치 확인 시스템: 현재 교통팀에서 모바일 앱 연동 개발을 진행 중이며, 2026년 2학기 내 도입을 목표로 하고 있습니다.

3. 정기 의견 수렴: 매 학기 초 셔틀버스 관련 설문조사를 실시하여 학생들의 의견을 반영하겠습니다.

적극적인 관심과 참여에 감사드립니다.`,
      respondent: "제55대 총학생회 교통복지위원회",
      date: "2026.02.05 14:30",
    },
    comments: [
      {
        id: 1,
        author: "강민재",
        content: "드디어 답변이 나왔네요! 배차 간격 단축 확정 감사합니다.",
        date: "2026.02.05",
        isMine: false,
        replies: [
          {
            id: 11,
            author: "서예린",
            content: "15분이라도 줄어드는 거니까 기대됩니다.",
            date: "2026.02.05",
            isMine: false,
          },
        ],
      },
      {
        id: 2,
        author: "임주원",
        content:
          "실시간 위치 확인이 2학기라니 좀 아쉽지만 그래도 추진해주시니 감사합니다.",
        date: "2026.02.06",
        isMine: true,
        replies: [],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
}

// Default fallback: admin view of an approved petition
const defaultPetition: PetitionData = {
  id: 0,
  title: "중앙도서관 24시간 열람실 운영 재개 요청",
  status: "승인됨",
  category: "학교시설",
  author: "이수빈",
  date: "2026.01.28",
  council: "총학생회",
  content: `중앙도서관 24시간 열람실 운영 재개를 강력히 요청합니다.

코로나19 이후 운영이 중단된 24시간 열람실이 아직까지 재개되지 않고 있습니다. 시험 기간뿐 아니라 일상적으로 늦은 시간까지 학습이 필요한 학생들이 많으며, 교외 독서실이나 카페를 이용하는 데 따른 추가 비용 부담이 큽니다.

요청 사항:
1. 중앙도서관 3층 열람실의 24시간 운영 재개
2. 시험 기간 외에도 상시 운영 체제로 전환
3. 야간 시간대 보안 인력 배치를 통한 안전 확보

학생들의 학습권 보장을 위해 적극적인 검토를 부탁드립니다.`,
  votesFor: 287,
  votesAgainst: 42,
  threshold: 250,
  officialResponse: null,
  comments: [
    {
      id: 1,
      author: "장유진",
      content:
        "승인되었으니 이제 학생회 답변을 기다려봅시다. 꼭 재개되었으면 좋겠어요.",
      date: "2026.02.01",
      isMine: false,
      replies: [],
    },
    {
      id: 2,
      author: "홍태우",
      content: "시험 기간마다 갈 곳이 없어서 정말 불편했는데 기대됩니다.",
      date: "2026.02.02",
      isMine: false,
      replies: [
        {
          id: 21,
          author: "오하늘",
          content: "맞아요, 카페비가 만만치 않죠.",
          date: "2026.02.02",
          isMine: true,
        },
      ],
    },
  ],
  isAuthor: false,
  isAdmin: true,
}

export default function PetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const petition = petitionsDB[id] || defaultPetition

  const totalCommentCount = petition.comments.reduce(
    (acc, c) => acc + 1 + c.replies.length,
    0
  )

  const totalVotes = petition.votesFor + petition.votesAgainst

  const showOfficialResponse =
    petition.officialResponse &&
    (petition.status === "답변완료" || petition.status === "반려")

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-col gap-6">
          <PetitionDetailHeader
            title={petition.title}
            status={petition.status}
            category={petition.category}
            author={petition.author}
            date={petition.date}
            council={petition.council}
          />

          <Separator />

          {/* Status banner for non-active petitions */}
          {petition.status !== "진행중" && (
            <PetitionStatusBanner status={petition.status} />
          )}

          <PetitionBody content={petition.content} />

          <PetitionVote
            status={petition.status}
            votesFor={petition.votesFor}
            votesAgainst={petition.votesAgainst}
            threshold={petition.threshold}
          />

          {showOfficialResponse && petition.officialResponse && (
            <PetitionOfficialResponse
              content={petition.officialResponse.content}
              respondent={petition.officialResponse.respondent}
              date={petition.officialResponse.date}
            />
          )}

          <PetitionActions
            status={petition.status}
            isAuthor={petition.isAuthor}
            isAdmin={petition.isAdmin}
            totalVotes={totalVotes}
          />

          <Separator />

          <PetitionComments
            comments={petition.comments}
            totalCount={totalCommentCount}
          />
        </div>
      </main>
    </div>
  )
}
