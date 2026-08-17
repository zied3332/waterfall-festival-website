import {
  CalendarDays,
  MapPin,
  Sparkles,
  Ticket,
} from "lucide-react";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import eventPoster from "../../assets/waterfall-august-19-2026.png";

import "./style/home.css";

const EVENTPOP_URL =
  "https://www.eventpop.me/e/166443";

function Home() {
  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival";

  const tagline =
    settings?.tagline?.trim() ||
    "Thailand’s Tropical Music Experience";

  const location =
    settings?.location?.trim() ||
    "Koh Phangan, Thailand";

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

  const hasHomepageSections =
    eventsEnabled ||
    galleryEnabled ||
    experienceEnabled ||
    faqEnabled;

  const firstSectionId =
    eventsEnabled
      ? "upcoming-events"
      : galleryEnabled
        ? "festival-reels"
        : experienceEnabled
          ? "experience-preview"
          : faqEnabled
            ? "faq-preview"
            : null;

  return (
    <>
      <section
        className="home-event-hero"
        aria-labelledby="home-event-title"
      >
        <div
          className="home-event-hero__glow home-event-hero__glow--left"
          aria-hidden="true"
        />

        <div
          className="home-event-hero__glow home-event-hero__glow--right"
          aria-hidden="true"
        />

        <div className="home-event-hero__container">
          {/* =========================
              Text above poster
          ========================= */}

          <header className="home-event-hero__header">
            <div className="home-event-hero__eyebrow">
              <span
                className="home-event-hero__eyebrow-line"
                aria-hidden="true"
              />

              <Sparkles
                size={15}
                aria-hidden="true"
              />

              <span>
                {tagline}
              </span>

              <Sparkles
                size={15}
                aria-hidden="true"
              />

              <span
                className="home-event-hero__eyebrow-line"
                aria-hidden="true"
              />
            </div>

            <h1
              id="home-event-title"
              className="home-event-hero__title"
            >
              {festivalName}
            </h1>

            <p className="home-event-hero__tagline">
              More Than a Festival
              <span>
                A Once in a Lifetime Memory
              </span>
            </p>

            <div className="home-event-hero__meta">
              <div className="home-event-hero__meta-item">
                <span className="home-event-hero__meta-icon">
                  <CalendarDays
                    size={21}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <strong>
                    19 August 2026
                  </strong>

                  <span>
                    Wednesday
                  </span>
                </div>
              </div>

              <div className="home-event-hero__meta-item">
                <span className="home-event-hero__meta-icon">
                  <MapPin
                    size={21}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <strong>
                    Koh Phangan
                  </strong>

                  <span>
                    {location}
                  </span>
                </div>
              </div>

              <div className="home-event-hero__meta-item">
                <span className="home-event-hero__meta-icon">
                  <Sparkles
                    size={21}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <strong>
                    4 Stages
                  </strong>

                  <span>
                    One Epic Experience
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* =========================
              Poster
          ========================= */}

          <div className="home-event-hero__poster-wrapper">
            <a
              href={EVENTPOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-event-hero__poster-link"
              aria-label="Open Waterfall Festival tickets on Eventpop"
            >
              <img
                src={eventPoster}
                alt="Waterfall Festival event poster for Wednesday 19 August 2026"
                className="home-event-hero__poster"
              />

              <span
                className="home-event-hero__poster-shine"
                aria-hidden="true"
              />
            </a>
          </div>

          {/* =========================
              Buttons under poster
          ========================= */}

          <div className="home-event-hero__actions">
            <a
              href={EVENTPOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-event-hero__button home-event-hero__button--primary"
            >
              <Ticket
                size={18}
                aria-hidden="true"
              />

              <span>
                Get Your Tickets
              </span>
            </a>

            {hasHomepageSections &&
              firstSectionId && (
                <a
                  href={`#${firstSectionId}`}
                  className="home-event-hero__button home-event-hero__button--secondary"
                >
                  <span>
                    Discover More
                  </span>

                  <span
                    className="home-event-hero__button-arrow"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </a>
              )}
          </div>
        </div>
      </section>

      {/* =========================
          Existing homepage sections
      ========================= */}

      {eventsEnabled && (
        <div id="upcoming-events">
          <UpcomingEventsSection />
        </div>
      )}

      {galleryEnabled && (
        <div id="festival-reels">
          <FestivalReelsSection />
        </div>
      )}

      {experienceEnabled && (
        <div id="experience-preview">
          <ExperiencePreviewSection />
        </div>
      )}

      {galleryEnabled && (
        <div id="gallery-preview">
          <GalleryPreviewSection />
        </div>
      )}

      {faqEnabled && (
        <div id="faq-preview">
          <FAQPreviewSection />
        </div>
      )}
    </>
  );
}

export default Home;