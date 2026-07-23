import type {
  CreateFaqInput,
  Faq,
  UpdateFaqInput,
} from "../types/faq";

import { api } from "./api.service";

const PUBLIC_FAQ_ENDPOINT = "/faq";
const ADMIN_FAQ_ENDPOINT = "/admin/faq";

export const faqService = {
  getPublished() {
    return api.get<Faq[]>(PUBLIC_FAQ_ENDPOINT);
  },

  getPublishedById(id: number) {
    return api.get<Faq>(
      `${PUBLIC_FAQ_ENDPOINT}/${id}`,
    );
  },

  getAll() {
    return api.get<Faq[]>(ADMIN_FAQ_ENDPOINT);
  },

  getById(id: number) {
    return api.get<Faq>(
      `${ADMIN_FAQ_ENDPOINT}/${id}`,
    );
  },

  create(data: CreateFaqInput) {
    return api.post<Faq>(
      ADMIN_FAQ_ENDPOINT,
      data,
    );
  },

  update(
    id: number,
    data: UpdateFaqInput,
  ) {
    return api.patch<Faq>(
      `${ADMIN_FAQ_ENDPOINT}/${id}`,
      data,
    );
  },

  remove(id: number) {
    return api.delete<Faq>(
      `${ADMIN_FAQ_ENDPOINT}/${id}`,
    );
  },
};