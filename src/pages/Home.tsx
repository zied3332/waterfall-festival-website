import { Link } from "react-router-dom";
import { ArrowDown, CalendarDays, Images, Sparkles, Ticket } from "lucide-react";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import PremiumExperiencesSection from "../components/home/PremiumExperiencesSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import "./style/home.css";

function Home() {
  const { settings } = useWebsiteSettings();

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
    settings?.eventsPageEnabled ?? true;

  const experienceEnabled =
    settings?.experiencePageEnabled ?? true;

  const galleryEnabled =
    settings?.galleryPageEnabled ?? true;

  const faqEnabled =
    settings?.faqPageEnabled ?? true;

  /*
   * ============================================================
   * FIRST SECTION AFTER REELS
   * ============================================================
   */

  const nextSectionId = eventsEnabled
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
       * FESTIVAL REELS
       *
       * The homepage now opens directly with real festival media.
       * No popup.
       * No event poster hero.
       * ============================================================
       */}

      {galleryEnabled ? (
        <section
          className="home-media-opening"
          aria-label={`${festivalName} festival experience`}
        >
          {/*
           * Small overlay introducing the festival.
           * The actual photos/videos remain the visual focus.
           */}
          <div className="home-media-opening__intro">
            <div className="home-media-opening__eyebrow">
              <span
                className="home-media-opening__line"
                aria-hidden="true"
              />

              <Sparkles
                size={14}
                aria-hidden="true"
              />

              <span>{tagline}</span>

              <Sparkles
                size={14}
                aria-hidden="true"
              />

              <span
                className="home-media-opening__line"
                aria-hidden="true"
              />
            </div>

            <h1 className="home-media-opening__title">
              {festivalName}
            </h1>

            <p className="home-media-opening__subtitle">
              Feel the energy.
              <span> Live the moment.</span>
            </p>

            <div className="home-media-opening__actions">
              {eventsEnabled && (
                <a
                  href="#upcoming-events"
                  className="home-media-opening__button home-media-opening__button--primary"
                >
                  <Ticket
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    Explore Events
                  </span>
                </a>
              )}

              <Link
                to="/gallery"
                className="home-media-opening__button home-media-opening__button--secondary"
              >
                <Images
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  View Gallery
                </span>
              </Link>
            </div>
          </div>

          {/*
           * Existing reels component.
           * This is now the first major visual content users see.
           */}
          <div
            id="festival-reels"
            className="home-media-opening__reels"
          >
            <FestivalReelsSection />
          </div>

          {nextSectionId && (
            <a
              href={`#${nextSectionId}`}
              className="home-media-opening__scroll"
              aria-label="Continue down the homepage"
            >
              <span>
                Discover More
              </span>

              <ArrowDown
                size={17}
                aria-hidden="true"
              />
            </a>
          )}
        </section>
      ) : (
        /*
         * Fallback if gallery/reels are disabled from settings.
         */
        <section className="home-simple-opening">
          <div className="home-simple-opening__content">
            <div className="home-simple-opening__eyebrow">
              <Sparkles
                size={15}
                aria-hidden="true"
              />

              <span>{tagline}</span>

              <Sparkles
                size={15}
                aria-hidden="true"
              />
            </div>

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
       *
       * Events now come immediately after the visual experience.
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