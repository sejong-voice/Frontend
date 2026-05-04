"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  commentService,
  type CommentPageResponse,
  type CommentReportReason,
  type CommentResponse,
  type ReplyResponse,
} from "@/app/api/comments";
import {
  postService,
  type PostReportReason,
  type VoteChoice,
  type VoteSummaryResponse,
} from "@/app/api/posts";
import { useAuth } from "@/components/auth/auth-provider";
import { ConnectedHeader } from "@/components/layout/connected-header";
import { PetitionBody } from "@/components/petition/petition-body";
import {
  PetitionComments,
  type Comment,
  type ReplyData,
} from "@/components/petition/petition-comments";
import {
  PetitionDetailHeader,
  type PetitionStatus,
} from "@/components/petition/petition-detail-header";
import { PetitionOfficialResponse } from "@/components/petition/petition-official-response";
import { PetitionStatusBanner } from "@/components/petition/petition-status-banner";
import { PetitionVote } from "@/components/petition/petition-vote";
import { PetitionActions } from "@/components/petition/petition-actions";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface PetitionDetailResponse {
  id: string
  userId: string
  userStudentNo: string
  councilId: string
  councilName: string
  title: string
  content: string
  status: PetitionStatus
  categoryName?: string
  canVote?: boolean
  canCloseEarly?: boolean
  createdAt: string
  votingEndAt: string
  images?: { imageId: string; imageUrl: string }[]
  resultContent?: string
  resultImages?: { imageId: string; imageUrl: string }[]
  resultCreatedAt?: string
  resultUpdatedAt?: string
  statements?: {
    id: string
    sequence: number
    content: string
    createdAt: string
    images?: { imageId: string; imageUrl: string }[]
  }[]
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const ANONYMOUS_LABEL = "익명";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\s/g, "")
    .replace(/\.$/, "");
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function getAnonymousAuthorLabel(
  anonymousNumber: number | null,
  postAuthor: boolean,
) {
  if (postAuthor) {
    return "익명(글쓴이)";
  }

  if (typeof anonymousNumber === "number") {
    return `익명${anonymousNumber}`;
  }

  return "익명";
}

function getRootPlaceholderContent(status: CommentResponse["status"]) {
  if (status === "DELETED") {
    return "삭제된 댓글입니다.";
  }

  if (status === "BLINDED") {
    return "숨김 처리된 댓글입니다.";
  }

  return "";
}

function mapReply(reply: ReplyResponse): ReplyData {
  return {
    id: reply.id,
    author: getAnonymousAuthorLabel(reply.anonymousNumber, reply.postAuthor),
    content: reply.content,
    date: formatDate(reply.createdAt),
    canDelete: reply.canDelete,
    isPlaceholder: false,
  };
}

function mapComment(comment: CommentResponse): Comment | null {
  const activeReplies = (comment.replies || []).filter(
    (reply) => reply.status === "ACTIVE",
  );

  if (comment.status !== "ACTIVE" && activeReplies.length === 0) {
    return null;
  }

  return {
    id: comment.id,
    author: getAnonymousAuthorLabel(
      comment.anonymousNumber,
      comment.postAuthor,
    ),
    content:
      comment.status === "ACTIVE"
        ? comment.content
        : getRootPlaceholderContent(comment.status),
    date: formatDate(comment.createdAt),
    canDelete: comment.canDelete,
    replies: activeReplies.map(mapReply),
    isPlaceholder: comment.status !== "ACTIVE",
  };
}

function mapComments(comments: CommentResponse[]) {
  return comments
    .map(mapComment)
    .filter((comment): comment is Comment => comment !== null);
}

const COMMENT_PAGE_SIZE = 20;

