import { api } from "./api.service";

export type CreateContactMessageDto = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type CreateContactMessageResponse = {
  message: string;
  data: {
    id: number;
    createdAt: string;
  };
};

export type ContactMessageStatus =
  | "NEW"
  | "READ"
  | "REPLIED"
  | "ARCHIVED";

export type ContactMessageCategory =
  | "GENERAL"
  | "TICKETS"
  | "PARTNERSHIP"
  | "SUPPORT"
  | string;

export type ContactMessagePriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT"
  | string;

export type AdminContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  category?: ContactMessageCategory;
  priority?: ContactMessagePriority;
  createdAt: string;
  updatedAt: string;
};

export function sendContactMessage(
  data: CreateContactMessageDto,
) {
  return api.post<CreateContactMessageResponse>(
    "/contact",
    data,
  );
}

export type AdminMessagesResponse = {
  data: AdminContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function getAdminMessages() {
  return api.get<AdminMessagesResponse>("/admin/messages");
}

export function getAdminMessage(id: number) {
  return api.get<AdminContactMessage>(
    `/admin/messages/${id}`,
  );
}