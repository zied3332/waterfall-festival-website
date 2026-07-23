import { api } from "./api.service";

export type NotificationType =
  | "CONTACT_MESSAGE"
  | "EVENT"
  | "GALLERY"
  | "FAQ"
  | string;

export type NotificationPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT"
  | string;

export type AdminNotification = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  link: string | null;
  contactMessageId: number | null;
  createdAt: string;
  updatedAt?: string;
  readAt: string | null;
};

export type UnreadCountResponse = {
  unreadCount: number;
};

export type RecentNotificationsResponse = {
  data: AdminNotification[];
  unreadCount: number;
};

export type MarkAllNotificationsReadResponse = {
  message: string;
  updatedCount: number;
};

export function getUnreadNotificationCount() {
  return api.get<UnreadCountResponse>(
    "/admin/notifications/unread-count",
  );
}

export function getRecentNotifications(limit = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 20);

  return api.get<RecentNotificationsResponse>(
    `/admin/notifications/recent?limit=${safeLimit}`,
  );
}

export function markNotificationAsRead(
  notificationId: number,
) {
  return api.patch<AdminNotification>(
    `/admin/notifications/${notificationId}/read`,
    {},
  );
}

export function markAllNotificationsAsRead() {
  return api.patch<MarkAllNotificationsReadResponse>(
    "/admin/notifications/read-all",
    {},
  );
}