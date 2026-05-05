"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
import type { PetitionStatus } from "@/components/petition/petition-detail-header";
import { postService } from "@/app/api/posts";
import { toast } from "sonner";
import { ImageUploader } from "./image-uploader";

interface PetitionActionsProps {
  petitionId: string;
  status: PetitionStatus;
  isAuthor: boolean;
  canManageAsAdmin: boolean;
  totalVotes: number;
}

export function PetitionActions({
  petitionId,
  status,
  isAuthor,
  canManageAsAdmin,
  totalVotes,
}: PetitionActionsProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [statusToSubmit, setStatusToSubmit] = useState<
    "COMPLETED" | "REJECTED"
  >("COMPLETED");
  const [images, setImages] = useState<{ imageId: string; imageUrl: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!responseText.trim()) return;

    setIsSubmitting(true);
    try {
      await postService.submitPostResult(petitionId, {
        finalStatus: statusToSubmit,
        content: responseText,
        imageIds: images.map((img) => img.imageId),
      });
      toast.success(
        statusToSubmit === "COMPLETED"
          ? "완료 처리가 완료되었습니다."
          : "반려 처리가 완료되었습니다.",
      );
      window.location.reload();
    } catch (error: any) {
      console.error("작업 실패:", error);
      toast.error(error.response?.data?.message || "작업 처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDelete = isAuthor;
  const showAdminActions = canManageAsAdmin && status === "APPROVED";

  const handleDelete = async () => {
    if (status !== "VOTING") {
      toast.error("투표 중인 청원만 삭제할 수 있습니다.");
      return;
    }

    if (!window.confirm("청원을 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await postService.deletePost(petitionId);
      toast.success("청원이 삭제되었습니다.");
      window.location.href = "/my-petitions";
    } catch (error: any) {
      console.error("삭제 실패:", error);
      toast.error(error.response?.data?.message || "삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canDelete && !showAdminActions) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Author Actions */}
      {canDelete && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {"청원 삭제"}
          </Button>
        </div>
      )}
      {/* Admin actions */}
      {showAdminActions && (
        <section
          className="flex flex-col gap-4 rounded-lg border-2 border-primary/15 bg-accent/30 px-6 py-5"
          aria-label="학생회 관리 영역"
        >
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-foreground">
              {"학생회 관리자 처리"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              className={cn(
                "gap-1.5",
                statusToSubmit === "COMPLETED" && showResponseForm
                  ? "ring-2 ring-primary ring-offset-2"
                  : "",
              )}
              onClick={() => {
                setStatusToSubmit("COMPLETED");
                setShowResponseForm(true);
              }}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {"완료 (승인/해결)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5 bg-transparent text-secondary-foreground hover:bg-secondary-foreground hover:text-background",
                statusToSubmit === "REJECTED" && showResponseForm
                  ? "ring-2 ring-secondary-foreground ring-offset-2 bg-secondary-foreground text-background"
                  : "",
              )}
              onClick={() => {
                setStatusToSubmit("REJECTED");
                setShowResponseForm(true);
              }}
            >
              <XCircle className="h-3.5 w-3.5" />
              {"반려 (불가/거부)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-transparent"
              onClick={() => {
                setShowResponseForm(!showResponseForm);
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              {showResponseForm ? "입장문 작성 취소" : "공식 입장문 작성"}
            </Button>
          </div>

          {/* Inline response form */}
          {showResponseForm && (
            <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">
                {statusToSubmit === "COMPLETED"
                  ? "완료 처리 - 공식 입장문 작성"
                  : "반려 처리 - 반려 사유 작성"}
              </p>
              <Textarea
                placeholder="학생회 공식 입장을 입력하세요..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[120px] resize-none text-sm"
              />
              <div className="py-2">
                <ImageUploader 
                  images={images} 
                  onChange={setImages} 
                  maxImages={3} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {responseText.length}
                  {" / 2000자"}
                </span>
                <Button
                  size="sm"
                  disabled={!responseText.trim() || isSubmitting}
                  className="gap-1.5"
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {"등록"}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
