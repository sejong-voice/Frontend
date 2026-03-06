"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User, Settings, Shield } from "lucide-react"
import type { UserRole } from "@/components/auth/auth-provider"

// Public nav items - visible to everyone
const publicNavItems = [
  { label: "전체 청원", href: "/" },
  { label: "투표중", href: "/voting" },
  { label: "완료", href: "/completed" },
]

// Auth nav items - visible to logged-in users
const authNavItems = [
  { label: "내 청원", href: "/my-petitions" },
]

// Admin nav items - visible to ADMIN role
const adminNavItems = [
  { label: "운영 페이지", href: "/operations" },
]

// Super nav items - visible to SUPER role
const superNavItems = [
  { label: "관리자", href: "/admin" },
]

interface SiteHeaderProps {
  userName?: string | null
  userRole?: UserRole | null
  onLogout?: () => void
}

export function SiteHeader({ userName, userRole, onLogout }: SiteHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    }
    router.push("/")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/sejong-logo.png"
            alt="세종대학교 로고"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {"세종 신문고"}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="메인 메뉴"
          >
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            {userName && userRole === "STUDENT" && authNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            {userRole === "ADMIN" && adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1">
                  <Settings className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              </Link>
            ))}
            {userRole === "SUPER" && superNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {userName ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
                <User className="h-3.5 w-3.5" />
                {userName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{"로그아웃"}</span>
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{"로그인"}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
