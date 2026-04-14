"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Info, User, Loader2, Search, Check, ChevronsUpDown } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { postService, type PostVotingDuration } from "@/app/api/posts"
import { councilService, Council } from "@/app/api/councils"
import { toast } from "sonner"
import { useEffect } from "react"
import { Petition } from "@/components/petition/petition-list"
import { ImageUploader } from "./image-uploader"

const categories = ["학사제도", "학교시설", "학생복지", "기타"] as const
const votePeriods = [
  { value: "ONE_WEEK", label: "1주" },
  { value: "TWO_WEEK", label: "2주" },
  { value: "FOUR_WEEK", label: "4주" },
] as const satisfies ReadonlyArray<{ value: PostVotingDuration; label: string }>

const MAX_CONTENT_LENGTH = 2000

export function PetitionForm() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [category, setCategory] = useState<string>("")
  const [council, setCouncil] = useState<string>("")
  const [councils, setCouncils] = useState<Council[]>([])
  const [councilKeyword, setCouncilKeyword] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [votePeriod, setVotePeriod] = useState<PostVotingDuration>("ONE_WEEK")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCouncilLoading, setIsCouncilLoading] = useState(false)
  const [isCouncilOpen, setIsCouncilOpen] = useState(false)
  const [images, setImages] = useState<{ imageId: string; imageUrl: string }[]>([])

  // Admin fields
  const [adminActionType, setAdminActionType] = useState<"INITIAL" | "ADDITIONAL">("INITIAL")
  const [assignedPetitions, setAssignedPetitions] = useState<Petition[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string>("")
  const [resultStatus, setResultStatus] = useState<"COMPLETED" | "REJECTED">("COMPLETED")

  const contentLength = content.length

  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setIsCouncilLoading(true)
      try {
        const res = await councilService.getCouncils(councilKeyword)
        if (active) setCouncils(res.data)
      } catch (error) {
        console.error("학생회 목록 로드 실패:", error)
      } finally {
        if (active) setIsCouncilLoading(false)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [councilKeyword])

  useEffect(() => {
    if (!authLoading && isAdmin) {
      // 입장문 작성이 가능한 모든 상태의 청원을 불러옵니다.
      Promise.all([
        postService.getPosts({ assignedToMe: true, status: "APPROVED", size: 500 }),
        postService.getPosts({ assignedToMe: true, status: "COMPLETED", size: 500 }),
        postService.getPosts({ assignedToMe: true, status: "REJECTED", size: 500 }),
      ])
        .then(results => {
          const allPetitions = results.flatMap(res => res.data.content)
          
          // 중복 제거 및 전체 목록 저장
          const uniquePetitions = Array.from(new Map(allPetitions.map(p => [p.id, p])).values());
          setAssignedPetitions(uniquePetitions)
        })
        .catch(error => {
          console.error("할당된 청원 로드 실패:", error)
          toast.error("연결 가능한 청원 목록을 불러오지 못했습니다.")
        })
    }
  }, [authLoading, isAdmin])

  // 현재 선택된 모드에 따라 필터링된 목록
  const filteredPetitions = assignedPetitions.filter(p => {
    const s = p.status?.toUpperCase();
    const statementCount = p.statements?.length ?? 0;

    if (adminActionType === "INITIAL") {
      return s === "APPROVED";
    } else {
      // 추가 입장문 대상: 이미 처리되었으나 입장문이 1개인 경우
      // (목록 API에서 statements가 없는 경우도 일단 노출하여 상세조회 시 판단)
      return (s === "COMPLETED" || s === "REJECTED") && (!p.statements || statementCount === 1);
    }
  })

  const selectedPetition = assignedPetitions.find(p => p.id === selectedPostId)
  
  // 선택된 청원의 상세 정보 데이터 동기화
  useEffect(() => {
    if (selectedPostId && selectedPostId !== "none" && isAdmin) {
      postService.getPost(selectedPostId)
        .then(res => {
          setAssignedPetitions(prev => prev.map(p => p.id === selectedPostId ? res.data : p))
        })
        .catch(err => console.error("데이터 동기화 실패:", err))
    }
  }, [selectedPostId, isAdmin])

  const isAdditionalStatement = (selectedPetition?.statements?.length ?? 0) >= 1
  const statementSequence = (selectedPetition?.statements?.length ?? 0) + 1

  async function handleSubmit() {
    if (!isAdmin && (!title.trim() || !content.trim() || !council)) {
      toast.error("모든 필드를 입력해 주세요.")
      return
    }

    if (isAdmin && (!selectedPostId || !content.trim())) {
      toast.error("연결할 청원과 내용을 입력해 주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      if (isAdmin) {
        await postService.submitPostStatement(selectedPostId, {
          // 첫 번째 입장문일 때만 finalStatus를 포함
          ...(isAdditionalStatement ? {} : { finalStatus: resultStatus }),
          content: content,
          imageIds: images.map((img) => img.imageId),
        })
      } else {
        await postService.createPost({
          title,
          content,
          councilId: council,
          postVotingDuration: votePeriod,
          imageIds: images.map((img) => img.imageId),
        })
      }
      toast.success(
        isAdmin 
          ? (isAdditionalStatement ? "추가 입장문이 등록되었습니다." : "첫 입장문이 등록되었습니다.") 
          : "청원이 등록되었습니다."
      )
      router.push("/my-petitions")
    } catch (error: any) {
      console.error(isAdmin ? "입장문 등록 실패:" : "청원 등록 실패:", error)
      toast.error(error.response?.data?.message || (isAdmin ? "입장문 등록에 실패했습니다." : "청원 등록에 실패했습니다."))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push("/my-petitions")
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Author info */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{"작성자"}</span>
        <span className="text-sm font-medium text-foreground">{user?.name}</span>
        <span className="text-xs text-muted-foreground">{"(게시 시 익명 처리됩니다)"}</span>
      </div>

      {/* Notice banner */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {"욕설\u00B7비속어가 포함된 청원은 등록되지 않습니다."}
        </p>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-6">
        {/* Petition Link for Admin */}
        {isAdmin && (
          <div className="flex flex-col gap-6">
            {/* Task Type Toggle */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-foreground">
                {"작성 단계 선택"}
                <span className="ml-1 text-destructive">{"*"}</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminActionType("INITIAL")
                    setSelectedPostId("")
                  }}
                  className={cn(
                    "flex-1 rounded-md border py-2.5 text-sm font-semibold transition-all",
                    adminActionType === "INITIAL"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {"최초 입장문 작성"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminActionType("ADDITIONAL")
                    setSelectedPostId("")
                  }}
                  className={cn(
                    "flex-1 rounded-md border py-2.5 text-sm font-semibold transition-all",
                    adminActionType === "ADDITIONAL"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {"추가 보충 답변 작성"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="petition-select"
                className="text-sm font-medium text-foreground"
              >
                {adminActionType === "INITIAL" ? "연결할 청원 선택 (검토중)" : "연결할 청원 선택 (처리완료/반려)"}
                <span className="ml-1 text-destructive">{"*"}</span>
              </label>
              <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                <SelectTrigger id="petition-select" className="w-full">
                  <SelectValue placeholder={adminActionType === "INITIAL" ? "최초 입장문을 작성할 청원을 선택하세요" : "추가 답변을 작성할 청원을 선택하세요"} />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {filteredPetitions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {adminActionType === "INITIAL" ? "최초 작성 가능한 청원이 없습니다." : "추가 작성 가능한 청원이 없습니다."}
                    </SelectItem>
                  ) : (
                    filteredPetitions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{p.title}</span>
                          <Badge variant="outline" className="shrink-0 text-[10px] h-4 px-1">
                            {adminActionType === "INITIAL" ? "최초" : "추가"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {!isAdditionalStatement ? (
              <fieldset className="flex flex-col gap-2.5">
                <legend className="text-sm font-medium text-foreground">
                  {"답변 상태 및 결과"}
                  <span className="ml-1 text-destructive">{"*"}</span>
                </legend>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setResultStatus("COMPLETED")}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      resultStatus === "COMPLETED"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    )}
                  >
                    {"완료 (승인/해결)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultStatus("REJECTED")}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      resultStatus === "REJECTED"
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    )}
                  >
                    {"반려 (불가/거부)"}
                  </button>
                </div>
              </fieldset>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">{"추가 입장문(2차 답변) 작성 안내"}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-blue-700/80">
                  {"이 청원은 이미 1차 답변이 등록되었습니다. 추가적인 설명이나 진행 상황을 전달하는 추가 입장문을 작성합니다. (결과 상태는 수정되지 않습니다)"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Category (Student Only) */}
        {!isAdmin && (
          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-sm font-medium text-foreground">
              {"카테고리"}
              <span className="ml-1 text-destructive">{"*"}</span>
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    category === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Council (Student Only) */}
        {!isAdmin && (
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="council-select"
              className="text-sm font-medium text-foreground"
            >
              {"담당 학생회"}
              <span className="ml-1 text-destructive">{"*"}</span>
            </label>
            <div className="flex flex-col gap-2">
              <Popover open={isCouncilOpen} onOpenChange={setIsCouncilOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCouncilOpen}
                    className="w-full md:w-72 justify-between font-normal"
                  >
                    {council
                      ? councils.find((c) => c.id === council)?.name || "학생회 선택"
                      : "학생회를 선택하세요"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" className="w-full md:w-72 p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="학생회 이름으로 검색..."
                      value={councilKeyword}
                      onValueChange={setCouncilKeyword}
                    />
                    <CommandList>
                      {isCouncilLoading && <div className="p-4 text-sm text-center text-muted-foreground">{"로딩 중..."}</div>}
                      {!isCouncilLoading && councils.length === 0 && <CommandEmpty>{"검색 결과가 없습니다."}</CommandEmpty>}
                      <CommandGroup>
                        {councils.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.id}
                            onSelect={() => {
                              setCouncil(c.id)
                              setIsCouncilOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                council === c.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Title (Student Only) */}
        {!isAdmin && (
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="petition-title"
              className="text-sm font-medium text-foreground"
            >
              {"제목"}
              <span className="ml-1 text-destructive">{"*"}</span>
            </label>
            <Input
              id="petition-title"
              type="text"
              placeholder="청원 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="petition-content"
            className="text-sm font-medium text-foreground"
          >
            {"내용"}
            <span className="ml-1 text-destructive">{"*"}</span>
          </label>
          <Textarea
            id="petition-content"
            placeholder={isAdmin ? "청원에 대한 학생회의 공식 입장을 구체적으로 작성해 주세요" : "문제 상황과 개선이 필요한 이유를 구체적으로 작성해 주세요"}
            rows={10}
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                setContent(e.target.value)
              }
            }}
            className="resize-none"
          />
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs tabular-nums",
                contentLength > MAX_CONTENT_LENGTH * 0.9
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {contentLength}
              {" / "}
              {MAX_CONTENT_LENGTH}
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <ImageUploader
          images={images}
          onChange={setImages}
          maxImages={3}
        />

        {/* Vote period (Student Only) */}
        {!isAdmin && (
          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-sm font-medium text-foreground">
              {"투표 기간"}
              <span className="ml-1 text-destructive">{"*"}</span>
            </legend>
            <div className="flex items-center gap-2">
              {votePeriods.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => setVotePeriod(period.value)}
                  className={cn(
                    "rounded-md border px-5 py-2 text-sm font-medium transition-colors",
                    votePeriod === period.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {"취소"}
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {"등록 중..."}
            </>
          ) : (
            "등록하기"
          )}
        </Button>
      </div>
    </div>
  )
}
