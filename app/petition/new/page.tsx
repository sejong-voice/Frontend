"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConnectedHeader as SiteHeader } from "@/components/layout/connected-header"
import { PetitionForm } from "@/components/petition/petition-form"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPetitionPage() {
  const { loading, user, isAdmin, isSuper } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (isAdmin || isSuper) {
        // ADMIN/SUPER는 청원 작성 불가
        router.replace("/")
      }
    }
  }, [loading, user, isAdmin, isSuper, router])

  if (loading || !user || isAdmin || isSuper) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Back link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {"목록으로 돌아가기"}
          </Link>

          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {"청원 작성"}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {"작성된 청원은 투표를 통해 공론화됩니다."}
            </p>
          </div>

          {/* Form */}
          <PetitionForm />
        </div>
      </main>
    </div>
  )
}
