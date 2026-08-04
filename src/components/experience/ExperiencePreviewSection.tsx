import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  Flame,
  LoaderCircle,
  Martini,
  Music2,
  RotateCcw,
  Sparkles,
  Star,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";

import {
  getExperiencePage,
} from "../../services/experience.service";

import type {
  ExperienceHighlight,
  ExperienceImage,
  ExperiencePage,
} from "../../types/experience";

import "./experience-preview.css";

const EXPERIENCE_HIGHLIGHT_LIMIT = 4;
const EXPERIENCE_SKELETON_COUNT = 4;

const DEFAULT_TITLE =
  "More than music.";

const DEFAULT_DESCRIPTION =
  "Music, waterfalls, fire shows and tropical energy in one unforgettable experience.";

const ICONS: Record<string, LucideIcon> = {
  music: Music2,
  music2: Music2,
  flame: Flame,
  fire: Flame,
  waves: Waves,
  waterfall: Waves,
  trees: Trees,
  jungle: Trees,
  martini: Martini,
  drinks: Martini,
  star: Star,
  vip: Star,
  sparkles: Sparkles,
};

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return "Could not load the festival experience.";
  }

  const apiError = error as ApiError;

  const responseMessage =
    apiError.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(" ");
  }

  if (typeof responseMessage === "string") {
    return responseMessage;
  }

  if (typeof apiError.message === "string") {
    return apiError.message;
  }

  return "Could not load the festival experience.";
}

function getHighlightIcon(
  iconName: string | null | undefined,
): LucideIcon {
  if (!iconName) {
    return Sparkles;
  }

  const normalizedIconName = iconName
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  return ICONS[normalizedIconName] ?? Sparkles;
}

function getVisibleImages(
  experiencePage: ExperiencePage,
): ExperienceImage[] {
  return [...(experiencePage.images ?? [])]
    .filter(
      (image) =>
        image.isVisible !== false &&
        Boolean(image.imageUrl?.trim()),
    )
    .sort((firstImage, secondImage) => {
      if (
        firstImage.isFeatured !==
        secondImage.isFeatured
      ) {
        return firstImage.isFeatured ? -1 : 1;
      }

      return (
        (firstImage.sortOrder ?? 0) -
        (secondImage.sortOrder ?? 0)
      );
    });
}

function getVisibleHighlights(
  experiencePage: ExperiencePage,
): ExperienceHighlight[] {
  return [...(experiencePage.highlights ?? [])]
    .filter(
      (highlight) =>
        highlight.isVisible !== false,
    )
    .sort(
      (firstHighlight, secondHighlight) =>
        (firstHighlight.sortOrder ?? 0) -
        (secondHighlight.sortOrder ?? 0),
    )
    .slice(0, EXPERIENCE_HIGHLIGHT_LIMIT);
}

