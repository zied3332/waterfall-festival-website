import { api } from "./api.service";

import type {
  CreateGalleryImageInput,
  GalleryImage,
  GalleryStatus,
  UpdateGalleryImageInput,
} from "../types/gallery";

export type UploadGalleryImagesInput = {
  files: File[];
  title: string;
  description?: string;
  altText?: string;
  status: GalleryStatus;
  isFeatured: boolean;
  sortOrder: number;
  eventId?: number;
};

export type UploadGalleryImagesResponse = {
  success: boolean;
  count: number;
  images: GalleryImage[];
};

export function getGallery() {
  return api.get<GalleryImage[]>("/gallery");
}

export function getAdminGallery() {
  return api.get<GalleryImage[]>("/admin/gallery");
}

export function getGalleryImage(id: number) {
  return api.get<GalleryImage>(
    `/admin/gallery/${id}`,
  );
}

export function createGalleryImage(
  data: CreateGalleryImageInput,
) {
  return api.post<GalleryImage>(
    "/admin/gallery",
    data,
  );
}

export function uploadGalleryImages(
  data: UploadGalleryImagesInput,
) {
  const formData = new FormData();

  data.files.forEach((file) => {
    formData.append("images", file);
  });

  formData.append("title", data.title);
  formData.append(
    "description",
    data.description ?? "",
  );
  formData.append("altText", data.altText ?? "");
  formData.append("status", data.status);
  formData.append(
    "isFeatured",
    String(data.isFeatured),
  );
  formData.append(
    "sortOrder",
    String(data.sortOrder),
  );

  if (data.eventId !== undefined) {
    formData.append(
      "eventId",
      String(data.eventId),
    );
  }

  return api.post<UploadGalleryImagesResponse>(
    "/admin/gallery/upload",
    formData,
  );
}

export function updateGalleryImage(
  id: number,
  data: UpdateGalleryImageInput,
) {
  return api.patch<GalleryImage>(
    `/admin/gallery/${id}`,
    data,
  );
}

export function deleteGalleryImage(id: number) {
  return api.delete<void>(
    `/admin/gallery/${id}`,
  );
}