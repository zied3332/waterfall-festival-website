import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Images,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import {
  getGallery,
} from "../../services/gallery.service";

import type {
  GalleryImage,
} from "../../types/gallery";

import "./gallery-preview.css";

const PREVIEW_LIMIT = 10;
const SKELETON_COUNT = 10;

const SWIPE_THRESHOLD = 50;

/*
 * Keeps compatibility with older
 * GalleryImage records and newer
 * media records.
 */
type GalleryPreviewItem =
  GalleryImage & {
    type?: string | null;
    mediaType?: string | null;
    videoUrl?: string | null;
  };

function isImageItem(
  item: GalleryPreviewItem,
): boolean {
  const mediaType =
    item.mediaType ??
    item.type;

  /*
   * If the backend explicitly provides
   * a media type, only accept images.
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
   * If videoUrl exists, exclude the item.
   */
  if (item.videoUrl) {
    return false;
  }

  /*
   * Older gallery records only contain
   * imageUrl, so keep supporting them.
   */
  return Boolean(
    item.imageUrl?.trim(),
  );
}

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
    error,
    setError,
  ] = useState<
    string | null
  >(null);

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

  const loadGallery =
    useCallback(
      async () => {
        try {
          setIsLoading(true);
          setError(null);

          const data =
            await getGallery();

          setGalleryItems(
            data as GalleryPreviewItem[],
          );
        } catch (
          requestError
        ) {
          const message =
            requestError
              instanceof Error
              ? requestError.message
              : "Failed to load gallery images.";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  /*
   * Images only.
   */
  const imageItems =
    useMemo(() => {
      return galleryItems.filter(
        isImageItem,
      );
    }, [galleryItems]);

  /*
   * Featured first, then sortOrder.
   * Only show the first 10.
   */
  const previewItems =
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
                firstItem.sortOrder -
                secondItem.sortOrder
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

  const selectedItem =
    selectedIndex !== null
      ? previewItems[
          selectedIndex
        ] ?? null
      : null;

  /*
   * =========================
   * Lightbox controls
   * =========================
   */

  const openImage =
    useCallback(
      (index: number) => {
        setSelectedIndex(index);
      },
      [],
    );

  const closeImage =
    useCallback(() => {
      setSelectedIndex(null);
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

  /*
   * Keyboard navigation.
   */
  useEffect(() => {
    if (selectedIndex === null) {
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
        event.key === "ArrowLeft"
      ) {
        showPreviousImage();
      }

      if (
        event.key === "ArrowRight"
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

  /*
   * Prevent the page behind the
   * lightbox from scrolling.
   */
  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedIndex]);

  /*
   * If gallery data changes and the
   * selected index becomes invalid,
   * close the lightbox.
   */
  useEffect(() => {
    if (
      selectedIndex !== null &&
      selectedIndex >=
        previewItems.length
    ) {
      setSelectedIndex(null);
    }
  }, [
    selectedIndex,
    previewItems.length,
  ]);

  /*
   * =========================
   * Mobile swipe
   * =========================
   */

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    touchEndXRef.current = null;

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

  const handleTouchEnd = () => {
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
                  SKELETON_COUNT,
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
              Error
          ========================= */}

          {!isLoading &&
            error && (
              <div className="gallery-preview-message gallery-preview-message--error">
                <div className="gallery-preview-message__content">
                  <Images
                    size={24}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Gallery unavailable
                    </strong>

                    <span>
                      We couldn’t load
                      the festival photos.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="gallery-preview-retry"
                  onClick={() =>
                    void loadGallery()
                  }
                >
                  <RotateCcw
                    size={15}
                    aria-hidden="true"
                  />

                  Retry
                </button>
              </div>
            )}

          {/* =========================
              Empty
          ========================= */}

          {!isLoading &&
            !error &&
            previewItems.length ===
              0 && (
              <div className="gallery-preview-message">
                <div className="gallery-preview-message__content">
                  <Images
                    size={24}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Photos coming soon
                    </strong>

                    <span>
                      Published images
                      will appear here
                      automatically.
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* =========================
              Image preview
          ========================= */}

          {!isLoading &&
            !error &&
            previewItems.length >
              0 && (
              <>
                <div className="gallery-preview-grid">
                  {previewItems.map(
                    (
                      item,
                      index,
                    ) => {
                      const eventName =
                        item.event
                          ?.title ??
                        "Waterfall Festival";

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
                            <img
                              src={
                                item.imageUrl
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
                                {eventName}
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
                        imageItems.length
                      }{" "}
                      {imageItems.length ===
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
        </div>
      </section>

      {/* =========================
          Image Lightbox
      ========================= */}

      {selectedItem && (
        <div
          className="gallery-preview-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${selectedItem.title}`}
          onClick={closeImage}
        >
          {/* Top bar */}

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
                {selectedIndex !== null
                  ? selectedIndex + 1
                  : 1}
              </span>

              <span>/</span>

              <span>
                {previewItems.length}
              </span>
            </div>

            <button
              type="button"
              className="gallery-preview-lightbox__close"
              onClick={closeImage}
              aria-label="Close image"
            >
              <X size={22} />
            </button>
          </div>

          {/* Previous */}

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

          {/* Image */}

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
            <img
              key={selectedItem.id}
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
                  {selectedItem.event
                    ?.title ??
                    "Waterfall Festival"}
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

          {/* Next */}

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