import { NextRequest, NextResponse } from "next/server"

// PATCH /admin/moderations/comments/{commentId}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { commentId } = await params
  const body = await request.json()

  // Sanction comment
  return NextResponse.json({
    success: true,
    message: `댓글 ${commentId}이(가) 제재되었습니다.`,
    reason: body.reason || "관리자 제재",
  })
}
