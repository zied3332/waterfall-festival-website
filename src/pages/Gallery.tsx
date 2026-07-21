import { useEffect, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { getGallery } from "../services/gallery.service";
import type { GalleryImage } from "../types/gallery";

import "./style/gallery.css";

type GalleryCardSize =
  | "standard"
  | "wide"
  | "tall"
  | "large";

const galleryCardSizes: GalleryCardSize[] = [
  "large",
  "standard",
  "tall",
  "standard",
  "wide",
  "standard",
  "tall",
  "wide",
];

function getGalleryCardSize(
  item: GalleryImage,
  index: number,
): GalleryCardSize {
  if (item.isFeatured) {
    return "large";
  }

  return galleryCardSizes[index % galleryCardSizes.length];
}

function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedItem =
    selectedIndex !== null
      ? galleryItems[selectedIndex] ?? null
      : null;

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getGallery();

        if (isMounted) {
          setGalleryItems(data);
        }
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to load the gallery.";

        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  const openGalleryItem = (index: number) => {
    setSelectedIndex(index);
  };

  const closeGalleryItem = () => {
    setSelectedIndex(null);
  };

  const showPreviousItem = () => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || galleryItems.length === 0) {
        return null;
      }

      return currentIndex === 0
        ? galleryItems.length - 1
        : currentIndex - 1;
    });
  };

  const showNextItem = () => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || galleryItems.length === 0) {
        return null;
      }

      return currentIndex === galleryItems.length - 1
        ? 0
        : currentIndex + 1;
    });
  };

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (selectedIndex === null) {
        return;
      }

      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex((currentIndex) => {
          if (currentIndex === null || galleryItems.length === 0) {
            return null;
          }

          return currentIndex === 0
            ? galleryItems.length - 1
            : currentIndex - 1;
        });
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex((currentIndex) => {
          if (currentIndex === null || galleryItems.length === 0) {
            return null;
          }

          return currentIndex === galleryItems.length - 1
            ? 0
            : currentIndex + 1;
        });
      }
    };

    window.addEventListener("keydown", handleKeyboardNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [selectedIndex, galleryItems.length]);

  useEffect(() => {
    document.body.style.overflow =
      selectedIndex !== null ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <main className="gallery-page">
      <div className="gallery-page__background" aria-hidden="true">
        <div className="gallery-page__orb gallery-page__orb--one" />
        <div className="gallery-page__orb gallery-page__orb--two" />
        <div className="gallery-page__grid-pattern" />
      </div>

      <section className="gallery-hero">
        <div className="gallery-container">
          <div className="gallery-hero__content">
            <div className="gallery-hero__eyebrow">
              <Camera size={16} />
              <span>Waterfall Memories</span>
            </div>

            <h1 className="gallery-hero__title">
              Moments that live
              <span> forever.</span>
            </h1>

            <p className="gallery-hero__description">
              Step inside the energy of Waterfall Festival. Explore powerful
              performances, unforgettable crowds, tropical landscapes and
              nights filled with music.
            </p>

            <div className="gallery-hero__stats">
              <div className="gallery-hero__stat">
                <strong>{galleryItems.length}</strong>

                <span>
                  Festival{" "}
                  {galleryItems.length === 1 ? "moment" : "moments"}
                </span>
              </div>

              <div className="gallery-hero__divider" />

              <div className="gallery-hero__stat">
                <strong>
                  {
                    galleryItems.filter(
                      (item) => item.isFeatured,
                    ).length
                  }
                </strong>

                <span>Featured memories</span>
              </div>

              <div className="gallery-hero__divider" />

              <div className="gallery-hero__stat">
                <strong>1</strong>
                <span>Unforgettable island</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-showcase">
        <div className="gallery-container">
          <div className="gallery-toolbar">
            <div>
              <span className="gallery-toolbar__label">
                Explore the festival
              </span>

              <h2>Captured in the moment</h2>
            </div>

            <div
              className="gallery-filters"
              aria-label="Gallery information"
            >
              <span className="gallery-filter gallery-filter--active">
                {galleryItems.length}{" "}
                {galleryItems.length === 1 ? "Photo" : "Photos"}
              </span>
            </div>
          </div>

          {isLoading && (
            <div className="gallery-grid">
              <div>
                <span className="gallery-toolbar__label">
                  Loading festival memories...
                </span>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="gallery-grid">
              <div>
                <span className="gallery-toolbar__label">
                  Gallery unavailable
                </span>

                <p>{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && galleryItems.length === 0 && (
            <div className="gallery-grid">
              <div>
                <span className="gallery-toolbar__label">
                  No photos yet
                </span>

                <p>
                  Published festival photos will appear here.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && galleryItems.length > 0 && (
            <div className="gallery-grid">
              {galleryItems.map((item, index) => {
                const cardSize = getGalleryCardSize(item, index);

                const eventLabel =
                  item.event?.title ?? "Waterfall Festival";

                return (
                  <button
                    type="button"
                    className={`gallery-card gallery-card--${cardSize}`}
                    key={item.id}
                    onClick={() => openGalleryItem(index)}
                    aria-label={`Open ${item.title}`}
                  >
                    <img
                      className="gallery-card__image"
                      src={item.imageUrl}
                      alt={item.altText ?? item.title}
                    />

                    <div className="gallery-card__shade" />

                    <div className="gallery-card__top">
                      <span className="gallery-card__category">
                        {eventLabel}
                      </span>

                      <span className="gallery-card__type">
                        <Camera size={14} />
                        Photo
                      </span>
                    </div>

                    <div className="gallery-card__content">
                      <span>
                        {item.isFeatured
                          ? "Featured Memory"
                          : "Waterfall Festival"}
                      </span>

                      <h3>{item.title}</h3>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={closeGalleryItem}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={closeGalleryItem}
            aria-label="Close image viewer"
          >
            <X size={24} />
          </button>

          {galleryItems.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-lightbox__navigation gallery-lightbox__navigation--previous"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousItem();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                type="button"
                className="gallery-lightbox__navigation gallery-lightbox__navigation--next"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextItem();
                }}
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <div
            className="gallery-lightbox__content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gallery-lightbox__image-wrapper">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.altText ?? selectedItem.title}
                className="gallery-lightbox__image"
              />
            </div>

            <div className="gallery-lightbox__details">
              <div>
                <span>
                  {selectedItem.event?.title ??
                    "Waterfall Festival"}
                </span>

                <h2>{selectedItem.title}</h2>

                {selectedItem.description && (
                  <p>{selectedItem.description}</p>
                )}
              </div>

              <p>
                {selectedIndex !== null
                  ? selectedIndex + 1
                  : 1}{" "}
                / {galleryItems.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Gallery;