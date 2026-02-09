import { NextResponse } from "next/server"

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production"
  const expireOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`

  const response = NextResponse.json({ ok: true })

  response.headers.append("Set-Cookie", `sid=; ${expireOptions}`)
  response.headers.append("Set-Cookie", `session_data=; ${expireOptions}`)

  return response
}
