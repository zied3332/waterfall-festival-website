import { api, getApiMediaUrl } from "./api.service";

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

  items: GalleryImage[];
};

export type UploadGalleryVideoInput = {
  file: File;

  title: string;

  description?: string;

  altText?: string;

  status: GalleryStatus;

  isFeatured: boolean;

  sortOrder: number;

  showOnHomepage: boolean;

  homepageSortOrder: number;

  eventId?: number;
};

function normalizeGalleryItem(item: GalleryImage): GalleryImage {
  return {
    ...item,
    imageUrl: getApiMediaUrl(item.imageUrl) ?? "",
    thumbnailUrl: getApiMediaUrl(item.thumbnailUrl),
  };
}

function normalizeGalleryItems(items: GalleryImage[]): GalleryImage[] {
  return items.map(normalizeGalleryItem);
}

export function getGallery(): Promise<
  GalleryImage[]
> {
  return api.get<GalleryImage[]>(
    "/gallery",
  ).then(normalizeGalleryItems);
}

export function getGalleryImages(): Promise<
  GalleryImage[]
> {
  return api.get<GalleryImage[]>(
    "/gallery/images",
  ).then(normalizeGalleryItems);
}

export function getGalleryVideos(): Promise<
  GalleryImage[]
> {
  return api.get<GalleryImage[]>(
    "/gallery/videos",
  ).then(normalizeGalleryItems);
}

export function getHomepageVideos(): Promise<
  GalleryImage[]
> {
  return api.get<GalleryImage[]>(
    "/gallery/homepage-videos",
  ).then(normalizeGalleryItems);
}

export function getAdminGallery(): Promise<
  GalleryImage[]
> {
  return api.get<GalleryImage[]>(
    "/admin/gallery",
  ).then(normalizeGalleryItems);
}

export function getGalleryImage(
  id: number,
): Promise<GalleryImage> {
  return api.get<GalleryImage>(
    `/admin/gallery/${id}`,
  ).then(normalizeGalleryItem);
}

export function createGalleryImage(
  data: CreateGalleryImageInput,
): Promise<GalleryImage> {
  return api.post<GalleryImage>(
    "/admin/gallery",
    data,
  ).then(normalizeGalleryItem);
}

export function uploadGalleryImages(
  data: UploadGalleryImagesInput,
): Promise<UploadGalleryImagesResponse> {
  const formData =
    new FormData();

  data.files.forEach(
    (file) => {
      formData.append(
        "images",
        file,
      );
    },
  );

  formData.append(
    "title",
    data.title,
  );

  formData.append(
    "description",
    data.description ?? "",
  );

  formData.append(
    "altText",
    data.altText ?? "",
  );

  formData.append(
    "status",
    data.status,
  );

  formData.append(
    "isFeatured",
    String(
      data.isFeatured,
    ),
  );

  formData.append(
    "sortOrder",
    String(
      data.sortOrder,
    ),
  );

  if (
    data.eventId !== undefined
  ) {
    formData.append(
      "eventId",
      String(
        data.eventId,
      ),
    );
  }

  return api.post<
    UploadGalleryImagesResponse
  >(
    "/admin/gallery/upload",
    formData,
  ).then((result) => ({ ...result, items: normalizeGalleryItems(result.items) }));
}

export function uploadGalleryVideo(
  data: UploadGalleryVideoInput,
): Promise<GalleryImage> {
  const formData =
    new FormData();

  formData.append(
    "video",
    data.file,
  );

  formData.append(
    "title",
    data.title,
  );

  formData.append(
    "description",
    data.description ?? "",
  );

  formData.append(
    "altText",
    data.altText ?? "",
  );

  formData.append(
    "status",
    data.status,
  );

  formData.append(
    "isFeatured",
    String(
      data.isFeatured,
    ),
  );

  formData.append(
    "sortOrder",
    String(
      data.sortOrder,
    ),
  );

  formData.append(
    "showOnHomepage",
    String(
      data.showOnHomepage,
    ),
  );

  formData.append(
    "homepageSortOrder",
    String(
      data.homepageSortOrder,
    ),
  );

  if (
    data.eventId !== undefined
  ) {
    formData.append(
      "eventId",
      String(
        data.eventId,
      ),
    );
  }

  return api.post<GalleryImage>(
    "/admin/gallery/upload/video",
    formData,
  ).then(normalizeGalleryItem);
}

export function updateGalleryImage(
  id: number,
  data: UpdateGalleryImageInput,
): Promise<GalleryImage> {
  return api.patch<GalleryImage>(
    `/admin/gallery/${id}`,
    data,
  ).then(normalizeGalleryItem);
}

export function deleteGalleryImage(
  id: number,
): Promise<void> {
  return api.delete<void>(
    `/admin/gallery/${id}`,
  );
}