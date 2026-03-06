"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { ConnectedHeader } from "@/components/layout/connected-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Loader2,
  Shield,
  Users,
  AlertTriangle,
  Search,
  UserCog,
  FileText,
  MessageSquare,
  Ban,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"

type UserRole = "STUDENT" | "ADMIN" | "SUPER"
type UserStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN"
type TabType = "users" | "moderation"

interface User {
  studentNo: string
  name: string
  department: string
  role: UserRole
  status: UserStatus
}

interface ReportedItem {
  id: number
  type: "post" | "comment"
  title?: string
  content: string
  author: string
  reportCount: number
  createdAt: string
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: "학생",
  ADMIN: "운영진",
  SUPER: "관리자",
}

const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "활성",
  SUSPENDED: "정지",
  WITHDRAWN: "탈퇴",
}

const roleStyles: Record<UserRole, string> = {
  STUDENT: "border-border bg-secondary text-muted-foreground",
  ADMIN: "border-blue-200 bg-blue-50 text-blue-700",
  SUPER: "border-purple-200 bg-purple-50 text-purple-700",
}

const statusStyles: Record<UserStatus, string> = {
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  SUSPENDED: "border-red-200 bg-red-50 text-red-700",
  WITHDRAWN: "border-border bg-secondary text-muted-foreground",
}

