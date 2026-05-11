"use client";

import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ConnectedHeader as SiteHeader } from "@/components/layout/connected-header";
import { FilterBar } from "@/components/petition/filter-bar";
import { MyPetitionList } from "@/components/petition/my-petition-list";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import type { Petition } from "@/components/petition/petition-list";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

import { postService } from "@/app/api/posts";
import { councilService, Council } from "@/app/api/councils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function MyPetitionsContent() {
  const { loading, user, isAdmin, quit } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeStatus, setActiveStatus] = useState(
    searchParams.get("status") || "ALL",
  );
  const [activeCouncilId, setActiveCouncilId] = useState(
    searchParams.get("councilId") || "ALL",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || "",
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "0", 10),
  );

  const [councils, setCouncils] = useState<Council[]>([]);
  const [councilKeyword, setCouncilKeyword] = useState("");
  const [data, setData] = useState<{
    content: Petition[];
    totalPages: number;
    totalElements: number;
    number: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isQuitting, setIsQuitting] = useState(false);

  // 뒤로가기 버튼 등으로 URL 파라미터가 변경되었을 때 로컬 상태 동기화
  useEffect(() => {
    setActiveStatus(searchParams.get("status") || "ALL");
    setActiveCouncilId(searchParams.get("councilId") || "ALL");
    setSearchQuery(searchParams.get("query") || "");
    setPage(parseInt(searchParams.get("page") || "0", 10));
  }, [searchParams]);

  // 로컬 상태와 URL 파라미터를 동시에 업데이트하여 페이지가 유지되도록 함
  const updateStateAndUrl = useCallback(
    (updates: {
      status?: string;
      councilId?: string;
      query?: string;
      page?: number;
    }) => {
      if (updates.status !== undefined) setActiveStatus(updates.status);
      if (updates.councilId !== undefined)
        setActiveCouncilId(updates.councilId);
      if (updates.query !== undefined) setSearchQuery(updates.query);
      if (updates.page !== undefined) setPage(updates.page);

      const params = new URLSearchParams(window.location.search);
      if (updates.status !== undefined) {
        if (updates.status === "ALL") params.delete("status");
        else params.set("status", updates.status);
      }
      if (updates.councilId !== undefined) {
        if (updates.councilId === "ALL") params.delete("councilId");
        else params.set("councilId", updates.councilId);
      }
      if (updates.query !== undefined) {
        if (!updates.query) params.delete("query");
        else params.set("query", updates.query);
      }
      if (updates.page !== undefined) {
        if (updates.page === 0) params.delete("page");
        else params.set("page", updates.page.toString());
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      const finalUrl = newUrl.endsWith("?") ? newUrl.slice(0, -1) : newUrl;
      window.history.replaceState(
        { ...window.history.state, as: finalUrl, url: finalUrl },
        "",
        finalUrl,
      );
    },
    [],
  );

  const fetchMyPetitions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await postService.getPosts({
        page,
        size: 10,
        keyword: searchQuery || undefined,
        status: activeStatus === "ALL" ? undefined : activeStatus,
        councilId: activeCouncilId === "ALL" ? undefined : activeCouncilId,
        mine: true,
        sort: "createdAt,DESC",
      });
      setData(res.data);
    } catch (error) {
      console.error("내 청원 로드 실패:", error);
      toast.error("내 청원 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, activeStatus, activeCouncilId]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      if (isAdmin) {
        router.replace("/admin/petitions");
        return;
      }

      let active = true;
      const timer = setTimeout(async () => {
        try {
          const res = await councilService.getCouncils(councilKeyword);
          if (active) setCouncils(res.data);
        } catch (error) {
          console.error("학생회 목록 로드 실패:", error);
        }
      }, 300);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [loading, user, router, councilKeyword, isAdmin]);

  useEffect(() => {
    if (user) {
      const delay = setTimeout(() => {
        fetchMyPetitions();
      }, 200);
      return () => clearTimeout(delay);
    }
  }, [fetchMyPetitions, user]);

  const stats = useMemo(() => {
    const total = data?.totalElements || 0;
    return [{ label: "전체 내 청원", count: total }];
  }, [data]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  async function handleDelete(id: string) {
    if (confirm("정말 이 청원을 삭제하시겠습니까?")) {
      try {
        await postService.deletePost(id);
        toast.success("청원이 성공적으로 삭제되었습니다.");
        fetchMyPetitions();
      } catch (error: any) {
        console.error("삭제 실패:", error);
        toast.error(
          error.response?.data?.message ||
            "삭제 권한이 없거나 이미 투표가 진행되어 삭제할 수 없습니다.",
        );
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < (data?.totalPages || 0)) {
      updateStateAndUrl({ page: newPage });
    }
  };

  const handleQuit = async () => {
    setIsQuitting(true);
    try {
      await quit();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "회원 탈퇴 요청 중 오류가 발생했습니다.");
      setIsQuitting(false);
      setShowQuitConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:flex-1">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {"내 청원"}
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {"내가 작성한 청원의 현황을 확인하고 관리할 수 있습니다."}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex h-[50px] items-center gap-2 rounded-md border border-border bg-card px-4"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {stat.count}
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        {"건"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Button asChild className="h-[50px] shrink-0">
              <Link href="/petition/new">
                <Plus className="mr-1.5 h-4 w-4" />
                {"청원 작성"}
              </Link>
            </Button>
          </div>

      <FilterBar
        activeStatus={activeStatus}
        onStatusChange={(s) => updateStateAndUrl({ status: s, page: 0 })}
        activeCouncilId={activeCouncilId}
        onCouncilChange={(id) => updateStateAndUrl({ councilId: id, page: 0 })}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateStateAndUrl({ query: q, page: 0 })}
        councils={councils}
        councilKeyword={councilKeyword}
        onCouncilKeywordChange={setCouncilKeyword}
        hideCouncilFilter={isAdmin}
        hideStatusFilter={isAdmin}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <MyPetitionList
            petitions={data?.content || []}
            onDelete={handleDelete as any}
            isAdmin={isAdmin}
          />

          {data && data.totalPages > 1 && (
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

                {[...Array(data.totalPages)].map((_, i) => (
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
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    className={
                      page === data.totalPages - 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* 회원 탈퇴 버튼 */}
      <div className="mt-12 flex justify-center border-t border-border pt-8 pb-4">
        <Button 
          variant="ghost" 
          onClick={() => setShowQuitConfirm(true)}
          className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-4"
        >
          회원 탈퇴 신청
        </Button>
      </div>

      <AlertDialog open={showQuitConfirm} onOpenChange={setShowQuitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">정말 탈퇴하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              탈퇴 신청 시 즉시 <strong>탈퇴 예정 상태</strong>로 변경되며,<br/>
              모든 서비스 이용 및 로그인이 차단됩니다.<br/><br/>
              계속 진행하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isQuitting}>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleQuit();
              }}
              disabled={isQuitting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isQuitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "탈퇴 신청하기"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function MyPetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <MyPetitionsContent />
        </Suspense>
      </main>
    </div>
  );
}
