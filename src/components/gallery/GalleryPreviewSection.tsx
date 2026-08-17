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

function GalleryPreviewSection() {
  const [
    galleryItems,
    setGalleryItems,
  ] = useState<GalleryImage[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadGallery =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await getGallery();

        setGalleryItems(data);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to load gallery images.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  const previewItems =
    useMemo(() => {
      return [...galleryItems]
        .sort(
          (
            firstItem,
            secondItem,
          ) => {
            if (
              firstItem.isFeatured ===
              secondItem.isFeatured
            ) {
              return 0;
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
    }, [galleryItems]);

  return (
    <section
      className="gallery-preview"
      aria-labelledby="gallery-preview-title"
    >
      <div className="gallery-preview__glow gallery-preview__glow--left" />

      <div className="gallery-preview__glow gallery-preview__glow--right" />

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
                Experience the atmosphere
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
            aria-label="Loading festival gallery"
          >
            {Array.from({
              length:
                SKELETON_COUNT,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="gallery-preview-skeleton"
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
                    Published festival
                    images will appear
                    here automatically.
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* =========================
            Backend gallery
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
                      <Link
                        to="/gallery"
                        key={item.id}
                        className={[
                          "gallery-preview-card",
                          item.isFeatured
                            ? "gallery-preview-card--featured"
                            : "",
                          index === 0
                            ? "gallery-preview-card--lead"
                            : "",
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            " ",
                          )}
                        aria-label={`Open gallery and view ${item.title}`}
                      >
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
                      </Link>
                    );
                  },
                )}
              </div>

              {/* =========================
                  Bottom CTA
              ========================= */}

              <div className="gallery-preview-footer">
                <div>
                  <span className="gallery-preview-footer__count">
                    {
                      galleryItems.length
                    }{" "}
                    {galleryItems.length ===
                    1
                      ? "festival memory"
                      : "festival memories"}
                  </span>

                  <p>
                    Discover more moments
                    from Waterfall
                    Festival.
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