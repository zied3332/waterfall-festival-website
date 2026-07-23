import { api } from "./api.service";

import type {
  CreateFaqInput,
  Faq,
  UpdateFaqInput,
} from "../types/faq";

const PUBLIC_BASE = "/faq";
const ADMIN_BASE = "/admin/faq";

export const faqService = {
  // Public
  getPublished: () =>
    api.get<Faq[]>(PUBLIC_BASE),

  getPublishedById: (id: number) =>
    api.get<Faq>(`${PUBLIC_BASE}/${id}`),

  // Admin
  getAll: () =>
    api.get<Faq[]>(ADMIN_BASE),

  getById: (id: number) =>
    api.get<Faq>(`${ADMIN_BASE}/${id}`),

  create: (data: CreateFaqInput) =>
    api.post<Faq>(ADMIN_BASE, data),

  update: (
    id: number,
    data: UpdateFaqInput,
  ) =>
    api.patch<Faq>(
      `${ADMIN_BASE}/${id}`,
      data,
    ),

  remove: (id: number) =>
    api.delete(`${ADMIN_BASE}/${id}`),
};

export default faqService;