function ExperiencePreviewSection() {
  const [experiencePage, setExperiencePage] =
    useState<ExperiencePage | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadExperience =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await getExperiencePage();

        setExperiencePage(data);
      } catch (loadError: unknown) {
        setExperiencePage(null);
        setError(
          getErrorMessage(loadError),
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadExperience();
  }, [loadExperience]);

  const visibleImages = useMemo(
    () =>
      experiencePage
        ? getVisibleImages(experiencePage)
        : [],
    [experiencePage],
  );

  const visibleHighlights = useMemo(
    () =>
      experiencePage
        ? getVisibleHighlights(
            experiencePage,
          )
        : [],
    [experiencePage],
  );

  const featuredImage =
    visibleImages[0] ?? null;

  const sectionLabel =
    experiencePage?.heroBadge?.trim() ||
    "The Experience";

  const sectionTitle =
    experiencePage?.heroTitle?.trim() ||
    DEFAULT_TITLE;

  const sectionDescription =
    experiencePage?.heroDescription?.trim() ||
    experiencePage?.heroSubtitle?.trim() ||
    DEFAULT_DESCRIPTION;

  const actionLabel =
    experiencePage?.buttonText?.trim() ||
    "Explore the experience";

  const configuredActionUrl =
    experiencePage?.buttonUrl?.trim();

  const actionUrl =
    configuredActionUrl || "/experience";

  const isExternalAction =
    /^https?:\/\//i.test(actionUrl);

  const imageAlt =
    featuredImage?.altText?.trim() ||
    "Waterfall Festival experience";

  const imageCaption =
    featuredImage?.caption?.trim();

  const hasExperienceContent =
    Boolean(featuredImage) ||
    visibleHighlights.length > 0;

  const actionContent = (
    <>
      <span>{actionLabel}</span>

      <ArrowRight
        size={18}
        aria-hidden="true"
      />
    </>
  );

  return (
    <section
      className="experience-preview"
      aria-labelledby="experience-preview-title"
    >
      <div
        className="experience-preview__background"
        aria-hidden="true"
      >
        <div className="experience-preview__grid-pattern" />

        <div className="experience-preview__glow experience-preview__glow--purple" />

        <div className="experience-preview__glow experience-preview__glow--cyan" />
      </div>

      <div className="experience-preview__container">
        <header className="experience-preview__header">
          <p className="experience-preview__eyebrow">
            <Sparkles
              size={14}
              aria-hidden="true"
            />

            <span>{sectionLabel}</span>
          </p>

          <h2
            id="experience-preview-title"
            className="experience-preview__title"
          >
            {sectionTitle}
          </h2>

          <p className="experience-preview__description">
            {sectionDescription}
          </p>
        </header>

        {isLoading && (
          <div
            className="experience-preview__layout"
            aria-label="Loading festival experience"
          >
            <div className="experience-preview__image-skeleton">
              <LoaderCircle
                className="experience-preview__loader"
                size={28}
                aria-hidden="true"
              />
            </div>

            <div className="experience-preview__highlight-list">
              {Array.from({
                length:
                  EXPERIENCE_SKELETON_COUNT,
              }).map((_, index) => (
                <div
                  className="experience-preview__highlight-skeleton"
                  key={index}
                  aria-hidden="true"
                >
                  <span />

                  <div>
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div
            className="experience-preview__state experience-preview__state--error"
            role="alert"
          >
            <span className="experience-preview__state-icon">
              <Sparkles
                size={24}
                aria-hidden="true"
              />
            </span>

            <div>
              <h3>
                We couldn’t load the experience
              </h3>

              <p>{error}</p>
            </div>

            <button
              type="button"
              className="experience-preview__retry"
              onClick={() => {
                void loadExperience();
              }}
            >
              <RotateCcw
                size={16}
                aria-hidden="true"
              />

              Try again
            </button>
          </div>
        )}

        {!isLoading &&
          !error &&
          !hasExperienceContent && (
            <div className="experience-preview__state">
              <span className="experience-preview__state-icon">
                <Sparkles
                  size={24}
                  aria-hidden="true"
                />
              </span>

              <div>
                <h3>
                  Experience content is coming
                  soon
                </h3>

                <p>
                  Festival highlights and images
                  will appear here when they are
                  published.
                </p>
              </div>
            </div>
          )}

        {!isLoading &&
          !error &&
          hasExperienceContent && (
            <div className="experience-preview__layout">
              <div className="experience-preview__visual">
                {featuredImage ? (
                  <img
                    className="experience-preview__image"
                    src={featuredImage.imageUrl}
                    alt={imageAlt}
                    loading="lazy"
                  />
                ) : (
                  <div className="experience-preview__image-placeholder">
                    <Sparkles
                      size={34}
                      aria-hidden="true"
                    />

                    <span>
                      Festival image coming soon
                    </span>
                  </div>
                )}

                <div
                  className="experience-preview__image-overlay"
                  aria-hidden="true"
                />

                {imageCaption && (
                  <div className="experience-preview__caption">
                    <span className="experience-preview__caption-icon">
                      <Sparkles
                        size={16}
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <strong>
                        {imageCaption}
                      </strong>

                      <small>
                        Koh Phangan, Thailand
                      </small>
                    </div>
                  </div>
                )}
              </div>

              <div className="experience-preview__highlight-list">
                {visibleHighlights.length >
                0 ? (
                  visibleHighlights.map(
                    (highlight, index) => {
                      const HighlightIcon =
                        getHighlightIcon(
                          highlight.icon,
                        );

                      return (
                        <article
                          className="experience-preview__highlight"
                          key={highlight.id}
                        >
                          <span className="experience-preview__highlight-number">
                            {String(
                              index + 1,
                            ).padStart(2, "0")}
                          </span>

                          <span className="experience-preview__highlight-icon">
                            <HighlightIcon
                              size={22}
                              aria-hidden="true"
                            />
                          </span>

                          <div className="experience-preview__highlight-content">
                            <h3>
                              {highlight.title}
                            </h3>

                            <p>
                              {
                                highlight.description
                              }
                            </p>
                          </div>
                        </article>
                      );
                    },
                  )
                ) : (
                  <div className="experience-preview__highlights-empty">
                    <Sparkles
                      size={24}
                      aria-hidden="true"
                    />

                    <p>
                      Experience highlights will
                      be added soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        {!isLoading &&
          !error &&
          hasExperienceContent && (
            <footer className="experience-preview__footer">
              {isExternalAction ? (
                <a
                  className="experience-preview__button"
                  href={actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {actionContent}
                </a>
              ) : (
                <Link
                  className="experience-preview__button"
                  to={actionUrl}
                >
                  {actionContent}
                </Link>
              )}
            </footer>
          )}
      </div>
    </section>
  );
}

export default ExperiencePreviewSection;