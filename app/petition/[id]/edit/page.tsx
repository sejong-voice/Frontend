"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { PetitionEditForm } from "./edit-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditPetitionPage({ params }: PageProps) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <PageHeader 
            stats={[]} 
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {"청원 수정"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {"기존에 작성한 청원 내용을 수정할 수 있습니다."}
          </p>
        </div>
        <PetitionEditForm id={id} />
      </main>
    </div>
  )
}
