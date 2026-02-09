import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const sid = request.cookies.get("sid")
  const sessionData = request.cookies.get("session_data")

  if (!sid || !sessionData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = JSON.parse(decodeURIComponent(sessionData.value)) as {
      id: string
      name: string
      role: string
    }
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}
