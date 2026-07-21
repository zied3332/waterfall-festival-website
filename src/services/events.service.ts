import { api } from "./api.service";
import type {
  CreateEventInput,
  Event,
} from "../types/event";

export function getAdminEvents(): Promise<Event[]> {
  return api.get<Event[]>("/admin/events");
}

export function createEvent(
  eventData: CreateEventInput,
): Promise<Event> {
  return api.post<Event>("/admin/events", eventData);
}