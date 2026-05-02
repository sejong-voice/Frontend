import { api } from "./axios";

export interface Category {
  id: string;
  name: string;
}

export const categoryService = {
  getCategories: async () => {
    return api.get<Category[]>("/api/v1/categories");
  },
};
