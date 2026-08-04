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

import gallery1 from "../../../assets/gallery-1.jpg";
import gallery2 from "../../../assets/gallery-2.jpg";
import gallery3 from "../../../assets/gallery-3.jpg";
import gallery4 from "../../../assets/gallery-4.jpg";
import gallery5 from "../../../assets/gallery-5.jpg";

import "./experience-preview.css";

const MAX_PREVIEW_HIGHLIGHTS = 6;

type ExperienceCardClass =
  | "experience-preview-card--large"
  | "experience-preview-card--standard"
  | "experience-preview-card--tall"
  | "experience-preview-card--wide";

type PreviewExperience = {
  id: number | string;
  number: string;
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  className: ExperienceCardClass;
};

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

const DEFAULT_IMAGES = [
  gallery1,
  gallery4,
  gallery2,
  gallery5,
  gallery3,
  gallery1,
];

const CARD_CLASSES: ExperienceCardClass[] = [
  "experience-preview-card--large",
  "experience-preview-card--standard",
  "experience-preview-card--tall",
  "experience-preview-card--standard",
  "experience-preview-card--wide",
  "experience-preview-card--standard",
];

const DEFAULT_EXPERIENCES: PreviewExperience[] = [
  {
    id: "default-live-music",
    number: "01",
    title: "Live Music",
    description:
      "International DJs, powerful sound, and unforgettable performances beneath the stars.",
    image: gallery1,
    icon: Music2,
    className:
      "experience-preview-card--large",
  },
  {
    id: "default-waterfalls",
    number: "02",
    title: "Waterfalls",
    description:
      "Dance beside the iconic waterfalls of Koh Phangan surrounded by tropical nature.",
    image: gallery4,
    icon: Waves,
    className:
      "experience-preview-card--standard",
  },
  {
    id: "default-fire-shows",
    number: "03",
    title: "Fire Shows",
    description:
      "Spectacular fire performances that light up the jungle throughout the night.",
    image: gallery2,
    icon: Flame,
    className:
      "experience-preview-card--tall",
  },
  {
    id: "default-jungle",
    number: "04",
    title: "Jungle Atmosphere",
    description:
      "Immersive lights, tropical trees, music, and unforgettable island energy.",
    image: gallery5,
    icon: Trees,
    className:
      "experience-preview-card--standard",
  },
  {
    id: "default-food",
    number: "05",
    title: "Food & Drinks",
    description:
      "Thai food, fresh fruit, cold drinks, cocktails, and festival favourites.",
    image: gallery3,
    icon: Martini,
    className:
      "experience-preview-card--wide",
  },
  {
    id: "default-vip",
    number: "06",
    title: "VIP Experience",
    description:
      "Premium areas, exclusive bars, comfortable spaces, and priority access.",
    image: gallery1,
    icon: Star,
    className:
      "experience-preview-card--standard",
  },
];

const ICON_MAP: Record<string, LucideIcon> = {
  music: Music2,
  music2: Music2,
  dj: Music2,

  waterfall: Waves,
  waterfalls: Waves,
  waves: Waves,

  flame: Flame,
  fire: Flame,
  fireshow: Flame,
  fireshows: Flame,

  jungle: Trees,
  trees: Trees,
  nature: Trees,

  food: Martini,
  drink: Martini,
  drinks: Martini,
  martini: Martini,

  vip: Star,
  star: Star,
  premium: Star,
};

function normalizeIconName(
  iconName: string,
): string {
  return iconName
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function getHighlightIcon(
  iconName?: string | null,
): LucideIcon {
  if (!iconName) {
    return Sparkles;
  }

  return (
    ICON_MAP[
      normalizeIconName(iconName)
    ] ?? Sparkles
  );
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return "Unable to load the festival experience.";
  }

  const apiError = error as ApiError;

  const responseMessage =
    apiError.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(" ");
  }

  if (
    typeof responseMessage === "string"
  ) {
    return responseMessage;
  }

  if (
    typeof apiError.message === "string"
  ) {
    return apiError.message;
  }

  return "Unable to load the festival experience.";
}

function getVisibleHighlights(
  page: ExperiencePage,
): ExperienceHighlight[] {
  return [...(page.highlights ?? [])]
    .filter(
      (highlight) =>
        highlight.isVisible !== false,
    )
    .sort(
      (firstHighlight, secondHighlight) =>
        (firstHighlight.sortOrder ?? 0) -
        (secondHighlight.sortOrder ?? 0),
    )
    .slice(0, MAX_PREVIEW_HIGHLIGHTS);
}

