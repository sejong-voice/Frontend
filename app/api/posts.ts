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

export const postService = {
  getPosts: async (params: GetPostsParams) => {
    return api.get<PaginatedResponse<Petition>>("/api/v1/posts", { params });
  },

  getPost: async (id: string) => {
    return api.get<Petition>(`/api/v1/posts/${id}`);
  },
};
