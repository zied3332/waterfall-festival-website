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

export type AdminMessagesResponse = {
  data: AdminContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateAdminContactMessageDto = {
  status?: ContactMessageStatus;
  category?: ContactMessageCategory;
  priority?: ContactMessagePriority;
};

export type DeleteContactMessageResponse = {
  message: string;
};

export function sendContactMessage(
  data: CreateContactMessageDto,
) {
  return api.post<CreateContactMessageResponse>(
    "/contact",
    data,
  );
}

export function getAdminMessages() {
  return api.get<AdminMessagesResponse>(
    "/admin/messages",
  );
}

export function getAdminMessage(id: number) {
  return api.get<AdminContactMessage>(
    `/admin/messages/${id}`,
  );
}

export function updateAdminMessage(
  id: number,
  data: UpdateAdminContactMessageDto,
) {
  return api.patch<AdminContactMessage>(
    `/admin/messages/${id}`,
    data,
  );
}

export function deleteAdminMessage(id: number) {
  return api.delete<DeleteContactMessageResponse>(
    `/admin/messages/${id}`,
  );
}