function getVisibleImages(
  page: ExperiencePage,
): ExperienceImage[] {
  return [...(page.images ?? [])]
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
        return firstImage.isFeatured
          ? -1
          : 1;
      }

      return (
        (firstImage.sortOrder ?? 0) -
        (secondImage.sortOrder ?? 0)
      );
    });
}

function createPreviewExperiences(
  page: ExperiencePage,
): PreviewExperience[] {
  const highlights =
    getVisibleHighlights(page);

  const images = getVisibleImages(page);

  if (highlights.length === 0) {
    return DEFAULT_EXPERIENCES;
  }

  return highlights.map(
    (highlight, index) => ({
      id: highlight.id,
      number: String(index + 1).padStart(
        2,
        "0",
      ),
      title: highlight.title,
      description:
        highlight.description,
      image:
        images[index]?.imageUrl ||
        images[index % images.length]
          ?.imageUrl ||
        DEFAULT_IMAGES[
          index % DEFAULT_IMAGES.length
        ],
      icon: getHighlightIcon(
        highlight.icon,
      ),
      className:
        CARD_CLASSES[
          index % CARD_CLASSES.length
        ],
    }),
  );
}

function ExperiencePreviewSection() {
  const [
    experiencePage,
    setExperiencePage,
  ] = useState<ExperiencePage | null>(
    null,
  );

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

  const experiences = useMemo(
    () =>
      experiencePage
        ? createPreviewExperiences(
            experiencePage,
          )
        : DEFAULT_EXPERIENCES,
    [experiencePage],
  );

  const eyebrow =
    experiencePage?.heroBadge?.trim() ||
    "The Festival Experience";

  const title =
    experiencePage?.heroTitle?.trim() ||
    "More than a festival.";

  const subtitle =
    experiencePage?.heroSubtitle?.trim() ||
    "A world of its own.";

  const description =
    experiencePage?.heroDescription?.trim() ||
    "Discover music, waterfalls, fire, lights, food, and tropical island energy in one unforgettable night.";

  const buttonText =
    experiencePage?.buttonText?.trim() ||
    "Explore the experience";

  const buttonUrl =
    experiencePage?.buttonUrl?.trim() ||
    "/experience";

  const isExternalButton =
    /^https?:\/\//i.test(buttonUrl);

  const buttonContent = (
    <>
      {buttonText}

      <ArrowRight
        size={17}
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

        <div className="experience-preview__glow experience-preview__glow--one" />

        <div className="experience-preview__glow experience-preview__glow--two" />
      </div>

      <div className="experience-preview__container">
        <header className="experience-preview__header">
          <div className="experience-preview__header-content">
            <div className="experience-preview__eyebrow">
              <Sparkles size={14} />

              <span>{eyebrow}</span>
            </div>

            <h2
              id="experience-preview-title"
              className="experience-preview__title"
            >
              {title}

              <span>{subtitle}</span>
            </h2>
          </div>

          <div className="experience-preview__header-side">
            <p className="experience-preview__description">
              {description}
            </p>

            <Link
              className="experience-preview__header-link"
              to="/experience"
            >
              Explore everything

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </header>

        {isLoading && (
          <div
            className="experience-preview__grid"
            aria-label="Loading festival experience"
          >
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className={[
                  "experience-preview-card",
                  "experience-preview-card--skeleton",
                  CARD_CLASSES[index],
                ].join(" ")}
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div
            className="experience-preview__state experience-preview__state--error"
            role="alert"
          >
            <span className="experience-preview__state-icon">
              <Sparkles
                size={23}
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

        {!isLoading && !error && (
          <div className="experience-preview__grid">
            {experiences.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className={`experience-preview-card ${item.className}`}
                  key={item.id}
                >
                  <img
                    className="experience-preview-card__image"
                    src={item.image}
                    alt=""
                    loading="lazy"
                  />

                  <div
                    className="experience-preview-card__overlay"
                    aria-hidden="true"
                  />

                  <div className="experience-preview-card__top">
                    <span className="experience-preview-card__number">
                      {item.number}
                    </span>

                    <span className="experience-preview-card__icon">
                      <Icon
                        size={18}
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <div className="experience-preview-card__content">
                    <h3>{item.title}</h3>

                    <p>
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && !error && (
          <footer className="experience-preview__footer">
            {isExternalButton ? (
              <a
                className="experience-preview__button"
                href={buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {buttonContent}
              </a>
            ) : (
              <Link
                className="experience-preview__button"
                to={buttonUrl}
              >
                {buttonContent}
              </Link>
            )}
          </footer>
        )}
      </div>
    </section>
  );
}

export default ExperiencePreviewSection;