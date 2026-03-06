import { NextRequest, NextResponse } from "next/server"

interface ReportedItem {
  id: number
  type: "post" | "comment"
  title?: string
  content: string
  author: string
  reportCount: number
  createdAt: string
}

// Mock reported items
const mockReports: ReportedItem[] = [
  {
    id: 1,
    type: "post",
    title: "부적절한 게시글 제목",
    content: "신고된 게시글 내용...",
    author: "20220005",
    reportCount: 5,
    createdAt: "2026.02.10",
  },
  {
    id: 2,
    type: "comment",
    content: "신고된 댓글 내용...",
    author: "20210008",
    reportCount: 3,
    createdAt: "2026.02.09",
  },
  {
    id: 3,
    type: "post",
    title: "스팸 게시글",
    content: "스팸 내용...",
    author: "20230001",
    reportCount: 8,
    createdAt: "2026.02.08",
  },
]

export async function GET(request: NextRequest) {
  const sid = request.cookies.get("sid")

  if (!sid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(mockReports)
}
