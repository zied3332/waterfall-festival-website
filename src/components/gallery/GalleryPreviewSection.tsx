import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { getGallery } from "../../services/gallery.service";
import type { GalleryImage } from "../../types/gallery";
import GalleryMedia from "./GalleryMedia";
import "./gallery-preview.css";

const PREVIEW_LIMIT = 12;
const FAVORITES_KEY = "waterfall.gallery.favorites.v1";
const SWIPE_THRESHOLD = 50;

type GalleryPreviewItem = GalleryImage & { videoUrl?: string | null };

function isImageItem(item: GalleryPreviewItem): boolean {
  const mediaType = item.mediaType ?? item.type;
  if (typeof mediaType === "string" && mediaType.trim()) {
    return ["IMAGE", "PHOTO"].includes(mediaType.trim().toUpperCase());
  }
  return !item.videoUrl && Boolean(item.imageUrl?.trim());
}

function readFavorites(): Set<string> {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
    if (!Array.isArray(value)) return new Set();
    return new Set(value.filter((id: unknown) =>
      (typeof id === "number" && Number.isSafeInteger(id) && id > 0)
      || (typeof id === "string" && /^\d+$/.test(id)),
    ).map(String));
  } catch {
    // Storage can be unavailable or contain invalid JSON; the album still works.
    return new Set();
  }
}

