import { api } from "./api.service";

import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../types/event";

const PUBLIC_EVENTS_ENDPOINT =
  "/events";

const ADMIN_EVENTS_ENDPOINT =
  "/admin/events";

export type HomepageEventMode =
  | "AUTO"
  | "MANUAL";

export type HomepageEventResponse = {
  mode: HomepageEventMode;

  event: Event | null;

  switchAt: string | null;
};

export type AdminHomepageEventSettings = {
  homepageEventMode:
    HomepageEventMode;

  homepageManualEventId:
    number | null;

  homepageManualEvent:
    Event | null;

  resolvedMode:
    HomepageEventMode;

  resolvedEvent:
    Event | null;

  switchAt:
    string | null;
};

export type UpdateHomepageEventSettingsInput = {
  homepageEventMode?:
    HomepageEventMode;

  homepageManualEventId?:
    number | null;
};

/*
 * ============================================================
 * PUBLIC EVENTS
 * ============================================================
 */

export function getPublicEvents(): Promise<
  Event[]
> {
  return api.get<Event[]>(
    PUBLIC_EVENTS_ENDPOINT,
  );
}

export function getPublicEventBySlug(
  slug: string,
): Promise<Event> {
  return api.get<Event>(
    `${PUBLIC_EVENTS_ENDPOINT}/${slug}`,
  );
}

/*
 * ============================================================
 * PUBLIC HOMEPAGE EVENT
 * ============================================================
 *
 * This is the single source of truth for:
 *
 * - Homepage
 * - Homepage popup
 * - Navbar Get Tickets button
 * - Other main-event CTAs
 *
 * The backend decides whether AUTO or MANUAL
 * mode is currently active.
 * ============================================================
 */

export function getHomepageEvent(): Promise<
  HomepageEventResponse
> {
  return api.get<HomepageEventResponse>(
    `${PUBLIC_EVENTS_ENDPOINT}/homepage`,
  );
}

/*
 * ============================================================
 * ADMIN EVENTS
 * ============================================================
 */

export function getAdminEvents(): Promise<
  Event[]
> {
  return api.get<Event[]>(
    ADMIN_EVENTS_ENDPOINT,
  );
}

export function getAdminEvent(
  eventId: number,
): Promise<Event> {
  return api.get<Event>(
    `${ADMIN_EVENTS_ENDPOINT}/${eventId}`,
  );
}

/*
 * ============================================================
 * ADMIN HOMEPAGE EVENT SETTINGS
 * ============================================================
 */

export function getAdminHomepageEventSettings(): Promise<
  AdminHomepageEventSettings
> {
  return api.get<AdminHomepageEventSettings>(
    `${ADMIN_EVENTS_ENDPOINT}/homepage-settings`,
  );
}

export function updateAdminHomepageEventSettings(
  settings:
    UpdateHomepageEventSettingsInput,
): Promise<AdminHomepageEventSettings> {
  return api.patch<AdminHomepageEventSettings>(
    `${ADMIN_EVENTS_ENDPOINT}/homepage-settings`,
    settings,
  );
}

/*
 * ============================================================
 * CREATE EVENT
 * ============================================================
 */

export function createEvent(
  eventData: CreateEventInput,
): Promise<Event> {
  return api.post<Event>(
    ADMIN_EVENTS_ENDPOINT,
    eventData,
  );
}

/*
 * ============================================================
 * UPDATE EVENT
 * ============================================================
 */

export function updateEvent(
  eventId: number,
  eventData: UpdateEventInput,
): Promise<Event> {
  return api.patch<Event>(
    `${ADMIN_EVENTS_ENDPOINT}/${eventId}`,
    eventData,
  );
}

/*
 * ============================================================
 * HERO IMAGE
 * ============================================================
 */

export function uploadEventHeroImage(
  eventId: number,
  imageFile: File,
): Promise<Event> {
  const formData =
    new FormData();

  formData.append(
    "image",
    imageFile,
  );

  return api.patch<Event>(
    `${ADMIN_EVENTS_ENDPOINT}/${eventId}/hero-image`,
    formData,
  );
}

/*
 * ============================================================
 * DELETE EVENT
 * ============================================================
 */

export function deleteEvent(
  eventId: number,
): Promise<void> {
  return api.delete<void>(
    `${ADMIN_EVENTS_ENDPOINT}/${eventId}`,
  );
}