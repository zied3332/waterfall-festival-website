export type GalleryStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export type GalleryMediaType =
  | "IMAGE"
  | "VIDEO";

export interface GalleryEventSummary {
  id: number;
  title: string;
  slug: string;
}

export interface GalleryImage {
  id: number;

  mediaType: GalleryMediaType;

  title: string;
  description: string | null;

  imageUrl: string;
  publicId: string | null;

  thumbnailUrl: string | null;

  duration: number | null;

  width: number | null;
  height: number | null;

  altText: string | null;

  status: GalleryStatus;

  isFeatured: boolean;
  sortOrder: number;

  showOnHomepage: boolean;
  homepageSortOrder: number;

  eventId: number | null;

  event: GalleryEventSummary | null;

  createdAt: string;
  updatedAt: string;

  /*
   * Frontend-only presentation metadata.
   * These are not returned by the backend.
   */
  category?: string;

  type?: "photo" | "video";

  size?:
    | "standard"
    | "wide"
    | "tall"
    | "large";
}

export interface CreateGalleryImageInput {
  mediaType?: GalleryMediaType;

  title: string;

  description?: string;

  imageUrl: string;

  publicId?: string;

  thumbnailUrl?: string;

  duration?: number;

  width?: number;
  height?: number;

  altText?: string;

  status?: GalleryStatus;

  isFeatured?: boolean;

  sortOrder?: number;

  showOnHomepage?: boolean;

  homepageSortOrder?: number;

  eventId?: number;
}

export type UpdateGalleryImageInput = Partial<Omit<
  CreateGalleryImageInput,
  "imageUrl" | "publicId" | "thumbnailUrl" | "mediaType"
>>;

export interface GalleryBatchDeletionRequest {
  ids: number[];
}

export type GalleryCleanupStatus = "completed" | "cleanup_pending" | "cleanup_failed";

export interface GalleryDeletionResponse {
  operationId: string;
  status: GalleryCleanupStatus;
  requestedCount: number;
  deletedIds: number[];
  notFoundIds: number[];
  preservedAssetIds: number[];
  cleanup: { pending: number; succeeded: number; failed: number };
}

export type GalleryCleanupOperation = GalleryDeletionResponse;
export type GalleryCleanupRetryResponse = GalleryDeletionResponse;
// Older deployments return only the deleted record.
export type GallerySingleDeletionResponse = GalleryImage & { deletion?: GalleryDeletionResponse };
