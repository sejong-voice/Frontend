import { SiteHeader } from "@/components/site-header"
import { PetitionForm } from "@/components/petition-form"

export default function NewPetitionPage() {
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
