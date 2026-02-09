"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const navItems = [
  { label: "전체 청원", href: "/" },
  { label: "진행중", href: "/in-progress" },
  { label: "답변완료", href: "/answered" },
  { label: "내 청원", href: "/my-petitions" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { logout } = useAuth()

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
            {navItems.map((item) => (
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
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{"로그아웃"}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
