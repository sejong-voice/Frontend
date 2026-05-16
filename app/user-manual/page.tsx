"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ConnectedHeader } from "@/components/layout/connected-header"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

const studentManualOrder = [4, 5, 6, 7, 8, 3, 2, 1, 9]

const studentManualImages = studentManualOrder.map((manualNumber, index) => ({
  src: `/user_manual${manualNumber}.png`,
  alt: `일반 학생 사용 매뉴얼 ${index + 1}`,
}))

const councilManualImages = Array.from({ length: 3 }, (_, index) => ({
  src: `/council_manual${index + 1}.png`,
  alt: `학생회 사용 매뉴얼 ${index + 1}`,
}))

type ManualImage = {
  src: string
  alt: string
}

function ManualCarousel({ images }: { images: ManualImage[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [arrowTop, setArrowTop] = useState<number>()
  const [contentHeight, setContentHeight] = useState<number>()
  const carouselRootRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])

  const updateCarouselLayout = useCallback(() => {
    const root = carouselRootRef.current
    const currentImage = imageRefs.current[current]
    const firstImage = imageRefs.current[0]

    if (!root) return

    if (currentImage) {
      const currentImageRect = currentImage.getBoundingClientRect()

      if (currentImageRect.height > 0) {
        setContentHeight(currentImageRect.height)
      }
    }

    if (firstImage) {
      const rootRect = root.getBoundingClientRect()
      const firstImageRect = firstImage.getBoundingClientRect()

      if (firstImageRect.height > 0) {
        setArrowTop(firstImageRect.top - rootRect.top + firstImageRect.height / 2)
      }
    }
  }, [current])

  useEffect(() => {
    if (!api) return

    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap())
    }

    updateCurrent()
    api.on("select", updateCurrent)
    api.on("reInit", updateCurrent)

    return () => {
      api.off("select", updateCurrent)
      api.off("reInit", updateCurrent)
    }
  }, [api])

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateCarouselLayout)

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [updateCarouselLayout])

  useEffect(() => {
    window.addEventListener("resize", updateCarouselLayout)

    return () => {
      window.removeEventListener("resize", updateCarouselLayout)
    }
  }, [updateCarouselLayout])

  useEffect(() => {
    const root = carouselRootRef.current
    const currentImage = imageRefs.current[current]
    const firstImage = imageRefs.current[0]

    if (!root || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(updateCarouselLayout)
    observer.observe(root)

    if (firstImage) {
      observer.observe(firstImage)
    }

    if (currentImage && currentImage !== firstImage) {
      observer.observe(currentImage)
    }

    return () => {
      observer.disconnect()
    }
  }, [current, updateCarouselLayout])

  useEffect(() => {
    if (!api) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if (isTypingTarget) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        api.scrollPrev()
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        api.scrollNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [api])

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <Carousel
        ref={carouselRootRef}
        setApi={setApi}
        opts={{ align: "start" }}
        className="w-full"
      >
        <div
          className="overflow-hidden transition-[height] duration-200 ease-out"
          style={contentHeight === undefined ? undefined : { height: contentHeight }}
        >
          <CarouselContent className="ml-0 items-start">
            {images.map((image, index) => (
              <CarouselItem key={image.src} className="pl-0">
                <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                  <img
                    ref={(node) => {
                      imageRefs.current[index] = node
                    }}
                    src={image.src}
                    alt={image.alt}
                    className="block w-full bg-white"
                    draggable={false}
                    onLoad={updateCarouselLayout}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
        <CarouselPrevious
          className="left-2 h-10 w-10 border-border bg-white/95 shadow-md hover:bg-white sm:-left-14"
          style={arrowTop === undefined ? undefined : { top: arrowTop }}
        />
        <CarouselNext
          className="right-2 h-10 w-10 border-border bg-white/95 shadow-md hover:bg-white sm:-right-14"
          style={arrowTop === undefined ? undefined : { top: arrowTop }}
        />
      </Carousel>

      <div className="mt-4 flex justify-center">
        <span className="rounded-full border border-border bg-white px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
          {current + 1}
          {" / "}
          {images.length}
        </span>
      </div>
    </div>
  )
}

export default function UserManualPage() {
  const { loading, user, isAdmin } = useAuth()
  const isStudent = user?.role === "STUDENT"

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {"사용 매뉴얼"}
            </h1>
          </div>

          {isStudent ? (
            <ManualCarousel images={studentManualImages} />
          ) : isAdmin ? (
            <ManualCarousel images={councilManualImages} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {"로그인 후 사용자 유형에 맞는 매뉴얼을 확인할 수 있습니다."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
