export interface ExperienceHighlight {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExperiencePage {
  id: number;

  heroBadge: string | null;
  heroTitle: string;
  heroSubtitle: string | null;
  heroDescription: string | null;

  storyEyebrow: string | null;
  storyTitle: string;
  storyDescription: string;

  buttonText: string | null;
  buttonUrl: string | null;

  isPublished: boolean;

  highlights: ExperienceHighlight[];
  images: ExperienceImage[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateExperiencePageDto {
  heroBadge?: string;
  heroTitle: string;
  heroSubtitle?: string;
  heroDescription?: string;

  storyEyebrow?: string;
  storyTitle: string;
  storyDescription: string;

  buttonText?: string;
  buttonUrl?: string;

  isPublished?: boolean;
}

export interface UpdateExperiencePageDto
  extends Partial<CreateExperiencePageDto> {}

export interface CreateExperienceHighlightDto {
  title: string;
  description: string;
  icon?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface UpdateExperienceHighlightDto
  extends Partial<CreateExperienceHighlightDto> {}

export interface CreateExperienceImageDto {
  imageUrl: string;
  altText?: string;
  caption?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  isVisible?: boolean;
}

export interface UpdateExperienceImageDto
  extends Partial<CreateExperienceImageDto> {}