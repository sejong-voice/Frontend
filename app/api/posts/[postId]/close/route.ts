import { NextRequest, NextResponse } from "next/server"

export async function POST(
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

    // Check if user is ADMIN or SUPER
    if (user.role !== "ADMIN" && user.role !== "SUPER") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    // Mock response - in production this would close the voting
    return NextResponse.json({
      id: parseInt(postId),
      status: "APPROVED",
      message: "투표가 조기 마감되었습니다.",
      closedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }
}
