import { NextResponse } from "next/server"

type UserRole = "STUDENT" | "ADMIN" | "SUPER"
type UserStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN"

interface MockUser {
  password: string
  id: number
  name: string
  department: string
  role: UserRole
  status: UserStatus
  managedCouncilIds?: number[]
}

// Mock user database
const MOCK_USERS: Record<string, MockUser> = {
  "20210001": {
    password: "1234",
    id: 1,
    name: "홍길동",
    department: "컴퓨터공학과",
    role: "STUDENT",
    status: "ACTIVE",
  },
  "20210002": {
    password: "1234",
    id: 2,
    name: "김철수",
    department: "전자공학과",
    role: "STUDENT",
    status: "ACTIVE",
  },
  "20210003": {
    password: "1234",
    id: 3,
    name: "이영희",
    department: "경영학과",
    role: "STUDENT",
    status: "SUSPENDED",
  },
  admin: {
    password: "admin",
    id: 100,
    name: "총학생회 운영진",
    department: "총학생회",
    role: "ADMIN",
    status: "ACTIVE",
    managedCouncilIds: [1], // 총학생회 담당
  },
  super: {
    password: "super",
    id: 999,
    name: "시스템 관리자",
    department: "시스템관리",
    role: "SUPER",
    status: "ACTIVE",
  },
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

  const userData = {
    id: user.id,
    studentNo: studentId,
    name: user.name,
    department: user.department,
    role: user.role,
    status: user.status,
    managedCouncilIds: user.managedCouncilIds,
  }

  const sessionData = JSON.stringify(userData)

  const isProduction = process.env.NODE_ENV === "production"
  const cookieOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 4}${isProduction ? "; Secure" : ""}`

  const response = NextResponse.json(userData)

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
