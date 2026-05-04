"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectedHeader } from "@/components/layout/connected-header";
import { useAuth } from "@/components/auth/auth-provider";
import { postService, VoteStatisticsResponse, AgreeVoterResponse } from "@/app/api/posts";
import { Loader2, Download, BarChart3, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Petition } from "@/components/petition/petition-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusToKorean: Record<string, string> = {
  VOTING: "투표중",
  APPROVED: "검토중",
  PENDING: "부결",
  COMPLETED: "처리완료",
  REJECTED: "반려",
  DELETED: "삭제됨",
};

export default function AdminStatisticsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assignedPetitions, setAssignedPetitions] = useState<Petition[]>([]);
  const [selectedPetitionId, setSelectedPetitionId] = useState<string>("");

  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<VoteStatisticsResponse | null>(null);
  const [voters, setVoters] = useState<AgreeVoterResponse[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("접근 권한이 없습니다.");
      router.replace("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    async function fetchPetitions() {
      if (!isAdmin) return;
      try {
        setLoading(true);
        // Fetch all assigned petitions
        const res = await postService.getPosts({ assignedToMe: true, size: 1000 });

        // Filter out non-allowed statuses
        const allowedStatuses = ["APPROVED", "COMPLETED", "REJECTED"];
        const filteredPetitions = res.data.content.filter((p: Petition) =>
          allowedStatuses.includes(p.status)
        );

        setAssignedPetitions(filteredPetitions);
        if (filteredPetitions.length > 0) {
          setSelectedPetitionId(filteredPetitions[0].id);
        }
      } catch (error) {
        console.error("청원 목록 로드 실패:", error);
        toast.error("청원 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && isAdmin) {
      fetchPetitions();
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    async function fetchStats() {
      if (!selectedPetitionId) return;
      try {
        setStatsLoading(true);
        const [statsRes, votersRes] = await Promise.all([
          postService.getVoteStatistics(selectedPetitionId),
          postService.getAgreeVoters(selectedPetitionId)
        ]);
        setStats(statsRes.data);
        setVoters(votersRes.data);
      } catch (error: any) {
        console.error("통계 조회 실패:", error);
        setStats(null);
        setVoters([]);
        toast.error("해당 청원의 통계 데이터를 불러오는데 실패했습니다.");
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [selectedPetitionId]);

  const handleExportCSV = () => {
    if (!voters || voters.length === 0) {
      toast.error("내보낼 데이터가 없습니다.");
      return;
    }

    const escapeCsvCell = (value: string) => {
      const normalized = String(value ?? "");
      const formulaSafe = /^[\s\t\r\n]*[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
      return `"${formulaSafe.replace(/"/g, '""')}"`;
    };

    const headers = ["학번", "학과", "투표일시"];
    const rows = voters.map(voter => [
      escapeCsvCell(voter.studentNo),
      escapeCsvCell(voter.department),
      escapeCsvCell(new Date(voter.votedAt).toLocaleString())
    ]);

    const csvContent = "\uFEFF" + [
      headers.map(escapeCsvCell).join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `청원_${selectedPetitionId}_찬성자명단.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              투표 통계 및 찬성자 명단 관리
            </h1>
            <p className="text-sm text-muted-foreground">
              학생회에 할당된 청원의 투표 통계와 찬성자 명단을 조회하고 엑셀로 다운로드할 수 있습니다.
            </p>
          </div>

          {/* Petition Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-end bg-card p-5 rounded-xl border border-border">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">조회할 청원 선택</label>
              <Select value={selectedPetitionId} onValueChange={setSelectedPetitionId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="청원을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {assignedPetitions.length === 0 ? (
                    <SelectItem value="none" disabled>통계를 조회할 수 있는 청원이 없습니다.</SelectItem>
                  ) : (
                    assignedPetitions.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium mr-2 text-primary">[{statusToKorean[p.status] || p.status}]</span>
                        {p.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {stats && voters.length > 0 && (
              <Button onClick={handleExportCSV} variant="outline" className="gap-2 whitespace-nowrap">
                <Download className="h-4 w-4" />
                명단 CSV (엑셀) 다운로드
              </Button>
            )}
          </div>

          {/* Loading State for Stats */}
          {statsLoading && (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty State */}
          {!statsLoading && !stats && selectedPetitionId && (
            <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground mb-4 opacity-20" />
              <p className="text-sm text-muted-foreground">선택된 청원의 통계 데이터를 찾을 수 없거나 불러오지 못했습니다.</p>
            </div>
          )}

          {/* Statistics Section */}
          {!statsLoading && stats && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">전체 투표 통계</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-4 text-center">
                  <span className="text-sm text-muted-foreground">총 투표 수</span>
                  <span className="text-2xl font-bold">{stats.totalCount}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-4 text-center">
                  <span className="text-sm text-muted-foreground">찬성 수</span>
                  <span className="text-2xl font-bold text-primary">{stats.agreeCount}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-4 text-center">
                  <span className="text-sm text-muted-foreground">반대 수</span>
                  <span className="text-2xl font-bold text-destructive">{stats.disagreeCount}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-4 text-center">
                  <span className="text-sm text-muted-foreground">찬성률</span>
                  <span className="text-2xl font-bold">{(stats.agreeRatio * 100).toFixed(1)}%</span>
                </div>
              </div>

              {stats.departmentDistributions && stats.departmentDistributions.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">학과별 참여 분포</h3>
                  <div className="overflow-x-auto border rounded-md">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-4 py-3">학과명</th>
                          <th className="px-4 py-3 text-right">총 투표</th>
                          <th className="px-4 py-3 text-right">찬성</th>
                          <th className="px-4 py-3 text-right">반대</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.departmentDistributions.map((dept, index) => (
                          <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30">
                            <td className="px-4 py-2.5 font-medium">{dept.department}</td>
                            <td className="px-4 py-2.5 text-right">{dept.totalCount}</td>
                            <td className="px-4 py-2.5 text-right text-primary">{dept.agreeCount}</td>
                            <td className="px-4 py-2.5 text-right text-destructive">{dept.disagreeCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Voter List Section */}
          {!statsLoading && stats && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">찬성자 명단 ({voters.length}명)</h2>
              </div>

              {voters.length > 0 ? (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-md relative">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary text-xs uppercase text-muted-foreground sticky top-0 z-10 shadow-sm border-b border-border">
                      <tr>
                        <th className="px-4 py-3">학번</th>
                        <th className="px-4 py-3">학과</th>
                        <th className="px-4 py-3 text-right">투표일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voters.map((voter, index) => (
                        <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{voter.studentNo}</td>
                          <td className="px-4 py-3">{voter.department}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {new Date(voter.votedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-md">
                  아직 찬성한 인원이 없습니다.
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
