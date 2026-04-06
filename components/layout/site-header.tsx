"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User } from "lucide-react"

const publicNavItems = [
  { label: "전체 청원", href: "/" },
]

const authNavItems = [
  { label: "내 청원", href: "/my-petitions" },
]

const adminNavItems = [
  { label: "청원 관리", href: "/admin/petitions" },
]

interface SiteHeaderProps {
  userName?: string | null
  onLogout?: () => void
  isAdmin?: boolean
}

export function SiteHeader({ userName, onLogout, isAdmin }: SiteHeaderProps) {
  const pathname = usePathname()

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
            className="flex items-center gap-0.5 md:gap-1"
            aria-label="메인 메뉴"
          >
            {/* Public items */}
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hidden md:inline-flex",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Auth items (only for regular students) */}
            {userName && !isAdmin && authNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Admin items */}
            {isAdmin && adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.label}
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
                onClick={onLogout}
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
