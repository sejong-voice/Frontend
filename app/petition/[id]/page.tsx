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
import { useAuth } from "@/components/auth-provider"


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
  "2": {
    id: 2,
    title: "중앙도서관 24시간 열람실 운영 재개 요청",
    status: "진행중",
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
    votesFor: 245,
    votesAgainst: 42,
    threshold: 250,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "장유진",
        content: "시험 기간마다 진짜 앉을 데가 없어서 꼭 재개됐으면 좋겠어요.",
        date: "2026.01.29",
        isMine: false,
        replies: [
          {
            id: 11,
            author: "홍태우",
            content: "맞아요 카페비가 만만치 않죠.",
            date: "2026.01.29",
            isMine: false,
          },
        ],
      },
      {
        id: 2,
        author: "오하늘",
        content: "야간 보안도 같이 요청한 게 좋네요. 안전이 보장돼야 이용하죠.",
        date: "2026.01.30",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: false,
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
  "4": {
    id: 4,
    title: "계절학기 수강 신청 기간 확대 요청",
    status: "승인됨",
    category: "학사제도",
    author: "최다영",
    date: "2026.01.22",
    council: "단과대학 학생회",
    content: `계절학기 수강 신청 기간의 확대를 요청드립니다.

현재 계절학기 수강 신청 기간이 약 3일로 매우 짧아, 수강 계획을 충분히 세우지 못한 채 신청 기간이 마감되는 경우가 빈번합니다. 특히 재수강이 필요한 학생들의 경우 계절학기가 유일한 기회인 만큼, 충분한 고려 시간이 보장되어야 합니다.

요청 사항:
1. 수강 신청 기간을 현행 3일에서 최소 7일로 확대
2. 사전 수강 희망 과목 등록 시스템 도입
3. 개설 과목 목록의 최소 2주 전 사전 공개`,
    votesFor: 156,
    votesAgainst: 42,
    threshold: 150,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "송유나",
        content: "3일은 정말 너무 짧아요. 수강신청 날 서버 터지면 끝이에요.",
        date: "2026.01.23",
        isMine: false,
        replies: [],
      },
      {
        id: 2,
        author: "문정훈",
        content: "사전 등록 시스템 있으면 좋겠네요. 다른 학교는 다 있던데.",
        date: "2026.01.24",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
  "5": {
    id: 5,
    title: "캠퍼스 내 반려동물 동반 출입 허용 건의",
    status: "미승인",
    category: "기타",
    author: "정수아",
    date: "2026.01.20",
    council: "총학생회",
    content: `캠퍼스 내 반려동물 동반 출입을 허용해주실 것을 건의드립니다.

최근 반려동물을 키우는 학생들이 증가하고 있으며, 해외 유수 대학에서는 이미 캠퍼스 내 반려동물 동반을 허용하고 있습니다. 반려동물과 함께하는 캠퍼스 생활은 학생들의 정서적 안정에 큰 도움이 될 수 있습니다.

건의 사항:
1. 캠퍼스 야외 공간(잔디광장, 산책로 등)에서의 반려동물 동반 허용
2. 반려동물 동반 시 기본 에티켓 가이드라인 마련
3. 건물 내부 출입은 제한하되, 야외 공간은 개방

많은 관심과 동의 부탁드립니다.`,
    votesFor: 52,
    votesAgainst: 37,
    threshold: 200,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "김나윤",
        content: "취지는 좋지만 알레르기가 있는 학생들도 있어서 신중해야 할 것 같아요.",
        date: "2026.01.21",
        isMine: false,
        replies: [
          {
            id: 11,
            author: "정수아",
            content: "맞습니다. 그래서 건물 내부는 제한하고 야외 공간만 요청드린 것입니다.",
            date: "2026.01.21",
            isMine: false,
          },
        ],
      },
      {
        id: 2,
        author: "송지호",
        content: "해외 대학 사례를 보면 충분히 가능하다고 봅니다. 지지합니다.",
        date: "2026.01.22",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
  "6": {
    id: 6,
    title: "학생회관 카페테리아 메뉴 다양화 요청",
    status: "진행중",
    category: "학교시설",
    author: "한지우",
    date: "2026.01.18",
    council: "총학생회",
    content: `학생회관 카페테리아 메뉴의 다양화를 요청드립니다.

현재 학생회관 카페테리아에서 판매하는 메뉴가 매우 제한적이며, 특히 채식주의자나 알레르기가 있는 학생들을 위한 메뉴가 거의 없습니다. 매일 비슷한 메뉴 구성으로 인해 많은 학생들이 교외 식당을 이용하고 있어 추가적인 시간과 비용이 발생하고 있습니다.

요청 사항:
1. 채식/비건 메뉴 상시 운영
2. 알레르기 유발 식재료 표시 의무화
3. 월별 신메뉴 도입 및 학생 투표를 통한 메뉴 선정`,
    votesFor: 134,
    votesAgainst: 22,
    threshold: 200,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "김수현",
        content: "채식 메뉴 꼭 필요합니다. 매번 도시락 싸오기 힘들어요.",
        date: "2026.01.19",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
  "7": {
    id: 7,
    title: "장학금 선발 기준 투명성 강화 건의",
    status: "답변완료",
    category: "학생복지",
    author: "윤지서",
    date: "2026.01.15",
    council: "총학생회",
    content: `장학금 선발 기준의 투명성 강화를 건의드립니다.

현재 교내 장학금 선발 과정에서 구체적인 선발 기준과 점수 배분 방식이 공개되지 않아, 탈락 시 사유를 알 수 없어 학생들의 불만이 높습니다.

건의 사항:
1. 장학금 유형별 선발 기준 및 배점 공개
2. 선발 결과 발표 시 개인별 점수 확인 시스템 도입
3. 이의 신청 절차 마련 및 안내`,
    votesFor: 312,
    votesAgainst: 66,
    threshold: 300,
    officialResponse: {
      content: `안녕하세요, 총학생회입니다.

장학금 선발 기준 투명성에 관한 청원을 검토하였습니다.

1. 선발 기준 공개: 학생처와 협의하여 2026년 1학기부터 교내 장학금 유형별 선발 기준과 배점을 학교 홈페이지에 공개하기로 하였습니다.

2. 개인별 점수 확인: 시스템 개발이 필요하여 2026년 2학기를 목표로 추진 중입니다.

3. 이의 신청 절차: 기존에도 학생처를 통한 이의 신청이 가능하였으나, 절차가 명확히 안내되지 않았던 점을 개선하여 공지하겠습니다.`,
      respondent: "제55대 총학생회 복지위원회",
      date: "2026.02.03 11:00",
    },
    comments: [
      {
        id: 1,
        author: "배하은",
        content: "기준이 공개된다니 정말 다행이에요. 오래 기다렸습니다.",
        date: "2026.02.03",
        isMine: false,
        replies: [],
      },
      {
        id: 2,
        author: "권도윤",
        content: "개인별 점수 확인도 빨리 됐으면 좋겠네요.",
        date: "2026.02.04",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
  "8": {
    id: 8,
    title: "복수전공 학점 인정 범위 확대 요청",
    status: "진행중",
    category: "학사제도",
    author: "강서민",
    date: "2026.01.12",
    council: "단과대학 학생회",
    content: `복수전공 학점 인정 범위의 확대를 요청드립니다.

현재 복수전공 이수 시 전공 간 겹치는 교과목의 학점이 중복 인정되지 않아, 실질적으로 졸업에 필요한 총 이수 학점이 크게 늘어나는 문제가 있습니다.

요청 사항:
1. 전공 간 유사 교과목의 상호 인정 범위 확대 (현행 6학점 -> 12학점)
2. 복수전공 학생 대상 통합 교과목 개설
3. 복수전공 졸업요건의 현실적 조정`,
    votesFor: 189,
    votesAgainst: 45,
    threshold: 250,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "이도현",
        content: "복전하면서 졸업이 1년 늦어지는 게 현실이에요. 꼭 개선됐으면.",
        date: "2026.01.13",
        isMine: false,
        replies: [
          {
            id: 11,
            author: "강서민",
            content: "동감합니다. 많은 분들의 지지가 필요합니다.",
            date: "2026.01.13",
            isMine: false,
          },
        ],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
  "9": {
    id: 9,
    title: "공학관 강의실 냉난방 시설 개선 요청",
    status: "승인됨",
    category: "학교시설",
    author: "서준호",
    date: "2026.01.10",
    council: "단과대학 학생회",
    content: `공학관 강의실의 냉난방 시설 개선을 요청드립니다.

공학관 건물의 노후화로 인해 냉난방 시설이 제대로 작동하지 않는 강의실이 다수 있습니다. 특히 겨울철 난방이 되지 않아 패딩을 입고 수업을 듣는 일이 빈번하며, 여름철에는 에어컨이 고장난 채로 방치되는 경우도 있습니다.

요청 사항:
1. 공학관 전체 강의실 냉난방 시설 점검 및 교체
2. 시설 고장 시 즉시 보수 체계 구축
3. 강의실별 온도 개별 조절 시스템 도입`,
    votesFor: 378,
    votesAgainst: 43,
    threshold: 300,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "양채원",
        content: "겨울에 공학관 수업은 정말 고역이에요. 빨리 개선됐으면 합니다.",
        date: "2026.01.11",
        isMine: false,
        replies: [],
      },
      {
        id: 2,
        author: "조민서",
        content: "작년에도 민원 넣었는데 아무 변화가 없었어요. 이번에는 꼭.",
        date: "2026.01.11",
        isMine: false,
        replies: [
          {
            id: 21,
            author: "서준호",
            content: "이번엔 청원으로 공식 요청하니까 더 힘이 실릴 거라 믿습니다.",
            date: "2026.01.12",
            isMine: false,
          },
        ],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
  "10": {
    id: 10,
    title: "학교 공식 앱 UI/UX 개선 건의",
    status: "답변완료",
    category: "기타",
    author: "임수빈",
    date: "2026.01.08",
    council: "총학생회",
    content: `학교 공식 모바일 앱의 UI/UX 개선을 건의드립니다.

현재 세종대학교 공식 앱은 디자인이 오래되었고, 사용성이 매우 떨어져 대부분의 학생들이 사용을 기피하고 있습니다. 학사 일정 확인, 성적 조회, 수강 신청 등 필수 기능의 접근성이 낮아 학생들이 불편을 겪고 있습니다.

건의 사항:
1. 모던한 UI 디자인으로 전면 개편
2. 학사 일정, 성적, 수강신청 등 핵심 기능 메인 화면 배치
3. 푸시 알림 기능 강화 (수업 변경, 공지사항 등)`,
    votesFor: 223,
    votesAgainst: 44,
    threshold: 200,
    officialResponse: {
      content: `안녕하세요, 총학생회입니다.

학교 공식 앱 개선 건의에 대해 전산정보원과 협의한 결과를 안내드립니다.

1. UI 전면 개편: 전산정보원에서 2026년 상반기 중 앱 리뉴얼 프로젝트를 진행할 예정이며, 학생 의견을 반영한 디자인을 적용하겠습니다.

2. 핵심 기능 접근성: 메인 화면에 자주 사용하는 기능의 바로가기를 배치하도록 개선하겠습니다.

3. 푸시 알림: 현재 기술적 검토 중이며, 리뉴얼 시 함께 반영할 계획입니다.`,
      respondent: "제55대 총학생회 소통위원회",
      date: "2026.01.28 09:30",
    },
    comments: [
      {
        id: 1,
        author: "김하영",
        content: "드디어 개편 소식이네요. 현재 앱은 정말 쓰기 힘들었거든요.",
        date: "2026.01.28",
        isMine: false,
        replies: [],
      },
      {
        id: 2,
        author: "이건우",
        content: "학생 의견 반영한다고 하니 기대됩니다. 설문조사 해주시면 좋겠어요.",
        date: "2026.01.29",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: false,
    isAdmin: false,
  },
  "13": {
    id: 13,
    title: "교내 자판기 제품 종류 확대 건의",
    status: "미승인",
    category: "기타",
    author: "김도현",
    date: "2026.01.05",
    council: "총학생회",
    content: `교내 자판기에서 판매하는 제품 종류의 확대를 건의드립니다.

현재 교내 자판기에서는 커피와 일부 음료만 판매되고 있어 선택의 폭이 매우 좁습니다. 특히 야간 수업이나 늦은 시간까지 학교에 남아 공부하는 학생들은 편의점까지 가기 어려운 상황에서 자판기에 의존하게 되는데, 현재 제품 구성으로는 부족한 실정입니다.

건의 사항:
1. 간편식(삼각김밥, 샌드위치 등) 판매 자판기 추가 설치
2. 건강 음료 및 저당 음료 옵션 확대
3. 계절별 메뉴 교체로 다양성 확보`,
    votesFor: 0,
    votesAgainst: 0,
    threshold: 150,
    officialResponse: null,
    comments: [
      {
        id: 1,
        author: "이현우",
        content: "자판기 간편식 있으면 정말 편할 것 같아요. 야간에 특히요.",
        date: "2026.01.06",
        isMine: false,
        replies: [],
      },
    ],
    isAuthor: true,
    isAdmin: false,
  },
  "14": {
    id: 14,
    title: "학생회비 사용 내역 분기별 공개 의무화 요청",
    status: "반려",
    category: "학생복지",
    author: "한서준",
    date: "2026.01.03",
    council: "총학생회",
    content: `학생회비 사용 내역의 분기별 공개를 의무화해주실 것을 요청합니다.

매년 학생회비를 납부하고 있지만, 구체적인 사용 내역이 투명하게 공개되지 않아 학생들의 불신이 커지고 있습니다. 학생회비는 학생들의 자발적 납부로 운영되는 만큼, 사용처에 대한 상세한 정보 공개는 당연한 권리입니다.

요청 사항:
1. 학생회비 사용 내역을 분기별로 학교 홈페이지에 공개
2. 항목별 지출 내역과 영수증 증빙 자료 포함
3. 학생 감사위원회를 통한 독립적 감사 실시`,
    votesFor: 345,
    votesAgainst: 28,
    threshold: 300,
    officialResponse: {
      content: `안녕하세요, 총학생회입니다.

해당 청원에 대해 검토한 결과를 안내드립니다.

학생회비 사용 내역 공개의 취지에는 공감하나, 현행 학칙 제42조에 따라 학생회비 결산은 연 1회 정기감사를 통해 공개하도록 되어 있으며, 분기별 공개로 변경하기 위해서는 학칙 개정이 필요합니다.

현재 학칙 개정 절차는 총학생회의 권한 범위를 벗어나며, 이는 학교 평의원회의 의결 사항에 해당합니다. 따라서 본 청원은 현 시점에서 이행이 불가하여 반려 처리하오니 양해 부탁드립니다.

다만, 연간 결산 보고서의 상세도를 높이는 방안은 검토하겠으며, 학칙 개정 건의는 평의원회 학생 위원을 통해 별도 전달하겠습니다.`,
      respondent: "제55대 총학생회 재정위원회",
      date: "2026.01.15 16:00",
    },
    comments: [
      {
        id: 1,
        author: "오채림",
        content: "반려라니 아쉽네요. 학칙 개정도 추진해야 하는 것 아닌가요?",
        date: "2026.01.16",
        isMine: false,
        replies: [
          {
            id: 11,
            author: "한서준",
            content: "평의원회에 전달해주신다고 하니 추이를 지켜봐야 할 것 같습니다.",
            date: "2026.01.16",
            isMine: false,
          },
        ],
      },
      {
        id: 2,
        author: "배민석",
        content: "분기별이 안 되면 반기별이라도 되도록 요청했으면 좋겠어요.",
        date: "2026.01.17",
        isMine: false,
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
  const { isAdmin } = useAuth()
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
            isAdmin={isAdmin}
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
