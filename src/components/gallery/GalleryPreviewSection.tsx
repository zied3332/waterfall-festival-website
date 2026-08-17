import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  Camera,
  Images,
  RotateCcw,
  Sparkles,
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

/*
 * This keeps the component compatible with
 * the older GalleryImage shape while also
 * supporting the newer media records that
 * may contain type / mediaType / videoUrl.
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
   * If the backend explicitly tells us
   * the media type, accept images/photos
   * only.
   */
  if (
    typeof mediaType ===
      "string" &&
    mediaType.trim()
  ) {
    const normalizedType =
      mediaType
        .trim()
        .toUpperCase();

    return (
      normalizedType ===
        "IMAGE" ||
      normalizedType ===
        "PHOTO"
    );
  }

  /*
   * Older records may not contain a type.
   * A videoUrl is still enough to identify
   * a video and exclude it.
   */
  if (item.videoUrl) {
    return false;
  }

  /*
   * Older gallery-image records only had
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
          setIsLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  /*
   * Images only:
   * 1. remove videos
   * 2. put featured photos first
   * 3. keep only the first 10
   */
  const imageItems =
    useMemo(() => {
      return galleryItems.filter(
        isImageItem,
      );
    }, [galleryItems]);

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

  return (
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
                    Gallery
                    unavailable
                  </strong>

                  <span>
                    We couldn’t load
                    the festival
                    photos.
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
                    Photos coming
                    soon
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
            Image-only preview
        ========================= */}

        {!isLoading &&
          !error &&
          previewItems.length >
            0 && (
            <>
              <div className="gallery-preview-grid">
                {previewItems.map(
                  (item) => {
                    const eventName =
                      item.event
                        ?.title ??
                      "Waterfall Festival";

                    return (
                      <Link
                        to="/gallery"
                        key={item.id}
                        className="gallery-preview-card"
                        aria-label={`Open gallery and view ${item.title}`}
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
                                size={
                                  11
                                }
                                aria-hidden="true"
                              />

                              Featured
                            </span>
                          )}

                          <span className="gallery-preview-card__content">
                            <small>
                              {
                                eventName
                              }
                            </small>

                            <strong>
                              {
                                item.title
                              }
                            </strong>
                          </span>
                        </div>
                      </Link>
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
  );
}

export default GalleryPreviewSection;