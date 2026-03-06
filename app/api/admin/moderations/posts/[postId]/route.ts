import { NextRequest, NextResponse } from "next/server"

// PATCH /admin/moderations/posts/{postId}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { postId } = await params
  const body = await request.json()

  // Sanction post
  return NextResponse.json({
    success: true,
    message: `게시글 ${postId}이(가) 제재되었습니다.`,
    reason: body.reason || "관리자 제재",
  })
}
