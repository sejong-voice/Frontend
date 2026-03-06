import { NextRequest, NextResponse } from "next/server"

// PATCH /admin/user/{studentNo}/status, role, department, restore
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentNo: string }> }
) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { studentNo } = await params
  const body = await request.json()

  // Handle different operations
  if (body.status !== undefined) {
    // Status change
    return NextResponse.json({
      success: true,
      message: `사용자 ${studentNo}의 상태가 ${body.status}로 변경되었습니다.`,
    })
  }

  if (body.role !== undefined) {
    // Role change
    return NextResponse.json({
      success: true,
      message: `사용자 ${studentNo}의 권한이 ${body.role}로 변경되었습니다.`,
    })
  }

  if (body.department !== undefined) {
    // Department change
    return NextResponse.json({
      success: true,
      message: `사용자 ${studentNo}의 학과가 ${body.department}로 변경되었습니다.`,
    })
  }

  if (body.restore === true) {
    // Early restore
    return NextResponse.json({
      success: true,
      message: `사용자 ${studentNo}가 조기 복구되었습니다.`,
    })
  }

  return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
}
