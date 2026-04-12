import { api } from "./axios";

export type CommentStatus = "ACTIVE" | "DELETED" | "BLINDED";

export interface ReplyResponse {
  id: string;
  anonymousNumber: number | null;
  postAuthor: boolean;
  content: string;
  status: CommentStatus;
  canDelete: boolean;
  createdAt: string;
}

export interface CommentResponse {
  id: string;
  anonymousNumber: number | null;
  content: string;
  status: CommentStatus;
  postAuthor: boolean;
  canDelete: boolean;
  replies?: ReplyResponse[];
  createdAt: string;
  // Temporary compatibility fields while detail page rendering is migrated.
  userName?: string;
  children?: ReplyResponse[];
}

export interface CommentPageResponse {
  content: CommentResponse[];
  page: number;
  size: number;
  numberOfElements: number;
  displayableRootCommentCount: number;
  activeCommentCount: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface GetCommentsParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateCommentData {
  postId: string;
  rootCommentId?: string | null;
  // Temporary compatibility field while create handlers are migrated.
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
  getCommentsByPost: async (postId: string, params?: GetCommentsParams) => {
    return api.get<CommentPageResponse>(`/api/v1/comments/post/${postId}`, {
      params,
    });
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