export default function AdminPage() {
  const { loading, user, isSuper } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("users")
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<ReportedItem[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users", {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingData(false)
      }
    }

    if (user && isSuper) {
      fetchUsers()
    }
  }, [user, isSuper])

  // Fetch reports
  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/admin/reports", {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setReports(data)
        }
      } catch {
        // Handle error silently
      }
    }

    if (user && isSuper && activeTab === "moderation") {
      fetchReports()
    }
  }, [user, isSuper, activeTab])

  // Stats
  const stats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.status === "ACTIVE").length
    const reportedItems = reports.length
    return { totalUsers, activeUsers, reportedItems }
  }, [users, reports])

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.studentNo.includes(query) ||
        u.name.toLowerCase().includes(query) ||
        u.department.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (!isSuper) {
        router.replace("/")
      }
    }
  }, [loading, user, isSuper, router])

  async function handleStatusChange(studentNo: string, newStatus: UserStatus) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/user/${studentNo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.studentNo === studentNo ? { ...u, status: newStatus } : u
          )
        )
        if (selectedUser?.studentNo === studentNo) {
          setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null))
        }
        alert(`상태가 ${statusLabels[newStatus]}(으)로 변경되었습니다.`)
      }
    } catch {
      alert("상태 변경에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRoleChange(studentNo: string, newRole: UserRole) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/user/${studentNo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.studentNo === studentNo ? { ...u, role: newRole } : u
          )
        )
        if (selectedUser?.studentNo === studentNo) {
          setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null))
        }
        alert(`권한이 ${roleLabels[newRole]}(으)로 변경되었습니다.`)
      }
    } catch {
      alert("권한 변경에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRestore(studentNo: string) {
    if (!confirm("이 사용자를 조기 복구하시겠습니까?")) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/user/${studentNo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ restore: true }),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.studentNo === studentNo ? { ...u, status: "ACTIVE" } : u
          )
        )
        if (selectedUser?.studentNo === studentNo) {
          setSelectedUser((prev) => (prev ? { ...prev, status: "ACTIVE" } : null))
        }
        alert("사용자가 조기 복구되었습니다.")
      }
    } catch {
      alert("조기 복구에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSanction(type: "post" | "comment", id: number) {
    if (!confirm(`이 ${type === "post" ? "게시글" : "댓글"}을 제재하시겠습니까?`)) return

    setIsSubmitting(true)
    try {
      const endpoint =
        type === "post"
          ? `/api/admin/moderations/posts/${id}`
          : `/api/admin/moderations/comments/${id}`

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: "관리자 제재" }),
      })

      if (res.ok) {
        setReports((prev) => prev.filter((r) => !(r.id === id && r.type === type)))
        alert("제재가 완료되었습니다.")
      }
    } catch {
      alert("제재에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !user || !isSuper) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // User detail view
  if (selectedUser) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ConnectedHeader />

        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            {/* Back button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {"목록으로 돌아가기"}
            </button>

            {/* User info card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={cn("text-xs font-medium", roleStyles[selectedUser.role])}>
                      {roleLabels[selectedUser.role]}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs font-medium", statusStyles[selectedUser.status])}>
                      {statusLabels[selectedUser.status]}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedUser.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedUser.studentNo}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <UserCog className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">{"학과"}</span>
                  <span className="text-sm font-medium text-foreground">{selectedUser.department}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">{"학번"}</span>
                  <span className="text-sm font-medium text-foreground">{selectedUser.studentNo}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {/* Status change */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{"상태 변경"}</p>
                    <p className="text-sm text-muted-foreground">{"사용자의 계정 상태를 변경합니다."}</p>
                  </div>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) => handleStatusChange(selectedUser.studentNo, value as UserStatus)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">{"활성"}</SelectItem>
                      <SelectItem value="SUSPENDED">{"정지"}</SelectItem>
                      <SelectItem value="WITHDRAWN">{"탈퇴"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role change */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{"권한 변경"}</p>
                    <p className="text-sm text-muted-foreground">{"사용자의 권한을 변경합니다."}</p>
                  </div>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => handleRoleChange(selectedUser.studentNo, value as UserRole)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">{"학생"}</SelectItem>
                      <SelectItem value="ADMIN">{"운영진"}</SelectItem>
                      <SelectItem value="SUPER">{"관리자"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Early restore - only for SUSPENDED */}
                {selectedUser.status === "SUSPENDED" && (
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">{"조기 복구"}</p>
                      <p className="text-sm text-muted-foreground">{"정지된 계정을 즉시 활성화합니다."}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleRestore(selectedUser.studentNo)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      {"복구"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Main list view
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ConnectedHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Shield className="h-6 w-6" />
              {"시스템 관리"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {"사용자 관리 및 콘텐츠 모더레이션을 수행할 수 있습니다."}
            </p>
          </div>

          {/* Quick stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">{"전체 사용자"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                  <p className="text-sm text-muted-foreground">{"활성 사용자"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.reportedItems}</p>
                  <p className="text-sm text-muted-foreground">{"신고된 콘텐츠"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex items-center gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("users")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === "users"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCog className="h-4 w-4" />
              {"사용자 관리"}
            </button>
            <button
              onClick={() => setActiveTab("moderation")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === "moderation"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              {"모더레이션"}
              {reports.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {reports.length}
                </span>
              )}
            </button>
          </div>

          {/* Users tab */}
          {activeTab === "users" && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Search */}
              <div className="border-b border-border p-4">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="학번, 이름, 학과 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {"사용자를 찾을 수 없습니다."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.studentNo}
                      onClick={() => setSelectedUser(u)}
                      className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UserCog className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{u.name}</span>
                          <Badge variant="outline" className={cn("text-xs", roleStyles[u.role])}>
                            {roleLabels[u.role]}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", statusStyles[u.status])}>
                            {statusLabels[u.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {u.studentNo + " · " + u.department}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Moderation tab */}
          {activeTab === "moderation" && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-secondary/50 px-6 py-3">
                <h2 className="text-sm font-medium text-foreground">{"신고된 콘텐츠"}</h2>
              </div>

              {reports.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {"신고된 콘텐츠가 없습니다."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {reports.map((report) => (
                    <div
                      key={`${report.type}-${report.id}`}
                      className="flex items-start gap-4 px-6 py-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                        {report.type === "post" ? (
                          <FileText className="h-5 w-5 text-red-600" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {report.type === "post" ? "게시글" : "댓글"}
                          </Badge>
                          <span className="text-xs text-red-600 font-medium">
                            {"신고 " + report.reportCount + "건"}
                          </span>
                        </div>
                        {report.title && (
                          <p className="font-medium text-foreground truncate">{report.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground truncate">{report.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {"작성자: " + report.author + " · " + report.createdAt}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleSanction(report.type, report.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Ban className="h-3.5 w-3.5" />
                        )}
                        {"제재"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
