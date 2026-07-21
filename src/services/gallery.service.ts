import { api } from "./api.service";
import type {
  CreateGalleryImageInput,
  GalleryImage,
  UpdateGalleryImageInput,
} from "../types/gallery";

export function getGallery() {
  return api.get<GalleryImage[]>("/gallery");
}

export function getAdminGallery() {
  return api.get<GalleryImage[]>("/admin/gallery");
}

export function getGalleryImage(id: number) {
  return api.get<GalleryImage>(`/admin/gallery/${id}`);
}

export function createGalleryImage(
  data: CreateGalleryImageInput,
) {
  return api.post<GalleryImage>("/admin/gallery", data);
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
  return api.delete<void>(`/admin/gallery/${id}`);
}