function GalleryPreviewSection() {
  const [galleryItems, setGalleryItems] = useState<GalleryPreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState(readFavorites);
  const favoritesRef = useRef(favorites);
  const [favoriteNotice, setFavoriteNotice] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let active = true;
    getGallery().then(items => {
      if (active) setGalleryItems(items);
    }).catch((error: unknown) => {
      console.warn("Homepage gallery records could not load.", error);
      if (active) setApiFailed(true);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const syncFavorites = (event: StorageEvent) => {
      if (event.key === FAVORITES_KEY || event.key === null) {
        const next = readFavorites();
        favoritesRef.current = next;
        setFavorites(next);
      }
    };
    window.addEventListener("storage", syncFavorites);
    return () => window.removeEventListener("storage", syncFavorites);
  }, []);

  const imageItems = useMemo(() => galleryItems.filter(isImageItem), [galleryItems]);
  // Preserve the homepage's existing featured-first, then sortOrder ordering.
  const previewItems = useMemo(() => [...imageItems].sort((first, second) =>
    first.isFeatured === second.isFeatured
      ? (first.sortOrder ?? 0) - (second.sortOrder ?? 0)
      : first.isFeatured ? -1 : 1,
  ).slice(0, PREVIEW_LIMIT), [imageItems]);

  const selectedItem = selectedIndex === null ? null : previewItems[selectedIndex] ?? null;
  const isViewerOpen = selectedItem !== null;
  const closeImage = useCallback(() => setSelectedIndex(null), []);
  const showPreviousImage = useCallback(() => {
    setSelectedIndex(index => index === null || !previewItems.length
      ? null : (index - 1 + previewItems.length) % previewItems.length);
  }, [previewItems.length]);
  const showNextImage = useCallback(() => {
    setSelectedIndex(index => index === null || !previewItems.length
      ? null : (index + 1) % previewItems.length);
  }, [previewItems.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isViewerOpen || !dialog) return;
    // The existing homepage viewer uses a native modal for background inertness
    // and focus containment, without adding a second lightbox dependency.
    const overflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>(".gallery-preview-lightbox__close")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      document.documentElement.style.overflow = rootOverflow;
      openerRef.current?.focus({ preventScroll: true });
      touchStartRef.current = null;
    };
  }, [isViewerOpen]);

  function toggleFavorite(id: number) {
    const key = String(id);
    const next = new Set(favoritesRef.current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    favoritesRef.current = next;
    setFavorites(next);
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      setFavoriteNotice("");
    } catch {
      setFavoriteNotice("Favorites are saved for this visit only because browser storage is unavailable.");
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches.length === 1 ? event.touches[0] : null;
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    const end = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !end || event.touches.length) return;
    const distance = start.x - end.clientX;
    if (Math.abs(distance) < SWIPE_THRESHOLD || Math.abs(distance) <= Math.abs(start.y - end.clientY)) return;
    if (distance > 0) showNextImage();
    else showPreviousImage();
  }

  return (
    <>
      <section className="gallery-preview" aria-labelledby="gallery-preview-title">
        <div className="gallery-preview-container">
          <header className="gallery-preview-header">
            <p className="gallery-preview-label">FESTIVAL GALLERY</p>
            <h2 id="gallery-preview-title" className="gallery-preview-title">Experience the Atmosphere</h2>
            <p className="gallery-preview-description">Unforgettable nights. Incredible music. Real moments.</p>
          </header>

          {isLoading && (
            <div className="gallery-preview-grid" role="status" aria-label="Loading festival photos" aria-busy="true">
              {Array.from({ length: PREVIEW_LIMIT }, (_, index) => (
                <div key={index} className="gallery-preview-skeleton" aria-hidden="true" />
              ))}
            </div>
          )}

          {!isLoading && previewItems.length > 0 && (
            <div className={`gallery-preview-album${imageItems.length > PREVIEW_LIMIT ? " gallery-preview-album--more" : ""}`}>
              <div className="gallery-preview-grid">
                {previewItems.map((item, index) => {
                  const isFavorite = favorites.has(String(item.id));
                  return (
                    <div key={item.id} className="gallery-preview-tile">
                      <button type="button" className="gallery-preview-photo" aria-label={`Open ${item.title}`}
                        aria-haspopup="dialog" onClick={event => {
                          openerRef.current = event.currentTarget;
                          setSelectedIndex(index);
                        }}>
                        <GalleryMedia src={item.imageUrl} alt={item.altText ?? item.title}
                          loading="lazy" decoding="async" className="gallery-preview-photo__image" />
                      </button>
                      <button type="button" className="gallery-preview-favorite" aria-pressed={isFavorite}
                        aria-label={`${isFavorite ? "Remove" : "Add"} ${item.title} ${isFavorite ? "from" : "to"} favorites`}
                        onClick={event => { event.stopPropagation(); toggleFavorite(item.id); }}>
                        <Heart size={19} aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoading && previewItems.length === 0 && (
            <p className="gallery-preview-status" role="status">
              {apiFailed ? "Gallery photos could not be loaded. Please try again later." : "No gallery photos have been published yet. Explore the full gallery for festival videos."}
            </p>
          )}
          {favoriteNotice && <p className="gallery-preview-storage-notice" role="status">{favoriteNotice}</p>}
          <div className="gallery-preview-footer">
            <Link to="/gallery" className="gallery-preview-cta">
              Explore Full Gallery <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <dialog ref={dialogRef} className="gallery-preview-lightbox" aria-label="Festival photo viewer"
        onCancel={event => { event.preventDefault(); closeImage(); }}
        onClick={event => { if (event.target === event.currentTarget) closeImage(); }}
        onKeyDown={event => {
          if (event.key === "Escape") { event.preventDefault(); closeImage(); }
          if (event.key === "ArrowLeft") { event.preventDefault(); showPreviousImage(); }
          if (event.key === "ArrowRight") { event.preventDefault(); showNextImage(); }
          if (event.key === "Tab") {
            const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
        }}>
        {selectedItem && (
          <>
            <div className="gallery-preview-lightbox__top">
              <span className="gallery-preview-lightbox__counter" aria-live="polite" aria-atomic="true">
                Photo {(selectedIndex ?? 0) + 1} of {previewItems.length}
              </span>
              <button type="button" className="gallery-preview-lightbox__close" aria-label="Close image" onClick={closeImage}>
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            <div className="gallery-preview-lightbox__viewer" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
              onTouchCancel={() => { touchStartRef.current = null; }}>
              <GalleryMedia key={`${selectedItem.id}-${selectedItem.imageUrl}`} src={selectedItem.imageUrl}
                alt={selectedItem.altText ?? selectedItem.title} className="gallery-preview-lightbox__image" draggable={false} />
            </div>
            {previewItems.length > 1 && (
              <div className="gallery-preview-lightbox__navigation">
                <button type="button" aria-label="Previous image" onClick={showPreviousImage}>
                  <ChevronLeft size={24} aria-hidden="true" />
                </button>
                <span>Swipe to explore</span>
                <button type="button" aria-label="Next image" onClick={showNextImage}>
                  <ChevronRight size={24} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </dialog>
    </>
  );
}

export default GalleryPreviewSection;
