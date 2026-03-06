import { NextRequest, NextResponse } from "next/server"

export type UserRole = "STUDENT" | "ADMIN" | "SUPER"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN"

interface User {
  studentNo: string
  name: string
  department: string
  role: UserRole
  status: UserStatus
}

// Mock users data
const mockUsers: User[] = [
  { studentNo: "20210001", name: "김영희", department: "컴퓨터공학과", role: "STUDENT", status: "ACTIVE" },
  { studentNo: "20210002", name: "이철수", department: "경영학과", role: "STUDENT", status: "ACTIVE" },
  { studentNo: "20210003", name: "박지민", department: "전자공학과", role: "STUDENT", status: "SUSPENDED" },
  { studentNo: "20200001", name: "최민수", department: "국어국문학과", role: "ADMIN", status: "ACTIVE" },
  { studentNo: "20190001", name: "정수연", department: "화학과", role: "STUDENT", status: "WITHDRAWN" },
  { studentNo: "20220001", name: "강태희", department: "수학과", role: "STUDENT", status: "ACTIVE" },
  { studentNo: "20180001", name: "윤서준", department: "물리학과", role: "ADMIN", status: "ACTIVE" },
  { studentNo: "admin", name: "관리자", department: "총학생회", role: "ADMIN", status: "ACTIVE" },
  { studentNo: "super", name: "시스템 관리자", department: "시스템", role: "SUPER", status: "ACTIVE" },
]

export async function GET(request: NextRequest) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In real implementation, verify SUPER role
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""

  let filteredUsers = mockUsers

  if (search) {
    const searchLower = search.toLowerCase()
    filteredUsers = mockUsers.filter(
      (u) =>
        u.studentNo.includes(searchLower) ||
        u.name.toLowerCase().includes(searchLower) ||
        u.department.toLowerCase().includes(searchLower)
    )
  }

  return NextResponse.json(filteredUsers)
}
