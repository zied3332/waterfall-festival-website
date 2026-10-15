import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

import {
  getGallery,
} from "../../services/gallery.service";

import type {
  GalleryImage,
} from "../../types/gallery";

import GalleryMedia from "./GalleryMedia";
import "./gallery-preview.css";

const PREVIEW_LIMIT = 10;

const SWIPE_THRESHOLD = 50;

/*
 * Keeps compatibility with older GalleryImage
 * records and newer media records.
 */

type GalleryPreviewItem =
  GalleryImage & {
    type?: string | null;
    mediaType?: string | null;
    videoUrl?: string | null;
  };

/*
 * This is the final item used by the UI.
 *
 * It keeps the original backend gallery information.
 */

type DisplayGalleryItem = {
  id: string | number;
  title: string;
  altText?: string | null;

  imageUrl: string;

  isFeatured: boolean;
  sortOrder: number;

  eventTitle: string;
};

/* =========================================================
   HELPERS
========================================================= */

function isImageItem(
  item: GalleryPreviewItem,
): boolean {
  const mediaType =
    item.mediaType ??
    item.type;

  /*
   * If the backend explicitly provides a
   * media type, only accept images/photos.
   */

  if (
    typeof mediaType === "string" &&
    mediaType.trim()
  ) {
    const normalizedType =
      mediaType
        .trim()
        .toUpperCase();

    return (
      normalizedType === "IMAGE" ||
      normalizedType === "PHOTO"
    );
  }

  /*
   * Older records might not have a type.
   * If videoUrl exists, exclude it.
   */

  if (item.videoUrl) {
    return false;
  }

  /*
   * Older records only contain imageUrl.
   */

  return Boolean(
    item.imageUrl?.trim(),
  );
}

/* =========================================================
   COMPONENT
========================================================= */

