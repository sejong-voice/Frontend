"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { ConnectedHeader } from "@/components/layout/connected-header";
import { PetitionList, Petition } from "@/components/petition/petition-list";
import { Loader2, ShieldCheck, Inbox, Plus } from "lucide-react";
import { postService } from "@/app/api/posts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const statuses = [
  { label: "전체", value: "ALL" },
  { label: "투표중", value: "VOTING" },
  { label: "검토중", value: "APPROVED" },
  { label: "부결", value: "PENDING" },
  { label: "처리완료", value: "COMPLETED" },
  { label: "반려", value: "REJECTED" },
];

const getStatusDescription = (status: string) => {
  switch (status) {
    case "VOTING":
      return "현재 투표가 진행 중인 청원 목록입니다.";
    case "APPROVED":
      return "투표가 종료되어 학생회의 검토 및 처리가 필요한 청원 목록입니다.";
    case "PENDING":
      return "투표 결과 부결된 청원 목록입니다.";
    case "COMPLETED":
      return "처리가 완료된 청원 목록입니다.";
    case "REJECTED":
      return "반려된 청원 목록입니다.";
    default:
      return "해당 학생회 계정에 할당된 청원 목록입니다.";
  }
};

function AdminPetitionsContent() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [petitions, setPetitions] = useState<{
    content: Petition[];
    totalPages: number;
    totalElements: number;
    number: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. URL 파라미터에서 초기 값을 가져오되, 로컬 State로 관리하여 즉각적인 리렌더링 유도
  const [activeStatus, setActiveStatus] = useState(
    searchParams.get("status") || "ALL",
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "0", 10),
  );

  // 2. 권한 체크
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/");
    }
  }, [authLoading, isAdmin, router]);

  // 3. 데이터 페칭 (activeStatus나 page가 바뀔 때마다 실행)
  useEffect(() => {
    const fetchAssignedPetitions = async () => {
      if (!isAdmin) return;
      try {
        setLoading(true);
        const response = await postService.getPosts({
          assignedToMe: true,
          status: activeStatus === "ALL" ? undefined : activeStatus,
          page: page,
          size: 10,
          sort: "createdAt,DESC",
        });
        setPetitions(response.data);
      } catch (error: any) {
        console.error("Failed to fetch assigned petitions:", error);
        toast.error("청원 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAdmin) {
      fetchAssignedPetitions();
    }
  }, [authLoading, isAdmin, activeStatus, page]);

  // 4. URL 업데이트 및 상태 변경 함수
  const handleFilterChange = (newStatus: string, newPage: number) => {
    // 로컬 상태 업데이트 (리렌더링 발생)
    setActiveStatus(newStatus);
    setPage(newPage);

    // URL 파라미터 동기화
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === "ALL") params.delete("status");
    else params.set("status", newStatus);

    if (newPage === 0) params.delete("page");
    else params.set("page", newPage.toString());

    // router.push를 사용하여 Next.js가 경로 변화를 인식하게 함
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleStatusChange = (status: string) => {
    handleFilterChange(status, 0); // 상태 바꿀 땐 페이지 0으로 리셋
  };

  const handlePageChange = (newPage: number) => {
    if (petitions && newPage >= 0 && newPage < petitions.totalPages) {
      handleFilterChange(activeStatus, newPage);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
        <Button asChild className="shrink-0">
          <Link href="/petition/new">
            <Plus className="mr-1.5 h-4 w-4" />
            {"입장문 작성"}
          </Link>
        </Button>
      </div>

      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{"청원 목록"}</h2>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="tablist"
            aria-label="상태 필터"
          >
            {statuses.map((status) => (
              <button
                key={status.value}
                role="tab"
                aria-selected={activeStatus === status.value}
                onClick={() => handleStatusChange(status.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  activeStatus === status.value
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {getStatusDescription(activeStatus)}
        </p>

        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : petitions && petitions.content.length > 0 ? (
          <>
            <PetitionList petitions={petitions.content} from="admin" />

            {petitions.totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page - 1);
                      }}
                      className={
                        page === 0
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(petitions.totalPages)].map((_, i) => {
                    if (
                      petitions.totalPages <= 7 ||
                      i === 0 ||
                      i === petitions.totalPages - 1 ||
                      (i >= page - 1 && i <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i);
                            }}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      (i === 1 && page > 2) ||
                      (i === petitions.totalPages - 2 &&
                        page < petitions.totalPages - 3)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page + 1);
                      }}
                      className={
                        page === petitions.totalPages - 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
            {"할당된 청원이 없습니다."}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminPetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <AdminPetitionsContent />
        </Suspense>
      </main>
    </div>
  );
}
