import { api } from "./axios";

export interface CommentResponse {
  id: string;
  userId: string;
  userName: string;
  content: string;
  status: "ACTIVE" | "DELETED" | "BLINDED";
  children: CommentResponse[];
  createdAt: string;
}

export interface CreateCommentData {
  postId: string;
  parentId?: string | null;
  content: string;
}

export type CommentReportReason =
  | "SPAM"
  | "ABUSE"
  | "HATE"
  | "PRIVACY"
  | "OTHER";

export interface CommentReportData {
  reason: CommentReportReason;
}

export const commentService = {
  getCommentsByPost: async (postId: string) => {
    return api.get<CommentResponse[]>(`/api/v1/comments/post/${postId}`);
  },

  createComment: async (data: CreateCommentData) => {
    return api.post<string>("/api/v1/comments", data);
  },

  deleteComment: async (id: string) => {
    return api.delete(`/api/v1/comments/${id}`);
  },

  reportComment: async (commentId: string, data: CommentReportData) => {
    return api.post<string>(`/api/v1/reports/comments/${commentId}`, data);
  },
};
