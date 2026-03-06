import { NextResponse } from "next/server"

export interface Council {
  id: number
  name: string
}

// Mock councils data
const councils: Council[] = [
  { id: 1, name: "총학생회" },
  { id: 2, name: "단과대학 학생회" },
  { id: 3, name: "학과 학생회" },
]

export async function GET() {
  return NextResponse.json(councils)
}
