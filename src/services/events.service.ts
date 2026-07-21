import { api } from "./api.service";
import type { Event } from "../types/event";

export function getAdminEvents(): Promise<Event[]> {
  return api.get<Event[]>("/admin/events");
}