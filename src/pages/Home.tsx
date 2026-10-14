
import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDown,
  CalendarDays,
  Ticket,
  ArrowUpRight,
} from "lucide-react";

import {
  useWebsiteSettings,
} from "../context/WebsiteSettingsContext";

import {
  getHomepageEvent,
} from "../services/events.service";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import PremiumExperiencesSection from "../components/home/PremiumExperiencesSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import "./style/home.css";

/*
 * ============================================================
 * FALLBACK TICKET URL
 * Same fallback used by the Navbar.
 * ============================================================
 */

const FALLBACK_TICKETS_URL =
  "https://www.eventpop.me/e/169991";

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
    "Thailand's Tropical Music Experience";

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
   * MAIN EVENT TICKET LINK
   *
   * Fetches the homepage event from the backend.
   * Uses the same service as the Navbar.
   *
   * When the main event changes in the admin dashboard,
   * the ticket URL updates on the next page load.
   * ============================================================
   */

  const [ticketsUrl, setTicketsUrl] =
    useState<string>(FALLBACK_TICKETS_URL);

  useEffect(() => {
    let isMounted = true;

    async function loadMainEventTicketUrl() {
      try {
        const response =
          await getHomepageEvent();

        if (!isMounted) {
          return;
        }

        const mainEventTicketUrl =
          response.event?.ticketPurchaseUrl?.trim();

        setTicketsUrl(
          mainEventTicketUrl ||
          FALLBACK_TICKETS_URL
        );
      } catch (error) {
        console.error(
          "Could not load main event ticket URL.",
          error
        );

        if (isMounted) {
          setTicketsUrl(
            FALLBACK_TICKETS_URL
          );
        }
      }
    }

    void loadMainEventTicketUrl();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * ============================================================
   * FIRST SECTION AFTER OPENING
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

  /*
   * ============================================================
   * HOMEPAGE
   * ============================================================
   */

  return (
    <>
      {/* ======================================================
          REELS — FIRST SECTION ON HOMEPAGE
          ====================================================== */}

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

          {/* ==================================================
              FESTIVAL IDENTITY + ACTION BUTTONS
              ================================================== */}

          <div className="home-reels-opening__identity">
            <div className="home-reels-opening__identity-copy">
              <span className="home-reels-opening__tagline">
                {tagline}
              </span>

              <h1 className="home-reels-opening__title">
                {festivalName}
              </h1>

              <p className="home-reels-opening__location">
                Koh Phangan, Thailand
              </p>
            </div>

            {/* ================================================
                BUY TICKETS + DISCOVER MORE
                ================================================ */}

            <div className="home-reels-opening__actions">
              <a
                href={ticketsUrl}
                className="home-reels-opening__tickets"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buy tickets for ${festivalName}`}
              >
                <Ticket
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  Buy Tickets
                </span>

                <ArrowUpRight
                  size={15}
                  aria-hidden="true"
                />
              </a>

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
            </div>
          </div>
        </section>
      ) : (
        /* ====================================================
           FALLBACK — WHEN REELS ARE DISABLED
           ==================================================== */

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

            <a
              href={ticketsUrl}
              className="home-simple-opening__button"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Buy tickets for ${festivalName}`}
            >
              <Ticket
                size={18}
                aria-hidden="true"
              />

              <span>
                Buy Tickets
              </span>

              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </a>

            {eventsEnabled && (
              <a
                href="#upcoming-events"
                className="home-simple-opening__events-link"
              >
                <CalendarDays
                  size={17}
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

      {/* ======================================================
          UPCOMING EVENTS
          ====================================================== */}

      {eventsEnabled && (
        <div
          id="upcoming-events"
          className="home-section-anchor"
        >
          <UpcomingEventsSection />
        </div>
      )}

      {/* ======================================================
          PREMIUM EXPERIENCES
          ====================================================== */}

      <div
        id="premium-experiences"
        className="home-section-anchor"
      >
        <PremiumExperiencesSection />
      </div>

      {/* ======================================================
          GALLERY
          ====================================================== */}

      {galleryEnabled && (
        <div
          id="gallery-preview"
          className="home-section-anchor"
        >
          <GalleryPreviewSection />
        </div>
      )}

      {/* ======================================================
          EXPERIENCE
          ====================================================== */}

      {experienceEnabled && (
        <div
          id="experience-preview"
          className="home-section-anchor"
        >
          <ExperiencePreviewSection />
        </div>
      )}

      {/* ======================================================
          FAQ
          ====================================================== */}

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
