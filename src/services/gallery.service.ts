import { api, getApiMediaUrl } from "./api.service";

import type {
  GalleryBatchDeletionRequest,
  GalleryDeletionResponse,
  GalleryCleanupOperation,
  GalleryCleanupRetryResponse,
  GallerySingleDeletionResponse,
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
): Promise<GallerySingleDeletionResponse> {
  return api.delete<GallerySingleDeletionResponse>(
    `/admin/gallery/${id}`,
  );
}
export function parseGalleryDeletion(value: unknown): GalleryDeletionResponse {
  const invalid = () => new Error("The API returned an unrecognized deletion result. Refresh gallery data and cleanup operations before trying again.");
  if (!value || typeof value !== "object") throw invalid();
  const result = value as GalleryDeletionResponse;
  const idsValid = (ids: unknown): ids is number[] => Array.isArray(ids) && ids.every(id => Number.isInteger(id) && id > 0 && id <= 2147483647) && new Set(ids).size === ids.length;
  const countValid = (count: unknown) => Number.isInteger(count) && (count as number) >= 0;
  if (typeof result.operationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.operationId)
    || !["completed", "cleanup_pending", "cleanup_failed"].includes(result.status)
    || !countValid(result.requestedCount) || !idsValid(result.deletedIds) || !idsValid(result.notFoundIds) || !idsValid(result.preservedAssetIds)
    || !result.cleanup || ![result.cleanup.pending, result.cleanup.succeeded, result.cleanup.failed].every(countValid)
    || result.requestedCount !== result.deletedIds.length + result.notFoundIds.length
    || result.deletedIds.some(id => result.notFoundIds.includes(id))
    || result.preservedAssetIds.some(id => !result.deletedIds.includes(id))
    || result.status !== (result.cleanup.failed ? "cleanup_failed" : result.cleanup.pending ? "cleanup_pending" : "completed")) throw invalid();
  return result;
}

export async function deleteGalleryImagesBatch(ids: number[]): Promise<GalleryDeletionResponse> {
  if (ids.length < 1 || ids.length > 100 || new Set(ids).size !== ids.length || ids.some(id => !Number.isInteger(id) || id < 1 || id > 2147483647)) {
    throw new Error("Select between 1 and 100 unique images per deletion.");
  }
  const body: GalleryBatchDeletionRequest = { ids: [...ids] };
  const result = parseGalleryDeletion(await api.delete<unknown>("/admin/gallery/batch", body));
  const reported = [...result.deletedIds, ...result.notFoundIds];
  if (reported.length !== ids.length || reported.some(id => !ids.includes(id))) {
    throw new Error("The API returned IDs that do not match this selection. Refresh the gallery and cleanup operations.");
  }
  return result;
}

export async function getGalleryCleanupOperations(): Promise<GalleryCleanupOperation[]> {
  const results = await api.get<unknown>("/admin/gallery/operations");
  if (!Array.isArray(results)) throw new Error("This API has not confirmed support for gallery batch deletion.");
  return results.map(parseGalleryDeletion);
}

export async function getGalleryCleanupOperation(operationId: string): Promise<GalleryCleanupOperation> {
  return parseGalleryDeletion(await api.get<unknown>(`/admin/gallery/operations/${encodeURIComponent(operationId)}`));
}

export async function retryGalleryCleanup(operationId: string): Promise<GalleryCleanupRetryResponse> {
  return parseGalleryDeletion(await api.post<unknown>(`/admin/gallery/operations/${encodeURIComponent(operationId)}/retry`, {}));
}
