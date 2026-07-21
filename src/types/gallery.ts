export type GalleryStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface GalleryImage {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  altText: string | null;

  status: GalleryStatus;

  isFeatured: boolean;
  sortOrder: number;

  eventId: number | null;

  event: {
    id: number;
    title: string;
    slug: string;
  } | null;

  createdAt: string;
  updatedAt: string;

  // Frontend only
  category?: string;
  type?: "photo" | "video";
  size?: "standard" | "wide" | "tall" | "large";
}
export interface CreateGalleryImageInput {
  title: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  status?: GalleryStatus;
  isFeatured?: boolean;
  sortOrder?: number;
  eventId?: number;
}

export interface UpdateGalleryImageInput
  extends Partial<CreateGalleryImageInput> {}