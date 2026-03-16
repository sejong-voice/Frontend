import { api } from "./axios";

export interface Council {
  id: string;
  name: string;
}

export const councilService = {
  getCouncils: async () => {
    return api.get<Council[]>("/api/v1/councils");
  },
};
