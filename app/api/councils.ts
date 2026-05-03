import { api } from "./axios";

export interface Council {
  id: string;
  name: string;
}

export const councilService = {
  getCouncils: async (keyword?: string, accessible?: boolean) => {
    return api.get<Council[]>("/api/v1/councils", {
      params: { keyword, accessible },
    });
  },
  earlyApprove: async (postId: string) => {
    return api.post(`/api/v1/posts/${postId}/close`);
  },
};
