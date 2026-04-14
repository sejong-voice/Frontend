import { api } from "./axios";
import { Petition } from "@/components/petition/petition-list";

export interface GetPostsParams {
  page?: number;
  size?: number;
  keyword?: string;
  sort?: string;
  status?: string;
  councilId?: string;
  mine?: boolean;
  assignedToMe?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export type PostVotingDuration = "ONE_WEEK" | "TWO_WEEK" | "FOUR_WEEK";

export interface CreatePostData {
  title: string;
  content: string;
  councilId: string;
  postVotingDuration: PostVotingDuration;
  imageIds: string[];
}



export interface VoteSummaryResponse {
  agreeCount: number;
  disagreeCount: number;
  totalCount: number;
}

export type VoteChoice = "AGREE" | "DISAGREE";

export interface VoteRequest {
  choice: VoteChoice;
}

export type PostReportReason =
  | "SPAM"
  | "ABUSE"
  | "HATE"
  | "PRIVACY"
  | "DUPLICATE"
  | "OTHER";

export interface PostReportData {
  reason: PostReportReason;
  description?: string;
}

export interface PostStatementRequest {
  finalStatus?: "COMPLETED" | "REJECTED";
  content: string;
  imageIds: string[];
}

export const postService = {
  getPosts: async (params: GetPostsParams) => {
    return api.get<PaginatedResponse<Petition>>("/api/v1/posts", { params });
  },

  getPost: async (id: string) => {
    return api.get<Petition>(`/api/v1/posts/${id}`);
  },

  getVoteSummary: async (id: string) => {
    return api.get<VoteSummaryResponse>(`/api/v1/posts/${id}/votes/summary`);
  },

  castVote: async (id: string, data: VoteRequest) => {
    return api.put(`/api/v1/posts/${id}/votes`, data);
  },

  reportPost: async (id: string, data: PostReportData) => {
    return api.post<string>(`/api/v1/reports/posts/${id}`, data);
  },

  createPost: async (data: CreatePostData) => {
    return api.post("/api/v1/posts", data);
  },

  deletePost: async (id: string) => {
    return api.delete(`/api/v1/posts/${id}`);
  },

  submitPostStatement: async (id: string, data: PostStatementRequest) => {
    return api.post(`/api/v1/posts/${id}/statements`, data);
  },
};
