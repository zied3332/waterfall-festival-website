import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { getGallery } from "../../services/gallery.service";
import type { GalleryImage } from "../../types/gallery";
import { useGalleryViewer } from "../../hooks/useGalleryViewer";
import { useGalleryFavorites } from "../../hooks/useGalleryFavorites";
import GalleryMedia from "./GalleryMedia";
import "./gallery-preview.css";

const PREVIEW_LIMIT = 12;

type GalleryPreviewItem = GalleryImage & { videoUrl?: string | null };

function isImageItem(item: GalleryPreviewItem): boolean {
  const mediaType = item.mediaType ?? item.type;
  if (typeof mediaType === "string" && mediaType.trim()) {
    return ["IMAGE", "PHOTO"].includes(mediaType.trim().toUpperCase());
  }
  return !item.videoUrl && Boolean(item.imageUrl?.trim());
}

function GalleryPreviewSection() {
  const [galleryItems, setGalleryItems] = useState<GalleryPreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { favorites, toggleFavorite, favoriteNotice } = useGalleryFavorites();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

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

  const viewer = useGalleryViewer({ isOpen: isViewerOpen, dialogRef, openerRef, onClose: closeImage, onPrevious: showPreviousImage, onNext: showNextImage });

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
        onKeyDown={viewer.onKeyDown}>
        {selectedItem && (
          <>
            <div className="gallery-preview-lightbox__top">
              <span className="gallery-preview-lightbox__counter" aria-live="polite" aria-atomic="true">
                Photo {(selectedIndex ?? 0) + 1} of {previewItems.length}
              </span>
              <button type="button" data-viewer-close className="gallery-preview-lightbox__close" aria-label="Close image" onClick={closeImage}>
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            <div className="gallery-preview-lightbox__viewer" onTouchStart={viewer.onTouchStart} onTouchMove={viewer.onTouchMove} onTouchEnd={viewer.onTouchEnd}
              onTouchCancel={viewer.onTouchCancel}>
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
