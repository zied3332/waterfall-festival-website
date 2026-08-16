import {
  ArrowDown,
  ExternalLink,
} from "lucide-react";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import TicketsPreviewSection from "../components/tickets/TicketsPreviewSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import eventPoster from "../../assets/water19.png";

import "./style/home.css";

const EVENTPOP_URL =
  "https://www.eventpop.me/e/166443";

function Home() {
  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival Koh Phangan";

  const eventsEnabled =
    settings?.eventsPageEnabled ??
    true;

  const ticketsEnabled =
    settings?.ticketsPageEnabled ??
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
    ticketsEnabled ||
    experienceEnabled ||
    faqEnabled;

  const firstSectionId =
    eventsEnabled
      ? "upcoming-events"
      : galleryEnabled
        ? "festival-reels"
        : ticketsEnabled
          ? "tickets-preview"
          : experienceEnabled
            ? "experience-preview"
            : faqEnabled
              ? "faq-preview"
              : null;

  return (
    <>
      <section
        className="home-hero"
        aria-label={`${festivalName} upcoming event`}
      >
        <div
          className="home-hero__ambient"
          aria-hidden="true"
        >
          <img
            src={eventPoster}
            alt=""
            className="home-hero__ambient-image"
          />

          <div className="home-hero__ambient-overlay" />
        </div>

        <div
          className="home-hero__glow home-hero__glow--purple"
          aria-hidden="true"
        />

        <div
          className="home-hero__glow home-hero__glow--cyan"
          aria-hidden="true"
        />

        <div className="home-hero__container">
          <div className="home-hero__poster-wrapper">
            <a
              href={EVENTPOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="home-hero__poster-link"
              aria-label="View Waterfall Festival event and tickets on Eventpop"
            >
              <img
                src={eventPoster}
                alt="Waterfall Festival, Wednesday 19 August 2026, Koh Phangan"
                className="home-hero__poster"
              />

              <span className="home-hero__poster-action">
                <span>
                  View Event & Tickets
                </span>

                <ExternalLink
                  size={16}
                  aria-hidden="true"
                />
              </span>
            </a>

            <p className="home-hero__poster-hint">
              Tap the poster to view the
              official event and tickets
            </p>
          </div>
        </div>

        {hasHomepageSections &&
          firstSectionId && (
            <a
              href={`#${firstSectionId}`}
              className="home-hero__scroll"
              aria-label="Continue to homepage content"
            >
              <span>
                Discover More
              </span>

              <div aria-hidden="true">
                <ArrowDown size={17} />
              </div>
            </a>
          )}
      </section>

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

      {ticketsEnabled && (
        <div id="tickets-preview">
          <TicketsPreviewSection />
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