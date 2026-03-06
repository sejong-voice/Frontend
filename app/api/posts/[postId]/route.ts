import { NextRequest, NextResponse } from "next/server"

interface UpdatePostRequest {
  title: string
  content: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { postId } = await params

  try {
    const body = (await request.json()) as UpdatePostRequest

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 })
    }
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 })
    }

    // Mock response - in production this would update a real post
    return NextResponse.json({
      id: parseInt(postId),
      title: body.title,
      content: body.content,
      updatedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params

  // Mock data - in production this would fetch from database
  const mockPosts: Record<string, { id: number; title: string; content: string; councilId: number; authorId: number }> = {
    "1": {
      id: 1,
      title: "졸업요건 중 영어 인증 기준 완화 요청",
      content: "안녕하세요. 본 청원은 현행 졸업요건 중 영어 인증 기준에 대한 완화를 요청드리기 위해 작성합니다.\n\n현재 우리 대학의 졸업요건에는 일정 수준 이상의 공인영어성적 또는 대체 시험 합격이 포함되어 있습니다. 그러나 이 기준이 일부 학생들에게는 과도한 부담이 되고 있으며, 특히 영어와 직접적인 관련이 없는 전공 학생들에게도 동일한 기준이 적용되는 것은 형평성 측면에서 재고가 필요합니다.",
      councilId: 1,
      authorId: 1,
    },
    "11": {
      id: 11,
      title: "기숙사 외박 신청 절차 간소화 요청",
      content: "현재 기숙사 외박 신청 절차가 너무 복잡합니다. 간소화를 요청합니다.",
      councilId: 1,
      authorId: 1,
    },
  }

  const post = mockPosts[postId]

  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
  }

  return NextResponse.json(post)
}
