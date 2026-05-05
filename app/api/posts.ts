import { api } from "./axios";
import { Petition } from "@/components/petition/petition-list";

export interface GetPostsParams {
  page?: number;
  size?: number;
  keyword?: string;
  sort?: string;
  status?: string;
  councilId?: string;
  categoryId?: string;
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
  categoryId: string;
  postVotingDuration: PostVotingDuration;
  imageIds: string[];
}

export interface UpdatePostData {
  title: string;
  content: string;
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

export interface PostStatementCreateData {
  finalStatus: "COMPLETED" | "REJECTED";
  content: string;
  imageIds: string[];
}

export interface DepartmentDistribution {
  department: string;
  agreeCount: number;
  disagreeCount: number;
  totalCount: number;
}

export interface VoteStatisticsResponse {
  agreeCount: number;
  disagreeCount: number;
  totalCount: number;
  agreeRatio: number;
  departmentDistributions: DepartmentDistribution[];
}

export interface AgreeVoterResponse {
  studentNo: string;
  department: string;
  votedAt: string;
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

  updatePost: async (id: string, data: UpdatePostData) => {
    return api.put(`/api/v1/posts/${id}`, data);
  },

  deletePost: async (id: string) => {
    return api.delete(`/api/v1/posts/${id}`);
  },

  submitPostResult: async (id: string, data: PostStatementCreateData) => {
    return api.post(`/api/v1/posts/${id}/statements`, data);
  },

  getVoteStatistics: async (id: string) => {
    return api.get<VoteStatisticsResponse>(`/api/v1/posts/${id}/votes/statistics`);
  },

  getAgreeVoters: async (id: string) => {
    return api.get<AgreeVoterResponse[]>(`/api/v1/posts/${id}/votes/agree-voters`);
  },
};
