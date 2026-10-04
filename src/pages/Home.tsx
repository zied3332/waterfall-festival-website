import {
  ArrowDown,
  CalendarDays,
} from "lucide-react";

import {
  useWebsiteSettings,
} from "../context/WebsiteSettingsContext";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import PremiumExperiencesSection from "../components/home/PremiumExperiencesSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import "./style/home.css";

function Home() {
  const { settings } =
    useWebsiteSettings();

  /*
   * ============================================================
   * WEBSITE SETTINGS
   * ============================================================
   */

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival";

  const tagline =
    settings?.tagline?.trim() ||
    "Thailand’s Tropical Music Experience";

  const eventsEnabled =
    settings?.eventsPageEnabled ??
    true;

  const experienceEnabled =
    settings?.experiencePageEnabled ??
    true;

  const galleryEnabled =
    settings?.galleryPageEnabled ??
    true;

  const faqEnabled =
    settings?.faqPageEnabled ??
    true;

  /*
   * ============================================================
   * FIRST SECTION AFTER OPENING
   * ============================================================
   */

  const nextSectionId =
    eventsEnabled
      ? "upcoming-events"
      : galleryEnabled
        ? "gallery-preview"
        : experienceEnabled
          ? "experience-preview"
          : faqEnabled
            ? "faq-preview"
            : null;

  return (
    <>
      {/*
       * ============================================================
       * REELS — FIRST THING ON THE HOMEPAGE
       * ============================================================
       *
       * The user sees festival videos immediately.
       * No large hero appears before them.
       * ============================================================
       */}

      {galleryEnabled ? (
        <section
          className="home-reels-opening"
          aria-label={`${festivalName} festival moments`}
        >
          <div
            id="festival-reels"
            className="home-reels-opening__reels"
          >
            <FestivalReelsSection />
          </div>

          {/*
           * Small festival identity shown AFTER the reels.
           */}

          <div className="home-reels-opening__identity">
            <span className="home-reels-opening__tagline">
              {tagline}
            </span>

            <h1>
              {festivalName}
            </h1>

            <p>
              Koh Phangan, Thailand
            </p>
          </div>

          {nextSectionId && (
            <a
              href={`#${nextSectionId}`}
              className="home-reels-opening__scroll"
              aria-label="Continue down the homepage"
            >
              <span>
                Discover More
              </span>

              <ArrowDown
                size={15}
                aria-hidden="true"
              />
            </a>
          )}
        </section>
      ) : (
        /*
         * ============================================================
         * FALLBACK
         * ============================================================
         *
         * Used only if gallery/reels are disabled in settings.
         * ============================================================
         */

        <section className="home-simple-opening">
          <div className="home-simple-opening__content">
            <span className="home-simple-opening__eyebrow">
              {tagline}
            </span>

            <h1>
              {festivalName}
            </h1>

            <p>
              More Than a Festival

              <span>
                A Once in a Lifetime Memory
              </span>
            </p>

            {eventsEnabled && (
              <a
                href="#upcoming-events"
                className="home-simple-opening__button"
              >
                <CalendarDays
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  Explore Upcoming Events
                </span>
              </a>
            )}
          </div>
        </section>
      )}

      {/*
       * ============================================================
       * UPCOMING EVENTS
       * ============================================================
       */}

      {eventsEnabled && (
        <div
          id="upcoming-events"
          className="home-section-anchor"
        >
          <UpcomingEventsSection />
        </div>
      )}

      {/*
       * ============================================================
       * PREMIUM EXPERIENCES
       * ============================================================
       */}

      <div
        id="premium-experiences"
        className="home-section-anchor"
      >
        <PremiumExperiencesSection />
      </div>

      {/*
       * ============================================================
       * GALLERY
       * ============================================================
       */}

      {galleryEnabled && (
        <div
          id="gallery-preview"
          className="home-section-anchor"
        >
          <GalleryPreviewSection />
        </div>
      )}

      {/*
       * ============================================================
       * EXPERIENCE
       * ============================================================
       */}

      {experienceEnabled && (
        <div
          id="experience-preview"
          className="home-section-anchor"
        >
          <ExperiencePreviewSection />
        </div>
      )}

      {/*
       * ============================================================
       * FAQ
       * ============================================================
       */}

      {faqEnabled && (
        <div
          id="faq-preview"
          className="home-section-anchor"
        >
          <FAQPreviewSection />
        </div>
      )}
    </>
  );
}

export default Home;