export default function PetitionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, isAdmin } = useAuth();
  const [petition, setPetition] = useState<PetitionDetailResponse | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummaryResponse | null>(
    null,
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentTotalCount, setCommentTotalCount] = useState(0);
  const [commentPage, setCommentPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [canManageAsAdmin, setCanManageAsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const applyCommentPageResponse = useCallback(
    (pageData: CommentPageResponse, mode: "replace" | "append" = "replace") => {
      const mappedComments = mapComments(pageData.content);

      setComments((prev) =>
        mode === "append" ? [...prev, ...mappedComments] : mappedComments,
      );
      setCommentTotalCount(pageData.activeCommentCount);
      setCommentPage(pageData.page);
      setHasMoreComments(!pageData.last);
    },
    [],
  );

  const fetchComments = useCallback(async () => {
    const result = await commentService.getCommentsByPost(id, {
      page: 0,
      size: COMMENT_PAGE_SIZE,
      sort: "createdAt,asc",
    });
    applyCommentPageResponse(result.data, "replace");
  }, [applyCommentPageResponse, id]);

  const handleLoadMoreComments = useCallback(async () => {
    if (isLoadingMoreComments || !hasMoreComments) return;

    setIsLoadingMoreComments(true);
    try {
      const result = await commentService.getCommentsByPost(id, {
        page: commentPage + 1,
        size: COMMENT_PAGE_SIZE,
        sort: "createdAt,asc",
      });
      applyCommentPageResponse(result.data, "append");
    } catch (error) {
      console.error("댓글 더보기 로드 실패:", error);
      toast.error("댓글 목록을 더 불러오지 못했습니다.");
    } finally {
      setIsLoadingMoreComments(false);
    }
  }, [
    applyCommentPageResponse,
    commentPage,
    hasMoreComments,
    id,
    isLoadingMoreComments,
  ]);

  const fetchVoteSummary = useCallback(async () => {
    const result = await postService.getVoteSummary(id);
    setVoteSummary(result.data);
  }, [id]);

  const handleCreateComment = useCallback(
    async (content: string) => {
      try {
        await commentService.createComment({
          postId: id,
          rootCommentId: null,
          content,
        });
        toast.success("댓글이 등록되었습니다.");
        await fetchComments();
      } catch (error: any) {
        console.error("댓글 등록 실패:", error);
        toast.error(
          error.response?.data?.message || "댓글 등록에 실패했습니다.",
        );
      }
    },
    [fetchComments, id],
  );

  const handleCreateReply = useCallback(
    async (rootCommentId: string, content: string) => {
      try {
        await commentService.createComment({
          postId: id,
          rootCommentId,
          content,
        });
        toast.success("답글이 등록되었습니다.");
        await fetchComments();
      } catch (error: any) {
        console.error("답글 등록 실패:", error);
        toast.error(
          error.response?.data?.message || "답글 등록에 실패했습니다.",
        );
      }
    },
    [fetchComments, id],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      try {
        await commentService.deleteComment(commentId);
        toast.success("댓글이 삭제되었습니다.");
        await fetchComments();
      } catch (error: any) {
        console.error("댓글 삭제 실패:", error);
        toast.error(
          error.response?.data?.message || "댓글 삭제에 실패했습니다.",
        );
      }
    },
    [fetchComments],
  );

  const handleReportComment = useCallback(
    async (commentId: string, reason: CommentReportReason) => {
      try {
        await commentService.reportComment(commentId, { reason });
        toast.success("신고가 접수되었습니다.");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "신고 처리에 실패했습니다.",
        );
      }
    },
    [],
  );

  const handleReportPost = useCallback(
    async (reason: PostReportReason) => {
      try {
        await postService.reportPost(id, { reason });
        toast.success("신고가 접수되었습니다.");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "신고 처리에 실패했습니다.",
        );
      }
    },
    [id],
  );

  const handleVote = useCallback(
    async (choice: VoteChoice) => {
      try {
        await postService.castVote(id, { choice });
        toast.success(
          choice === "AGREE" ? "동의하셨습니다." : "비동의하셨습니다.",
        );
        await fetchVoteSummary();
      } catch (error: any) {
        console.error("투표 실패:", error);
        toast.error(
          error.response?.data?.message || "투표 처리에 실패했습니다.",
        );
      }
    },
    [fetchVoteSummary, id],
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchPetition() {
      setIsLoading(true);
      setError("");
      setVoteSummary(null);
      setComments([]);
      setCommentTotalCount(0);
      setCommentPage(0);
      setHasMoreComments(false);
      setIsLoadingMoreComments(false);
      setCanManageAsAdmin(false);

      try {
        const [
          postResult,
          voteSummaryResult,
          commentsResult,
          assignedPetitionsResult,
        ] = await Promise.allSettled([
          postService.getPost(id),
          postService.getVoteSummary(id),
          commentService.getCommentsByPost(id, {
            page: 0,
            size: COMMENT_PAGE_SIZE,
            sort: "createdAt,asc",
          }),
          isAdmin
            ? postService.getPosts({ assignedToMe: true, size: 1000 })
            : Promise.resolve(null),
        ]);
        if (!isMounted) return;

        if (postResult.status === "rejected") {
          throw postResult.reason;
        }

        setPetition(postResult.value.data as PetitionDetailResponse);

        if (voteSummaryResult.status === "fulfilled") {
          setVoteSummary(voteSummaryResult.value.data);
        } else {
          console.error("투표 요약 조회 실패:", voteSummaryResult.reason);
        }

        if (commentsResult.status === "fulfilled") {
          applyCommentPageResponse(commentsResult.value.data, "replace");
        } else {
          console.error("댓글 목록 조회 실패:", commentsResult.reason);
        }

        if (isAdmin) {
          if (assignedPetitionsResult.status === "fulfilled") {
            setCanManageAsAdmin(
              assignedPetitionsResult.value?.data.content.some(
                (post) => post.id === id,
              ) ?? false,
            );
          } else {
            console.error(
              "할당 청원 조회 실패:",
              assignedPetitionsResult.reason,
            );
          }
        }
      } catch (fetchError) {
        console.error("게시글 상세 조회 실패:", fetchError);

        if (!isMounted) return;
        setPetition(null);
        setError("게시글 정보를 불러오지 못했습니다.");
        toast.error("게시글 정보를 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPetition();

    return () => {
      isMounted = false;
    };
  }, [applyCommentPageResponse, id, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="min-h-screen bg-background">
        <ConnectedHeader />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {error || "게시글을 찾을 수 없습니다."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const canReportPost = !!user && petition.userId !== user.id;
  const isAuthor = !!user && petition.userId === user.id;
  const latestStatement = petition.statements?.reduce<
    NonNullable<PetitionDetailResponse["statements"]>[number] | undefined
  >((latest, statement) => {
    if (!latest) return statement;
    return statement.sequence > latest.sequence ? statement : latest;
  }, undefined);
  const officialResponseContent =
    latestStatement?.content ?? petition.resultContent ?? "";
  const officialResponseDisplayImages =
    latestStatement?.images ?? petition.resultImages;
  const shouldShowOfficialResponse =
    (petition.status === "COMPLETED" || petition.status === "REJECTED") &&
    !!officialResponseContent.trim();
  const officialResponseDateSource =
    latestStatement?.createdAt ||
    petition.resultCreatedAt ||
    petition.resultUpdatedAt ||
    "";
  const officialResponseDate = officialResponseDateSource
    ? `게시 ${formatDateTime(officialResponseDateSource)}`
    : "-";

  return (
    <div className="min-h-screen bg-background">
      <ConnectedHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-col gap-6">
          <PetitionDetailHeader
            isAdmin={isAdmin}
            canCloseEarly={petition.canCloseEarly}
            id={petition.id}
            title={petition.title}
            status={petition.status}
            category={petition.categoryName || "미분류"}
            studentId={petition.userStudentNo}
            date={formatDate(petition.createdAt)}
            council={petition.councilName}
            showReportAction={canReportPost}
            onReport={handleReportPost}
          />

          <Separator />

          {petition.status !== "VOTING" && (
            <PetitionStatusBanner status={petition.status} />
          )}

          <PetitionBody content={petition.content} images={petition.images} />

          {voteSummary && (
            <div className="flex flex-col gap-4">
              <PetitionVote
                {...voteSummary}
                isActive={petition.status === "VOTING"}
                canVote={petition.canVote}
                votingEndAt={petition.votingEndAt}
                onVote={handleVote}
              />
            </div>
          )}

          <PetitionActions
            petitionId={id}
            status={petition.status}
            isAuthor={isAuthor}
            canManageAsAdmin={canManageAsAdmin}
            totalVotes={voteSummary?.totalCount || 0}
          />

          {shouldShowOfficialResponse && (
            <PetitionOfficialResponse
              content={officialResponseContent}
              respondent={petition.councilName || "담당 학생회"}
              date={officialResponseDate}
              images={officialResponseDisplayImages}
            />
          )}

          <Separator />

          <PetitionComments
            comments={comments}
            totalCount={commentTotalCount}
            hasMore={hasMoreComments}
            isLoadingMore={isLoadingMoreComments}
            onLoadMore={handleLoadMoreComments}
            onCreateComment={handleCreateComment}
            onCreateReply={handleCreateReply}
            onDeleteComment={handleDeleteComment}
            onReportComment={handleReportComment}
          />
        </div>
      </main>
    </div>
  );
}
