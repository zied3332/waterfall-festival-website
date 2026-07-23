import { api } from "./api.service";

import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../types/event";

const PUBLIC_EVENTS_ENDPOINT = "/events";
const ADMIN_EVENTS_ENDPOINT = "/admin/events";

export function getPublicEvents(): Promise<Event[]> {
  return api.get<Event[]>(PUBLIC_EVENTS_ENDPOINT);
}

export function getPublicEventBySlug(
  slug: string,
): Promise<Event> {
  return api.get<Event>(
    `${PUBLIC_EVENTS_ENDPOINT}/${slug}`,
  );
}

export function getAdminEvents(): Promise<Event[]> {
  return api.get<Event[]>(ADMIN_EVENTS_ENDPOINT);
}

export function createEvent(
  eventData: CreateEventInput,
): Promise<Event> {
  return api.post<Event>(
    ADMIN_EVENTS_ENDPOINT,
    eventData,
  );
}

export function updateEvent(
  eventId: number,
  eventData: UpdateEventInput,
): Promise<Event> {
  return api.patch<Event>(
    `${ADMIN_EVENTS_ENDPOINT}/${eventId}`,
    eventData,
  );
}

export function deleteEvent(
  eventId: number,
): Promise<void> {
  return api.delete<void>(
    `${ADMIN_EVENTS_ENDPOINT}/${eventId}`,
  );
}