import { api } from "./api.service";
import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../types/event";

export function getAdminEvents(): Promise<Event[]> {
  return api.get<Event[]>("/admin/events");
}

export function createEvent(
  eventData: CreateEventInput,
): Promise<Event> {
  return api.post<Event>("/admin/events", eventData);
}

export function updateEvent(
  eventId: number,
  eventData: UpdateEventInput,
): Promise<Event> {
  return api.patch<Event>(
    `/admin/events/${eventId}`,
    eventData,
  );
}