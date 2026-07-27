import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Images,
  RotateCcw,
  Star,
  X,
} from "lucide-react";

import { getGallery } from "../services/gallery.service";
import type { GalleryImage } from "../types/gallery";

import "./style/gallery.css";

type GalleryFilter =
  | "all"
  | "featured"
  | string;

const GALLERY_SKELETON_COUNT = 6;

function Gallery() {
  const [galleryItems, setGalleryItems] =
    useState<GalleryImage[]>([]);

  const [selectedFilter, setSelectedFilter] =
    useState<GalleryFilter>("all");

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadGallery = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getGallery();

      setGalleryItems(data);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to load the gallery.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  const featuredCount = useMemo(() => {
    return galleryItems.filter(
      (item) => item.isFeatured,
    ).length;
  }, [galleryItems]);

  const eventFilters = useMemo(() => {
    const uniqueEventTitles = new Set<string>();

    galleryItems.forEach((item) => {
      const eventTitle =
        item.event?.title?.trim();

      if (eventTitle) {
        uniqueEventTitles.add(eventTitle);
      }
    });

    return Array.from(uniqueEventTitles).sort(
      (firstEvent, secondEvent) =>
        firstEvent.localeCompare(secondEvent),
    );
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === "all") {
      return galleryItems;
    }

    if (selectedFilter === "featured") {
      return galleryItems.filter(
        (item) => item.isFeatured,
      );
    }

    return galleryItems.filter(
      (item) =>
        item.event?.title === selectedFilter,
    );
  }, [galleryItems, selectedFilter]);

  const selectedItem =
    selectedIndex !== null
      ? filteredItems[selectedIndex] ?? null
      : null;

  function handleFilterChange(
    filter: GalleryFilter,
  ): void {
    setSelectedFilter(filter);
    setSelectedIndex(null);
  }

  function openGalleryItem(
    index: number,
  ): void {
    setSelectedIndex(index);
  }

  const closeGalleryItem =
    useCallback((): void => {
      setSelectedIndex(null);
    }, []);

  const showPreviousItem =
    useCallback((): void => {
      setSelectedIndex((currentIndex) => {
        if (
          currentIndex === null ||
          filteredItems.length === 0
        ) {
          return null;
        }

        return currentIndex === 0
          ? filteredItems.length - 1
          : currentIndex - 1;
      });
    }, [filteredItems.length]);

  const showNextItem =
    useCallback((): void => {
      setSelectedIndex((currentIndex) => {
        if (
          currentIndex === null ||
          filteredItems.length === 0
        ) {
          return null;
        }

        return currentIndex ===
          filteredItems.length - 1
          ? 0
          : currentIndex + 1;
      });
    }, [filteredItems.length]);

  useEffect(() => {
    function handleKeyboardNavigation(
      event: KeyboardEvent,
    ): void {
      if (selectedIndex === null) {
        return;
      }

      if (event.key === "Escape") {
        closeGalleryItem();
      }

      if (event.key === "ArrowLeft") {
        showPreviousItem();
      }

      if (event.key === "ArrowRight") {
        showNextItem();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboardNavigation,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardNavigation,
      );
    };
  }, [
    closeGalleryItem,
    selectedIndex,
    showNextItem,
    showPreviousItem,
  ]);

  useEffect(() => {
    if (selectedIndex === null) {
      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <div className="gallery-hero__content">
          <p className="gallery-hero__label">
            Gallery
          </p>

          <h1 className="gallery-hero__title">
            Festival Moments
          </h1>

          <p className="gallery-hero__description">
            Explore unforgettable Waterfall
            Festival performances, crowds,
            tropical landscapes, and island
            nights.
          </p>
        </div>
      </section>

      <section className="gallery-content">
        <div className="gallery-container">
          <header className="gallery-toolbar">
            <div className="gallery-toolbar__heading">
              <span
                className="gallery-toolbar__icon"
                aria-hidden="true"
              >
                <Camera size={20} />
              </span>

              <div>
                <p className="gallery-toolbar__label">
                  Waterfall Festival
                </p>

                <h2>Festival gallery</h2>
              </div>
            </div>

            {!isLoading && !error && (
              <span className="gallery-photo-count">
                {galleryItems.length}{" "}
                {galleryItems.length === 1
                  ? "photo"
                  : "photos"}
              </span>
            )}
          </header>

          {!isLoading &&
            !error &&
            galleryItems.length > 0 && (
              <div
                className="gallery-filters"
                aria-label="Filter gallery images"
              >
                <button
                  className={`gallery-filter${
                    selectedFilter === "all"
                      ? " gallery-filter--active"
                      : ""
                  }`}
                  type="button"
                  onClick={() =>
                    handleFilterChange("all")
                  }
                  aria-pressed={
                    selectedFilter === "all"
                  }
                >
                  <Images
                    size={16}
                    aria-hidden="true"
                  />

                  All
                </button>

                {featuredCount > 0 && (
                  <button
                    className={`gallery-filter${
                      selectedFilter ===
                      "featured"
                        ? " gallery-filter--active"
                        : ""
                    }`}
                    type="button"
                    onClick={() =>
                      handleFilterChange(
                        "featured",
                      )
                    }
                    aria-pressed={
                      selectedFilter ===
                      "featured"
                    }
                  >
                    <Star
                      size={16}
                      aria-hidden="true"
                    />

                    Featured
                  </button>
                )}

                {eventFilters.map(
                  (eventTitle) => (
                    <button
                      className={`gallery-filter${
                        selectedFilter ===
                        eventTitle
                          ? " gallery-filter--active"
                          : ""
                      }`}
                      type="button"
                      key={eventTitle}
                      onClick={() =>
                        handleFilterChange(
                          eventTitle,
                        )
                      }
                      aria-pressed={
                        selectedFilter ===
                        eventTitle
                      }
                    >
                      {eventTitle}
                    </button>
                  ),
                )}
              </div>
            )}

          {isLoading && (
            <div
              className="gallery-skeleton-grid"
              aria-label="Loading gallery photos"
            >
              {Array.from({
                length: GALLERY_SKELETON_COUNT,
              }).map((_, index) => (
                <div
                  className="gallery-skeleton"
                  key={index}
                  aria-hidden="true"
                >
                  <div className="gallery-skeleton__image" />

                  <div className="gallery-skeleton__content">
                    <div className="gallery-skeleton__line gallery-skeleton__line--label" />

                    <div className="gallery-skeleton__line gallery-skeleton__line--title" />

                    <div className="gallery-skeleton__line gallery-skeleton__line--short" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="gallery-message gallery-message--error">
              <div>
                <h2>
                  We couldn’t load the gallery
                </h2>

                <p>
                  Something went wrong while
                  loading the latest festival
                  photos. Please try again.
                </p>

                <small>{error}</small>
              </div>

              <button
                className="gallery-retry-button"
                type="button"
                onClick={() =>
                  void loadGallery()
                }
              >
                <RotateCcw
                  size={17}
                  aria-hidden="true"
                />

                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !error &&
            galleryItems.length === 0 && (
              <div className="gallery-message">
                <span
                  className="gallery-message__icon"
                  aria-hidden="true"
                >
                  <Images size={24} />
                </span>

                <div>
                  <h2>
                    No festival photos yet
                  </h2>

                  <p>
                    Published Waterfall Festival
                    photos will appear here.
                  </p>
                </div>
              </div>
            )}

          {!isLoading &&
            !error &&
            galleryItems.length > 0 &&
            filteredItems.length === 0 && (
              <div className="gallery-message">
                <span
                  className="gallery-message__icon"
                  aria-hidden="true"
                >
                  <Images size={24} />
                </span>

                <div>
                  <h2>
                    No matching photos
                  </h2>

                  <p>
                    There are no published photos
                    in this gallery category yet.
                  </p>
                </div>
              </div>
            )}

          {!isLoading &&
            !error &&
            filteredItems.length > 0 && (
              <>
                <p className="gallery-results-count">
                  Showing {filteredItems.length}{" "}
                  {filteredItems.length === 1
                    ? "photo"
                    : "photos"}
                </p>

                <div className="gallery-grid">
                  {filteredItems.map(
                    (item, index) => {
                      const eventLabel =
                        item.event?.title ??
                        "Waterfall Festival";

                      return (
                        <button
                          className={`gallery-card${
                            item.isFeatured
                              ? " gallery-card--featured"
                              : ""
                          }`}
                          type="button"
                          key={item.id}
                          onClick={() =>
                            openGalleryItem(
                              index,
                            )
                          }
                          aria-label={`Open ${item.title}`}
                        >
                          <div className="gallery-card__image-wrapper">
                            <img
                              className="gallery-card__image"
                              src={item.imageUrl}
                              alt={
                                item.altText ??
                                item.title
                              }
                              loading="lazy"
                              decoding="async"
                            />

                            <div
                              className="gallery-card__overlay"
                              aria-hidden="true"
                            />

                            {item.isFeatured && (
                              <span className="gallery-card__featured">
                                <Star
                                  size={13}
                                  aria-hidden="true"
                                />

                                Featured
                              </span>
                            )}

                            <span className="gallery-card__open">
                              <Camera
                                size={17}
                                aria-hidden="true"
                              />

                              View
                            </span>
                          </div>

                          <div className="gallery-card__content">
                            <p className="gallery-card__event">
                              {eventLabel}
                            </p>

                            <h3>
                              {item.title}
                            </h3>

                            {item.description && (
                              <p className="gallery-card__description">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </>
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
          <div className="gallery-lightbox__top">
            <span className="gallery-lightbox__counter">
              {selectedIndex !== null
                ? selectedIndex + 1
                : 1}{" "}
              / {filteredItems.length}
            </span>

            <button
              className="gallery-lightbox__close"
              type="button"
              onClick={closeGalleryItem}
              aria-label="Close image viewer"
            >
              <X
                size={22}
                aria-hidden="true"
              />
            </button>
          </div>

          {filteredItems.length > 1 && (
            <>
              <button
                className="gallery-lightbox__navigation gallery-lightbox__navigation--previous"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousItem();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft
                  size={25}
                  aria-hidden="true"
                />
              </button>

              <button
                className="gallery-lightbox__navigation gallery-lightbox__navigation--next"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextItem();
                }}
                aria-label="Next image"
              >
                <ChevronRight
                  size={25}
                  aria-hidden="true"
                />
              </button>
            </>
          )}

          <div
            className="gallery-lightbox__content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="gallery-lightbox__image-wrapper">
              <img
                className="gallery-lightbox__image"
                src={selectedItem.imageUrl}
                alt={
                  selectedItem.altText ??
                  selectedItem.title
                }
                decoding="async"
              />
            </div>

            <div className="gallery-lightbox__details">
              <div>
                <div className="gallery-lightbox__labels">
                  {selectedItem.isFeatured && (
                    <span className="gallery-lightbox__featured">
                      <Star
                        size={13}
                        aria-hidden="true"
                      />

                      Featured
                    </span>
                  )}

                  <span className="gallery-lightbox__event">
                    {selectedItem.event
                      ?.title ??
                      "Waterfall Festival"}
                  </span>
                </div>

                <h2>
                  {selectedItem.title}
                </h2>

                {selectedItem.description && (
                  <p>
                    {selectedItem.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Gallery;