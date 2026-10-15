import type { GalleryDeletionResponse, GalleryImage } from "../../types/gallery";

export function selectVisibleImages(current: ReadonlySet<number>, items: GalleryImage[]): Set<number> {
  return new Set([...current, ...items.filter(item => item.mediaType === "IMAGE").map(item => item.id)]);
}

export function pruneGallerySelection(current: ReadonlySet<number>, items: GalleryImage[]): Set<number> {
  return new Set(items.filter(item => item.mediaType === "IMAGE" && current.has(item.id)).map(item => item.id));
}

export function reconcileGalleryDeletion(items: GalleryImage[], selected: ReadonlySet<number>, result: GalleryDeletionResponse) {
  const removed = new Set([...result.deletedIds, ...result.notFoundIds]);
  return {
    items: items.filter(item => !removed.has(item.id)),
    selection: new Set([...selected].filter(id => !removed.has(id))),
  };
}

export function describeGalleryDeletion(result: GalleryDeletionResponse): string {
  const parts = [`${result.deletedIds.length} gallery record(s) deleted.`];
  if (result.notFoundIds.length) parts.push(`${result.notFoundIds.length} selected record(s) were already missing.`);
  if (result.preservedAssetIds.length) parts.push(`Legacy media or thumbnails for ${result.preservedAssetIds.length} record(s) were deliberately preserved.`);
  if (result.status === "cleanup_failed") parts.push("Some physical files could not be cleaned up. Review the cleanup operation and retry when ready.");
  else if (result.status === "cleanup_pending") parts.push("Physical file cleanup is still pending.");
  else parts.push("All scheduled file cleanup tasks completed.");
  return parts.join(" ");
}
