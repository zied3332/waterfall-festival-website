export type FaqStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  status: FaqStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqInput {
  question: string;
  answer: string;
  category?: string;
  status?: FaqStatus;
  sortOrder?: number;
}

export interface UpdateFaqInput {
  question?: string;
  answer?: string;
  category?: string;
  status?: FaqStatus;
  sortOrder?: number;
}