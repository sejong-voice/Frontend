"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

const navItems = [
  { label: "전체 청원", href: "/" },
  { label: "진행중", href: "/in-progress" },
  { label: "답변완료", href: "/answered" },
  { label: "내 청원", href: "/my-petitions" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              {"세"}
            </span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {"세종대 신문고"}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-1 md:flex" aria-label="메인 메뉴">
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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login" className="gap-1.5 text-muted-foreground">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{"로그인"}</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
