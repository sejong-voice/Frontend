"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConnectedHeader as SiteHeader } from "@/components/layout/connected-header"
import { PetitionForm } from "@/components/petition/petition-form"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"

export default function NewPetitionPage() {
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading || !user) {
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
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {"청원 작성"}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {"작성된 청원은 O/X 투표를 통해 공론화됩니다."}
            </p>
          </div>

          {/* Form */}
          <PetitionForm />
        </div>
      </main>
    </div>
  )
}
