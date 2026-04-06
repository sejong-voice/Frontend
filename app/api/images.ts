import { api } from "./axios";

export interface ImageUploadResponse {
  imageId: string;
  imageUrl: string;
}

export const imageService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ImageUploadResponse>("/api/v1/images", formData);
  },
};
