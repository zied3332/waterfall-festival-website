import { api } from "./api.service";

import type {
  PublicWebsiteSettings,
  UpdateWebsiteSettingsDto,
  WebsiteSettings,
} from "../types/settings";

export function getAdminSettings(): Promise<WebsiteSettings> {
  return api.get<WebsiteSettings>("/admin/settings");
}

export function updateAdminSettings(
  settings: UpdateWebsiteSettingsDto,
): Promise<WebsiteSettings> {
  return api.patch<WebsiteSettings>(
    "/admin/settings",
    settings,
  );
}

export function getPublicSettings(): Promise<PublicWebsiteSettings> {
  return api.get<PublicWebsiteSettings>(
    "/settings/public",
  );
}