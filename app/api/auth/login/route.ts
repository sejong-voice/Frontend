import { cookies } from "next/headers"
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

  // Create a session id (mock)
  const sid = `sid_${studentId}_${Date.now()}`

  const cookieStore = await cookies()
  cookieStore.set("sid", sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours
  })

  // Store session data in a cookie for the mock (in production this would be server-side session store)
  cookieStore.set(
    "session_data",
    JSON.stringify({ id: studentId, name: user.name, role: user.role }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4,
    }
  )

  return NextResponse.json({
    id: studentId,
    name: user.name,
    role: user.role,
  })
}
