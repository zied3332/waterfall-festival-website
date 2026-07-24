import { api } from "./api.service";

export type CreateContactMessageDto = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type ContactMessageResponse = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

export function sendContactMessage(
  data: CreateContactMessageDto,
) {
  return api.post<ContactMessageResponse>(
    "/contact/messages",
    data,
  );
}