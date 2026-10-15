// This key preserves favorites saved by the existing homepage gallery.
export const GALLERY_FAVORITES_KEY = "waterfall.gallery.favorites.v1";
export type FavoritesSnapshot = { ids: ReadonlySet<string>; persistent: boolean };
const subscribers = new Set<() => void>();
const emptySnapshot: FavoritesSnapshot = { ids: new Set(), persistent: true };

function readStored(): string[] | null {
  let raw: string;
  try { raw = window.localStorage.getItem(GALLERY_FAVORITES_KEY) ?? "[]"; }
  catch { return null; }
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id: unknown) =>
      (typeof id === "number" || typeof id === "string") && /^[1-9]\d*$/.test(String(id))
      && Number.isInteger(Number(id)) && Number(id) <= 2147483647,
    ).map(String))];
  } catch { return []; }
}

const initial = readStored();
let snapshot: FavoritesSnapshot = { ids: new Set(initial ?? []), persistent: initial !== null };
export const getFavoritesSnapshot = () => snapshot;
export const getServerFavoritesSnapshot = () => emptySnapshot;

function publish(ids: ReadonlySet<string>, persistent: boolean) {
  if (snapshot.persistent === persistent && ids.size === snapshot.ids.size && [...ids].every(id => snapshot.ids.has(id))) return;
  snapshot = { ids, persistent };
  subscribers.forEach(listener => listener());
}

function syncStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== GALLERY_FAVORITES_KEY) return;
  try { if (event.storageArea && event.storageArea !== window.localStorage) return; }
  catch { return; }
  const stored = readStored();
  if (stored !== null) publish(new Set(stored), true);
}

export function subscribeFavorites(listener: () => void) {
  if (subscribers.size === 0) window.addEventListener("storage", syncStorage);
  subscribers.add(listener);
  // Refresh changes made while neither gallery was mounted, without losing
  // visit-only favorites if browser persistence has been denied.
  if (snapshot.persistent) {
    const stored = readStored();
    if (stored !== null) publish(new Set(stored), true);
  }
  return () => {
    subscribers.delete(listener);
    if (!subscribers.size) window.removeEventListener("storage", syncStorage);
  };
}

export function toggleGalleryFavorite(id: number) {
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) return;
  const stored = snapshot.persistent ? readStored() : null;
  const next = new Set(stored ?? snapshot.ids);
  const key = String(id);
  if (next.has(key)) next.delete(key); else next.add(key);
  let persistent = true;
  try { window.localStorage.setItem(GALLERY_FAVORITES_KEY, JSON.stringify([...next])); }
  catch { persistent = false; }
  publish(next, persistent);
}
