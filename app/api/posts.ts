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

export interface CreatePostData {
  title: string;
  content: string;
  councilId?: string;
  postVotingDuration: "ONE_WEEK" | "TWO_WEEKS" | "FOUR_WEEKS";
}

export interface UpdatePostData {
  title: string;
  content: string;
}

export interface PostResultData {
  status: "COMPLETED" | "REJECTED";
  resultContent: string;
}

export const postService = {
  getPosts: async (params: GetPostsParams) => {
    return api.get<PaginatedResponse<Petition>>("/api/v1/posts", { params });
  },

  getPost: async (id: string) => {
    return api.get<Petition>(`/api/v1/posts/${id}`);
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

  submitPostResult: async (id: string, data: PostResultData) => {
    return api.post(`/api/v1/posts/${id}/result`, data);
  },
};
