import { NextResponse } from "next/server"

// Mock user database
const MOCK_USERS: Record<
  string,
  { password: string; name: string; role: "student" | "admin" }
> = {
  "20210001": { password: "1234", name: "홍길동", role: "student" },
  "20210002": { password: "1234", name: "김철수", role: "student" },
  admin: { password: "admin", name: "학생회 관리자", role: "admin" },
}

export async function POST(request: Request) {
  const body = await request.json()
  const { studentId, password } = body as {
    studentId: string
    password: string
  }

  if (!studentId || !password) {
    return NextResponse.json(
      { error: "학번과 비밀번호를 모두 입력해주세요." },
      { status: 400 }
    )
  }

  const user = MOCK_USERS[studentId]
  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    )
  }

  const sessionData = JSON.stringify({
    id: studentId,
    name: user.name,
    role: user.role,
  })

  const isProduction = process.env.NODE_ENV === "production"
  const cookieOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 4}${isProduction ? "; Secure" : ""}`

  const response = NextResponse.json({
    id: studentId,
    name: user.name,
    role: user.role,
  })

  response.headers.append(
    "Set-Cookie",
    `sid=sid_${studentId}_${Date.now()}; ${cookieOptions}`
  )
  response.headers.append(
    "Set-Cookie",
    `session_data=${encodeURIComponent(sessionData)}; ${cookieOptions}`
  )

  return response
}
