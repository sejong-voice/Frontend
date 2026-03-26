"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { PetitionList, Petition } from "@/components/petition/petition-list"
import { Loader2, ShieldCheck, Inbox } from "lucide-react"
import { postService } from "@/app/api/posts"

export default function AdminPetitionsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/")
    }
  }, [authLoading, isAdmin, router])

  useEffect(() => {
    const fetchAssignedPetitions = async () => {
      if (!isAdmin) return
      try {
        setLoading(true)
        const response = await postService.getPosts({ assignedToMe: true })
        setPetitions(response.data.content)
      } catch (error) {
        console.error("Failed to fetch assigned petitions:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && isAdmin) {
      fetchAssignedPetitions()
    }
  }, [authLoading, isAdmin])

  if (authLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {"청원 관리 시스템"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {"학생회 전용 청원 모니터링 및 처리 페이지입니다."}
              </p>
            </div>
          </div>

          <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{"할당된 청원 목록"}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {"해당 학생회 계정에 할당되어 처리가 필요한 청원 목록입니다."}
            </p>
            
            {loading ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : petitions.length > 0 ? (
              <PetitionList petitions={petitions} from="admin" />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                {"할당된 청원이 없습니다."}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
