import { useSyncExternalStore } from "react";
import { getFavoritesSnapshot, getServerFavoritesSnapshot, subscribeFavorites, toggleGalleryFavorite } from "../services/gallery-favorites";

export function useGalleryFavorites() {
  const snapshot = useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getServerFavoritesSnapshot);
  return {
    favorites: snapshot.ids,
    toggleFavorite: toggleGalleryFavorite,
    favoriteNotice: snapshot.persistent ? "" : "Favorites are saved for this visit only because browser storage is unavailable.",
  };
}
