import { api } from "./api.service";

import type {
  CreateExperienceHighlightDto,
  CreateExperienceImageDto,
  CreateExperiencePageDto,
  ExperienceHighlight,
  ExperienceImage,
  ExperiencePage,
  UpdateExperienceHighlightDto,
  UpdateExperienceImageDto,
  UpdateExperiencePageDto,
} from "../types/experience";

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

export function getExperiencePage() {
  return api.get<ExperiencePage>("/experience");
}

/*
|--------------------------------------------------------------------------
| Experience Page
|--------------------------------------------------------------------------
*/

export function getAdminExperiencePage() {
  return api.get<ExperiencePage>("/admin/experience");
}

export function createExperiencePage(
  data: CreateExperiencePageDto,
) {
  return api.post<ExperiencePage>(
    "/admin/experience",
    data,
  );
}

export function updateExperiencePage(
  data: UpdateExperiencePageDto,
) {
  return api.patch<ExperiencePage>(
    "/admin/experience",
    data,
  );
}

/*
|--------------------------------------------------------------------------
| Highlights
|--------------------------------------------------------------------------
*/

export function getExperienceHighlights() {
  return api.get<ExperienceHighlight[]>(
    "/admin/experience/highlights",
  );
}

export function getExperienceHighlight(id: number) {
  return api.get<ExperienceHighlight>(
    `/admin/experience/highlights/${id}`,
  );
}

export function createExperienceHighlight(
  data: CreateExperienceHighlightDto,
) {
  return api.post<ExperienceHighlight>(
    "/admin/experience/highlights",
    data,
  );
}

export function updateExperienceHighlight(
  id: number,
  data: UpdateExperienceHighlightDto,
) {
  return api.patch<ExperienceHighlight>(
    `/admin/experience/highlights/${id}`,
    data,
  );
}

export function deleteExperienceHighlight(
  id: number,
) {
  return api.delete<void>(
    `/admin/experience/highlights/${id}`,
  );
}

/*
|--------------------------------------------------------------------------
| Images
|--------------------------------------------------------------------------
*/

export function getExperienceImages() {
  return api.get<ExperienceImage[]>(
    "/admin/experience/images",
  );
}

export function getExperienceImage(id: number) {
  return api.get<ExperienceImage>(
    `/admin/experience/images/${id}`,
  );
}

export function createExperienceImage(
  data: CreateExperienceImageDto,
) {
  return api.post<ExperienceImage>(
    "/admin/experience/images",
    data,
  );
}

export function updateExperienceImage(
  id: number,
  data: UpdateExperienceImageDto,
) {
  return api.patch<ExperienceImage>(
    `/admin/experience/images/${id}`,
    data,
  );
}

export function deleteExperienceImage(
  id: number,
) {
  return api.delete<void>(
    `/admin/experience/images/${id}`,
  );
}