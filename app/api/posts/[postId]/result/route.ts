import { NextRequest, NextResponse } from "next/server"

interface ResultRequest {
  status: "COMPLETED" | "REJECTED"
  resultContent: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const sid = request.cookies.get("sid")
  const sessionData = request.cookies.get("session_data")

  if (!sid || !sessionData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = JSON.parse(decodeURIComponent(sessionData.value))
    const { postId } = await params
    const body = (await request.json()) as ResultRequest

    // Check if user is ADMIN or SUPER
    if (user.role !== "ADMIN" && user.role !== "SUPER") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    // Validate status
    if (body.status !== "COMPLETED" && body.status !== "REJECTED") {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다. COMPLETED 또는 REJECTED만 허용됩니다." },
        { status: 400 }
      )
    }

    // Validate resultContent
    if (!body.resultContent?.trim()) {
      return NextResponse.json(
        { error: "처리 결과 입장문을 입력해주세요." },
        { status: 400 }
      )
    }

    // Mock response - in production this would update the post
    return NextResponse.json({
      id: parseInt(postId),
      status: body.status,
      resultContent: body.resultContent,
      processedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }
}