function GalleryPreviewSection() {
  const [
    galleryItems,
    setGalleryItems,
  ] = useState<
    GalleryPreviewItem[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    apiFailed,
    setApiFailed,
  ] = useState(false);

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState<
    number | null
  >(null);

  const touchStartXRef =
    useRef<number | null>(
      null,
    );

  const touchEndXRef =
    useRef<number | null>(
      null,
    );

  /* =========================================================
     LOAD GALLERY
  ========================================================= */

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

  /* =========================================================
     REMOTE IMAGE RECORDS
  ========================================================= */

  const imageItems =
    useMemo(() => {
      return galleryItems.filter(
        isImageItem,
      );
    }, [galleryItems]);

  /*
   * Featured first, then sortOrder.
   */

  const remotePreviewItems =
    useMemo(() => {
      return [...imageItems]
        .sort(
          (
            firstItem,
            secondItem,
          ) => {
            if (
              firstItem.isFeatured ===
              secondItem.isFeatured
            ) {
              return (
                (firstItem.sortOrder ??
                  0) -
                (secondItem.sortOrder ??
                  0)
              );
            }

            return firstItem.isFeatured
              ? -1
              : 1;
          },
        )
        .slice(
          0,
          PREVIEW_LIMIT,
        );
    }, [imageItems]);

  /* =========================================================
     FINAL DISPLAY ITEMS
  ========================================================= */

  const previewItems = useMemo<DisplayGalleryItem[]>(() => remotePreviewItems.map(item => ({
    id: item.id,
    title: item.title,
    altText: item.altText,
    imageUrl: item.imageUrl,
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
    eventTitle: item.event?.title ?? "Waterfall Festival",
  })), [remotePreviewItems]);

  /* =========================================================
     SELECTED IMAGE
  ========================================================= */

  const selectedItem =
    selectedIndex !== null
      ? previewItems[
          selectedIndex
        ] ?? null
      : null;

  /* =========================================================
     LIGHTBOX CONTROLS
  ========================================================= */

  const openImage =
    useCallback(
      (index: number) => {
        setSelectedIndex(
          index,
        );
      },
      [],
    );

  const closeImage =
    useCallback(() => {
      setSelectedIndex(
        null,
      );
    }, []);

  const showPreviousImage =
    useCallback(() => {
      setSelectedIndex(
        (currentIndex) => {
          if (
            currentIndex === null ||
            previewItems.length === 0
          ) {
            return null;
          }

          return currentIndex === 0
            ? previewItems.length - 1
            : currentIndex - 1;
        },
      );
    }, [previewItems.length]);

  const showNextImage =
    useCallback(() => {
      setSelectedIndex(
        (currentIndex) => {
          if (
            currentIndex === null ||
            previewItems.length === 0
          ) {
            return null;
          }

          return currentIndex ===
            previewItems.length - 1
            ? 0
            : currentIndex + 1;
        },
      );
    }, [previewItems.length]);

  /* =========================================================
     KEYBOARD NAVIGATION
  ========================================================= */

  useEffect(() => {
    if (
      selectedIndex === null
    ) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeImage();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        showPreviousImage();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        showNextImage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    selectedIndex,
    closeImage,
    showPreviousImage,
    showNextImage,
  ]);

  /* =========================================================
     LOCK PAGE SCROLL WHEN LIGHTBOX IS OPEN
  ========================================================= */

  useEffect(() => {
    if (
      selectedIndex === null
    ) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedIndex]);

  /* =========================================================
     MOBILE SWIPE
  ========================================================= */

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    touchEndXRef.current =
      null;

    touchStartXRef.current =
      event.targetTouches[0]
        ?.clientX ?? null;
  };

  const handleTouchMove = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    touchEndXRef.current =
      event.targetTouches[0]
        ?.clientX ?? null;
  };

  const handleTouchEnd =
    () => {
      const startX =
        touchStartXRef.current;

      const endX =
        touchEndXRef.current;

      touchStartXRef.current =
        null;

      touchEndXRef.current =
        null;

      if (
        startX === null ||
        endX === null
      ) {
        return;
      }

      const distance =
        startX - endX;

      if (
        Math.abs(distance) <
        SWIPE_THRESHOLD
      ) {
        return;
      }

      /*
       * Finger moves left:
       * show next image.
       */

      if (distance > 0) {
        showNextImage();

        return;
      }

      /*
       * Finger moves right:
       * show previous image.
       */

      showPreviousImage();
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <section
        className="gallery-preview"
        aria-labelledby="gallery-preview-title"
      >
        <div
          className="gallery-preview__glow gallery-preview__glow--left"
          aria-hidden="true"
        />

        <div
          className="gallery-preview__glow gallery-preview__glow--right"
          aria-hidden="true"
        />

        <div className="gallery-preview-container">

          {/* =========================
              Header
          ========================= */}

          <header className="gallery-preview-header">

            <div className="gallery-preview-heading">

              <div className="gallery-preview-heading__icon">
                <Camera
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <div>

                <p className="gallery-preview-label">
                  Festival Gallery
                </p>

                <h2
                  id="gallery-preview-title"
                  className="gallery-preview-title"
                >
                  Experience the
                  atmosphere
                </h2>

              </div>

            </div>

            <Link
              to="/gallery"
              className="gallery-preview-header-link"
            >
              View Gallery

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>

          </header>

          <p className="gallery-preview-description">
            A glimpse of unforgettable
            Waterfall Festival nights,
            performances and moments.
          </p>

          {/* =========================
              Loading
          ========================= */}

          {isLoading && (
            <div
              className="gallery-preview-grid gallery-preview-grid--loading"
              aria-label="Loading festival photos"
            >
              {Array.from({
                length:
                  PREVIEW_LIMIT,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={`gallery-preview-skeleton gallery-preview-skeleton--${
                      index % 3
                    }`}
                    aria-hidden="true"
                  />
                ),
              )}
            </div>
          )}

          {/* =========================
              Gallery
          ========================= */}

          {!isLoading &&
            previewItems.length >
              0 && (
              <>
                <div className="gallery-preview-grid">

                  {previewItems.map(
                    (
                      item,
                      index,
                    ) => {
                      const imageSource = item.imageUrl;

                      return (
                        <button
                          type="button"
                          key={item.id}
                          className="gallery-preview-card"
                          aria-label={`Open ${item.title}`}
                          onClick={() =>
                            openImage(
                              index,
                            )
                          }
                        >
                          <div className="gallery-preview-card__media">

                            <GalleryMedia
                              src={
                                imageSource
                              }
                              alt={
                                item.altText ??
                                item.title
                              }
                              loading="lazy"
                              decoding="async"
                              className="gallery-preview-card__image"
                            />

                            <span
                              className="gallery-preview-card__overlay"
                              aria-hidden="true"
                            />

                            {item.isFeatured && (
                              <span className="gallery-preview-card__featured">

                                <Sparkles
                                  size={11}
                                  aria-hidden="true"
                                />

                                Featured

                              </span>
                            )}

                            <span className="gallery-preview-card__content">

                              <small>
                                {
                                  item.eventTitle
                                }
                              </small>

                              <strong>
                                {item.title}
                              </strong>

                            </span>

                            <span
                              className="gallery-preview-card__zoom"
                              aria-hidden="true"
                            >
                              <Camera
                                size={15}
                              />
                            </span>

                          </div>
                        </button>
                      );
                    },
                  )}

                </div>

                {/* =========================
                    CTA
                ========================= */}

                <div className="gallery-preview-footer">

                  <div>

                    <span className="gallery-preview-footer__count">
                      {
                        previewItems.length
                      }{" "}
                      {previewItems.length ===
                      1
                        ? "festival photo"
                        : "festival photos"}
                    </span>

                    <p>
                      Explore more
                      Waterfall Festival
                      moments.
                    </p>

                  </div>

                  <Link
                    to="/gallery"
                    className="gallery-preview-cta"
                  >
                    <Camera
                      size={17}
                      aria-hidden="true"
                    />

                    Explore Full Gallery

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>

                </div>
              </>
            )}

          {!isLoading && previewItems.length === 0 && (
            <p className="gallery-preview-status" role="status">
              {apiFailed ? "Gallery photos could not be loaded. Please try again later." : "No gallery photos have been published yet. Explore the full gallery for festival videos."}
            </p>
          )}

        </div>
      </section>

      {/* =========================
          IMAGE LIGHTBOX
      ========================= */}

      {selectedItem && (
        <div
          className="gallery-preview-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${selectedItem.title}`}
          onClick={
            closeImage
          }
        >
          {/* =========================
              Top bar
          ========================= */}

          <div
            className="gallery-preview-lightbox__top"
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <div className="gallery-preview-lightbox__counter">

              <span>
                {selectedIndex !==
                null
                  ? selectedIndex +
                    1
                  : 1}
              </span>

              <span>/</span>

              <span>
                {
                  previewItems.length
                }
              </span>

            </div>

            <button
              type="button"
              className="gallery-preview-lightbox__close"
              onClick={
                closeImage
              }
              aria-label="Close image"
            >
              <X size={22} />
            </button>

          </div>

          {/* =========================
              Previous
          ========================= */}

          {previewItems.length >
            1 && (
            <button
              type="button"
              className="gallery-preview-lightbox__nav gallery-preview-lightbox__nav--previous"
              onClick={(
                event,
              ) => {
                event.stopPropagation();

                showPreviousImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft
                size={30}
              />
            </button>
          )}

          {/* =========================
              Image
          ========================= */}

          <div
            className="gallery-preview-lightbox__viewer"
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
            onTouchStart={
              handleTouchStart
            }
            onTouchMove={
              handleTouchMove
            }
            onTouchEnd={
              handleTouchEnd
            }
          >
            <GalleryMedia
              key={`${selectedItem.id}-${selectedItem.imageUrl}`}
              src={
                selectedItem.imageUrl
              }
              alt={
                selectedItem.altText ??
                selectedItem.title
              }
              className="gallery-preview-lightbox__image"
              draggable={false}
            />

            <div className="gallery-preview-lightbox__details">

              <div>

                <span>
                  {
                    selectedItem.eventTitle
                  }
                </span>

                <h3>
                  {
                    selectedItem.title
                  }
                </h3>

              </div>

              <div className="gallery-preview-lightbox__swipe">

                <ArrowLeft
                  size={13}
                />

                <span>
                  Swipe
                </span>

                <ArrowRight
                  size={13}
                />

              </div>

            </div>

          </div>

          {/* =========================
              Next
          ========================= */}

          {previewItems.length >
            1 && (
            <button
              type="button"
              className="gallery-preview-lightbox__nav gallery-preview-lightbox__nav--next"
              onClick={(
                event,
              ) => {
                event.stopPropagation();

                showNextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight
                size={30}
              />
            </button>
          )}

        </div>
      )}
    </>
  );
}

export default GalleryPreviewSection;