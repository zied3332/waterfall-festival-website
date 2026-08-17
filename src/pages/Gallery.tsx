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

const GALLERY_SKELETON_COUNT = 12;

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
    const uniqueEventTitles =
      new Set<string>();

    galleryItems.forEach((item) => {
      const eventTitle =
        item.event?.title?.trim();

      if (eventTitle) {
        uniqueEventTitles.add(
          eventTitle,
        );
      }
    });

    return Array.from(
      uniqueEventTitles,
    ).sort(
      (
        firstEvent,
        secondEvent,
      ) =>
        firstEvent.localeCompare(
          secondEvent,
        ),
    );
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === "all") {
      return galleryItems;
    }

    if (
      selectedFilter ===
      "featured"
    ) {
      return galleryItems.filter(
        (item) => item.isFeatured,
      );
    }

    return galleryItems.filter(
      (item) =>
        item.event?.title ===
        selectedFilter,
    );
  }, [
    galleryItems,
    selectedFilter,
  ]);

  const selectedItem =
    selectedIndex !== null
      ? filteredItems[
          selectedIndex
        ] ?? null
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
      setSelectedIndex(
        (currentIndex) => {
          if (
            currentIndex === null ||
            filteredItems.length ===
              0
          ) {
            return null;
          }

          return currentIndex === 0
            ? filteredItems.length -
                1
            : currentIndex - 1;
        },
      );
    }, [filteredItems.length]);

  const showNextItem =
    useCallback((): void => {
      setSelectedIndex(
        (currentIndex) => {
          if (
            currentIndex === null ||
            filteredItems.length ===
              0
          ) {
            return null;
          }

          return currentIndex ===
            filteredItems.length -
              1
            ? 0
            : currentIndex + 1;
        },
      );
    }, [filteredItems.length]);

  useEffect(() => {
    function handleKeyboardNavigation(
      event: KeyboardEvent,
    ): void {
      if (
        selectedIndex === null
      ) {
        return;
      }

      if (
        event.key === "Escape"
      ) {
        closeGalleryItem();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        showPreviousItem();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
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
    if (
      selectedIndex === null
    ) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [selectedIndex]);

  return (
    <main className="gallery-page">
      {/* =========================
          Hero
      ========================= */}

      <section className="gallery-hero">
        <div className="gallery-hero__content">
          <p className="gallery-hero__label">
            Waterfall Festival Gallery
          </p>

          <h1 className="gallery-hero__title">
            Festival Moments
          </h1>

          <p className="gallery-hero__description">
            Explore the latest photos
            published from Waterfall
            Festival.
          </p>
        </div>
      </section>

      {/* =========================
          Gallery
      ========================= */}

      <section className="gallery-content">
        <div className="gallery-container">
          <header className="gallery-toolbar">
            <div className="gallery-toolbar__heading">
              <span
                className="gallery-toolbar__icon"
                aria-hidden="true"
              >
                <Camera
                  size={19}
                />
              </span>

              <div>
                <p className="gallery-toolbar__label">
                  Explore
                </p>

                <h2>
                  Festival Gallery
                </h2>
              </div>
            </div>

            {!isLoading &&
              !error && (
                <span className="gallery-photo-count">
                  {
                    galleryItems.length
                  }{" "}
                  {galleryItems.length ===
                  1
                    ? "photo"
                    : "photos"}
                </span>
              )}
          </header>

          {/* =========================
              Filters
          ========================= */}

          {!isLoading &&
            !error &&
            galleryItems.length >
              0 && (
              <div
                className="gallery-filters"
                aria-label="Filter gallery images"
              >
                <button
                  className={`gallery-filter${
                    selectedFilter ===
                    "all"
                      ? " gallery-filter--active"
                      : ""
                  }`}
                  type="button"
                  onClick={() =>
                    handleFilterChange(
                      "all",
                    )
                  }
                  aria-pressed={
                    selectedFilter ===
                    "all"
                  }
                >
                  <Images
                    size={15}
                    aria-hidden="true"
                  />

                  All
                </button>

                {featuredCount >
                  0 && (
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
                      size={15}
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
                      key={
                        eventTitle
                      }
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

          {/* =========================
              Loading
          ========================= */}

          {isLoading && (
            <div
              className="gallery-skeleton-grid"
              aria-label="Loading gallery photos"
            >
              {Array.from({
                length:
                  GALLERY_SKELETON_COUNT,
              }).map(
                (_, index) => (
                  <div
                    className="gallery-skeleton"
                    key={index}
                    aria-hidden="true"
                  />
                ),
              )}
            </div>
          )}

          {/* =========================
              Error
          ========================= */}

          {!isLoading &&
            error && (
              <div className="gallery-message gallery-message--error">
                <div>
                  <h2>
                    We couldn’t load
                    the gallery
                  </h2>

                  <p>
                    Something went
                    wrong while loading
                    the latest festival
                    photos.
                  </p>

                  <small>
                    {error}
                  </small>
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

          {/* =========================
              Empty
          ========================= */}

          {!isLoading &&
            !error &&
            galleryItems.length ===
              0 && (
              <div className="gallery-message">
                <span
                  className="gallery-message__icon"
                  aria-hidden="true"
                >
                  <Images
                    size={24}
                  />
                </span>

                <div>
                  <h2>
                    No festival
                    photos yet
                  </h2>

                  <p>
                    Images published
                    from the admin
                    dashboard will
                    appear here
                    automatically.
                  </p>
                </div>
              </div>
            )}

          {!isLoading &&
            !error &&
            galleryItems.length >
              0 &&
            filteredItems.length ===
              0 && (
              <div className="gallery-message">
                <span
                  className="gallery-message__icon"
                  aria-hidden="true"
                >
                  <Images
                    size={24}
                  />
                </span>

                <div>
                  <h2>
                    No matching photos
                  </h2>

                  <p>
                    There are no
                    published photos
                    for this category.
                  </p>
                </div>
              </div>
            )}

          {/* =========================
              Backend images
          ========================= */}

          {!isLoading &&
            !error &&
            filteredItems.length >
              0 && (
              <>
                <p className="gallery-results-count">
                  Showing{" "}
                  {
                    filteredItems.length
                  }{" "}
                  {filteredItems.length ===
                  1
                    ? "photo"
                    : "photos"}
                </p>

                <div className="gallery-grid">
                  {filteredItems.map(
                    (
                      item,
                      index,
                    ) => {
                      const eventLabel =
                        item.event
                          ?.title ??
                        "Waterfall Festival";

                      return (
                        <button
                          className={`gallery-card${
                            item.isFeatured
                              ? " gallery-card--featured"
                              : ""
                          }`}
                          type="button"
                          key={
                            item.id
                          }
                          onClick={() =>
                            openGalleryItem(
                              index,
                            )
                          }
                          aria-label={`Open ${item.title}`}
                        >
                          <img
                            className="gallery-card__image"
                            src={
                              item.imageUrl
                            }
                            alt={
                              item.altText ??
                              item.title
                            }
                            loading="lazy"
                            decoding="async"
                          />

                          <span
                            className="gallery-card__shade"
                            aria-hidden="true"
                          />

                          {item.isFeatured && (
                            <span className="gallery-card__featured">
                              <Star
                                size={
                                  12
                                }
                                aria-hidden="true"
                              />

                              Featured
                            </span>
                          )}

                          <span className="gallery-card__info">
                            <span className="gallery-card__event">
                              {
                                eventLabel
                              }
                            </span>

                            <strong>
                              {
                                item.title
                              }
                            </strong>
                          </span>

                          <span className="gallery-card__open">
                            <Camera
                              size={15}
                              aria-hidden="true"
                            />

                            View
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </>
            )}
        </div>
      </section>

      {/* =========================
          Lightbox
      ========================= */}

      {selectedItem && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={
            selectedItem.title
          }
          onClick={
            closeGalleryItem
          }
        >
          <div className="gallery-lightbox__top">
            <span className="gallery-lightbox__counter">
              {selectedIndex !==
              null
                ? selectedIndex +
                  1
                : 1}{" "}
              /{" "}
              {
                filteredItems.length
              }
            </span>

            <button
              className="gallery-lightbox__close"
              type="button"
              onClick={
                closeGalleryItem
              }
              aria-label="Close image viewer"
            >
              <X
                size={22}
                aria-hidden="true"
              />
            </button>
          </div>

          {filteredItems.length >
            1 && (
            <>
              <button
                className="gallery-lightbox__navigation gallery-lightbox__navigation--previous"
                type="button"
                onClick={(
                  event,
                ) => {
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
                onClick={(
                  event,
                ) => {
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
                src={
                  selectedItem.imageUrl
                }
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
                    {selectedItem
                      .event?.title ??
                      "Waterfall Festival"}
                  </span>
                </div>

                <h2>
                  {
                    selectedItem.title
                  }
                </h2>

                {selectedItem.description && (
                  <p>
                    {
                      selectedItem.description
                    }
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