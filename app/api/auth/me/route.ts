import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const sid = cookieStore.get("sid")
  const sessionData = cookieStore.get("session_data")

  if (!sid || !sessionData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = JSON.parse(sessionData.value) as {
      id: string
      name: string
      role: string
    }
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}
