import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import eventPoster from "../../assets/waterfall-august-30-2026.png";

import "./style/home.css";

const EVENTPOP_URL =
  "https://www.eventpop.me/e/163685";

/*
 * Waterfall Festival
 * 30 August 2026
 * 9:00 PM Thailand time
 */
const EVENT_START_TIME =
  new Date(
    "2026-08-30T21:00:00+07:00",
  ).getTime();

type CountdownTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasStarted: boolean;
};

function getCountdown(): CountdownTime {
  const difference =
    EVENT_START_TIME - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hasStarted: true,
    };
  }

  const days = Math.floor(
    difference /
      (1000 * 60 * 60 * 24),
  );

  const hours = Math.floor(
    (difference /
      (1000 * 60 * 60)) %
      24,
  );

  const minutes = Math.floor(
    (difference /
      (1000 * 60)) %
      60,
  );

  const seconds = Math.floor(
    (difference / 1000) %
      60,
  );

  return {
    days,
    hours,
    minutes,
    seconds,
    hasStarted: false,
  };
}

function Home() {
  const { settings } =
    useWebsiteSettings();

  const [
    isEventPopupOpen,
    setIsEventPopupOpen,
  ] = useState(true);

  const [
    countdown,
    setCountdown,
  ] = useState<CountdownTime>(
    getCountdown,
  );

  /*
   * Update countdown every second.
   */
  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        setCountdown(
          getCountdown(),
        );
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, []);

  /*
   * Prevent page scrolling while
   * the promotional popup is open.
   */
  useEffect(() => {
    if (!isEventPopupOpen) {
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
  }, [isEventPopupOpen]);

  /*
   * Escape closes the popup.
   */
  useEffect(() => {
    if (!isEventPopupOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsEventPopupOpen(
          false,
        );
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
  }, [isEventPopupOpen]);

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
      {/* =========================
          Event countdown popup
      ========================= */}

      {isEventPopupOpen && (
        <div
          className="event-popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-popup-title"
          onClick={() =>
            setIsEventPopupOpen(
              false,
            )
          }
        >
          <div
            className="event-popup__card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="event-popup__close"
              onClick={() =>
                setIsEventPopupOpen(
                  false,
                )
              }
              aria-label="Close event announcement"
            >
              <X
                size={20}
                aria-hidden="true"
              />
            </button>

            <div className="event-popup__content">
              {/* =====================
                  Festival label
              ===================== */}

              <div className="event-popup__festival-label">
                <span
                  className="event-popup__label-line"
                  aria-hidden="true"
                />

                <Sparkles
                  size={14}
                  aria-hidden="true"
                />

                <span>
                  Waterfall Festival
                </span>

                <Sparkles
                  size={14}
                  aria-hidden="true"
                />

                <span
                  className="event-popup__label-line"
                  aria-hidden="true"
                />
              </div>

              {/* =====================
                  Next event heading
              ===================== */}

              <p className="event-popup__coming">
                Get Ready For The
              </p>

              <h2
                id="event-popup-title"
                className="event-popup__title"
              >
                <>
                  Next
                  <span>
                    Event
                  </span>
                </>
              </h2>

              {/* =====================
                  Event details
              ===================== */}

              <div className="event-popup__event-info">
                <span>
                  <CalendarDays
                    size={15}
                    aria-hidden="true"
                  />

                  30 August
                </span>

                <span
                  className="event-popup__info-dot"
                  aria-hidden="true"
                />

                <span>
                  <MapPin
                    size={15}
                    aria-hidden="true"
                  />

                  Koh Phangan
                </span>

                <span
                  className="event-popup__info-dot"
                  aria-hidden="true"
                />

                <span>
                  <Clock3
                    size={15}
                    aria-hidden="true"
                  />

                  9 PM
                </span>
              </div>

              {/* =====================
                  Countdown
              ===================== */}

              {!countdown.hasStarted ? (
                <>
                  <p className="event-popup__countdown-label">
                    The next experience
                    begins in
                  </p>

                  <div className="event-popup__countdown">
                    <div className="event-popup__countdown-item">
                      <strong>
                        {String(
                          countdown.days,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>

                      <span>
                        Days
                      </span>
                    </div>

                    <span
                      className="event-popup__separator"
                      aria-hidden="true"
                    >
                      :
                    </span>

                    <div className="event-popup__countdown-item">
                      <strong>
                        {String(
                          countdown.hours,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>

                      <span>
                        Hours
                      </span>
                    </div>

                    <span
                      className="event-popup__separator"
                      aria-hidden="true"
                    >
                      :
                    </span>

                    <div className="event-popup__countdown-item">
                      <strong>
                        {String(
                          countdown.minutes,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>

                      <span>
                        Min
                      </span>
                    </div>

                    <span
                      className="event-popup__separator"
                      aria-hidden="true"
                    >
                      :
                    </span>

                    <div className="event-popup__countdown-item">
                      <strong>
                        {String(
                          countdown.seconds,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>

                      <span>
                        Sec
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="event-popup__live">
                  The event has started
                </div>
              )}

              {/* =====================
                  Special offer
              ===================== */}

              <div className="event-popup__special-offer">
                <span
                  className="event-popup__offer-line"
                  aria-hidden="true"
                />

                <span>
                  ✦ Special Event Offer ✦
                </span>

                <span
                  className="event-popup__offer-line"
                  aria-hidden="true"
                />
              </div>

              <a
                href={EVENTPOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="event-popup__ticket-button"
              >
                <Ticket
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  Get Special Offer Ticket
                </span>

                <span
                  className="event-popup__ticket-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>

              <button
                type="button"
                className="event-popup__continue"
                onClick={() =>
                  setIsEventPopupOpen(
                    false,
                  )
                }
              >
                Continue to website
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          Homepage hero
      ========================= */}

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
                    30 August 2026
                  </strong>

                  <span>
                    Sunday
                  </span>
                </div>
              </div>

              <a
                href="https://share.google/9QxAyS1iVMSWES0X7"
                target="_blank"
                rel="noopener noreferrer"
                className="home-event-hero__meta-item"
                aria-label="Open Waterfall Festival location in Google Maps"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
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
              </a>

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
                alt="Waterfall Festival event poster for Sunday 30 August 2026"
                className="home-event-hero__poster"
              />

              <span
                className="home-event-hero__poster-shine"
                aria-hidden="true"
              />
            </a>
          </div>

          {/* =========================
              Hero buttons
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
          Homepage sections
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

      {galleryEnabled && (
        <div id="gallery-preview">
          <GalleryPreviewSection />
        </div>
      )}

      {experienceEnabled && (
        <div id="experience-preview">
          <ExperiencePreviewSection />
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