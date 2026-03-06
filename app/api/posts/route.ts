import { NextRequest, NextResponse } from "next/server"

export type VotingDuration = "ONE_WEEK" | "TWO_WEEKS" | "FOUR_WEEKS"
export type PostStatus = "VOTING" | "APPROVED" | "PENDING" | "COMPLETED" | "REJECTED"

interface CreatePostRequest {
  title: string
  content: string
  councilId: number
  postVotingDuration: VotingDuration
}

// Mock data for assigned posts
const mockAssignedPosts = [
  {
    id: 1,
    title: "졸업요건 중 영어 인증 기준 완화 요청",
    status: "VOTING" as PostStatus,
    council: "총학생회",
    councilId: 1,
    votesFor: 245,
    votesAgainst: 67,
    voteEndDate: "2026.02.15",
    createdAt: "2026.02.01",
  },
  {
    id: 2,
    title: "중앙도서관 24시간 열람실 운영 재개 요청",
    status: "VOTING" as PostStatus,
    council: "총학생회",
    councilId: 1,
    votesFor: 198,
    votesAgainst: 89,
    voteEndDate: "2026.02.18",
    createdAt: "2026.01.28",
  },
  {
    id: 4,
    title: "계절학기 수강 신청 기간 확대 요청",
    status: "APPROVED" as PostStatus,
    council: "총학생회",
    councilId: 1,
    votesFor: 156,
    votesAgainst: 42,
    voteEndDate: "2026.01.30",
    createdAt: "2026.01.22",
  },
  {
    id: 6,
    title: "학생회관 카페테리아 메뉴 다양화 요청",
    status: "VOTING" as PostStatus,
    council: "총학생회",
    councilId: 1,
    votesFor: 89,
    votesAgainst: 67,
    voteEndDate: "2026.02.20",
    createdAt: "2026.01.18",
  },
]

export async function GET(request: NextRequest) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const assignedToMe = searchParams.get("assignedToMe")

  if (assignedToMe === "true") {
    // Return posts assigned to the current admin
    return NextResponse.json(mockAssignedPosts)
  }

  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as CreatePostRequest

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 })
    }
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 })
    }
    if (!body.councilId) {
      return NextResponse.json({ error: "담당 학생회를 선택해주세요." }, { status: 400 })
    }
    if (!body.postVotingDuration) {
      return NextResponse.json({ error: "투표 기간을 선택해주세요." }, { status: 400 })
    }

    // Mock response - in production this would create a real post
    const newPostId = Math.floor(Math.random() * 1000) + 100

    return NextResponse.json({
      id: newPostId,
      title: body.title,
      content: body.content,
      councilId: body.councilId,
      postVotingDuration: body.postVotingDuration,
      status: "VOTING",
      createdAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }
}
