import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  CalendarDays,
  Clock3,
  ImageOff,
  MapPin,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

import {
  useWebsiteSettings,
} from "../context/WebsiteSettingsContext";

import {
  getHomepageEvent,
} from "../services/events.service";

import {
  getApiMediaUrl,
} from "../services/api.service";

import type {
  Event,
} from "../types/event";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import PremiumExperiencesSection from "../components/home/PremiumExperiencesSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import "./style/home.css";

const FESTIVAL_TIME_ZONE =
  "Asia/Bangkok";

const WATERFALL_MAP_URL =
  "https://share.google/9QxAyS1iVMSWES0X7";

const BIRTHDAY_MONTH =
  new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      timeZone:
        FESTIVAL_TIME_ZONE,
    },
  ).format(new Date());

type CountdownTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasStarted: boolean;
};

const EMPTY_COUNTDOWN: CountdownTime = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  hasStarted: false,
};

function getCountdown(
  eventDate?: string | null,
): CountdownTime {
  if (!eventDate) {
    return EMPTY_COUNTDOWN;
  }

  const eventStartTime =
    new Date(
      eventDate,
    ).getTime();

  if (
    Number.isNaN(
      eventStartTime,
    )
  ) {
    return EMPTY_COUNTDOWN;
  }

  const difference =
    eventStartTime -
    Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hasStarted: true,
    };
  }

  const days =
    Math.floor(
      difference /
        (
          1000 *
          60 *
          60 *
          24
        ),
    );

  const hours =
    Math.floor(
      (
        difference /
        (
          1000 *
          60 *
          60
        )
      ) %
        24,
    );

  const minutes =
    Math.floor(
      (
        difference /
        (
          1000 *
          60
        )
      ) %
        60,
    );

  const seconds =
    Math.floor(
      (
        difference /
        1000
      ) %
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

function getEventDate(
  value?: string | null,
): Date | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function formatEventDate(
  value?: string | null,
): string {
  const date =
    getEventDate(value);

  if (!date) {
    return "Upcoming Event";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    },
  ).format(date);
}

function formatPopupDate(
  value?: string | null,
): string {
  const date =
    getEventDate(value);

  if (!date) {
    return "Upcoming";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,

      day:
        "numeric",

      month:
        "long",
    },
  ).format(date);
}

function formatWeekday(
  value?: string | null,
): string {
  const date =
    getEventDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,

      weekday:
        "long",
    },
  ).format(date);
}

function formatEventTime(
  value?: string | null,
): string {
  const date =
    getEventDate(value);

  if (!date) {
    return "9 PM";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        FESTIVAL_TIME_ZONE,

      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
    },
  )
    .format(date)
    .replace(
      ":00",
      "",
    );
}

function getShortLocation(
  location?: string | null,
): string {
  if (!location?.trim()) {
    return "Koh Phangan";
  }

  const firstPart =
    location
      .split(",")[0]
      ?.trim();

  return (
    firstPart ||
    location.trim()
  );
}

function Home() {
  const { settings } =
    useWebsiteSettings();

  const [
    mainEvent,
    setMainEvent,
  ] =
    useState<Event | null>(
      null,
    );

  const [
    isMainEventLoading,
    setIsMainEventLoading,
  ] =
    useState(true);

  /*
   * We no longer keep a hardcoded September 24
   * poster as a fallback.
   *
   * If the selected event's poster fails,
   * posterFailed becomes true and we show a
   * neutral placeholder instead.
   */
  const [
    posterFailed,
    setPosterFailed,
  ] =
    useState(false);

  const [
    isEventPopupOpen,
    setIsEventPopupOpen,
  ] =
    useState(false);

  const [
    countdown,
    setCountdown,
  ] =
    useState<CountdownTime>(
      EMPTY_COUNTDOWN,
    );

  /*
   * ============================================================
   * LOAD MAIN EVENT
   * ============================================================
   */

  useEffect(() => {
    let isMounted =
      true;

    async function loadMainEvent() {
      try {
        setIsMainEventLoading(
          true,
        );

        const response =
          await getHomepageEvent();

        if (!isMounted) {
          return;
        }

        setMainEvent(
          response.event,
        );

        setPosterFailed(
          false,
        );

        setIsEventPopupOpen(
          Boolean(
            response.event,
          ),
        );
      } catch (error) {
        console.error(
          "Could not load homepage main event.",
          error,
        );

        if (!isMounted) {
          return;
        }

        setMainEvent(
          null,
        );

        setPosterFailed(
          false,
        );

        setIsEventPopupOpen(
          false,
        );
      } finally {
        if (isMounted) {
          setIsMainEventLoading(
            false,
          );
        }
      }
    }

    void loadMainEvent();

    return () => {
      isMounted =
        false;
    };
  }, []);

  /*
   * Whenever the Main Event changes,
   * allow its new poster to load.
   */
  useEffect(() => {
    setPosterFailed(
      false,
    );
  }, [
    mainEvent?.id,
    mainEvent?.heroImageUrl,
  ]);

  /*
   * ============================================================
   * COUNTDOWN
   * ============================================================
   */

  useEffect(() => {
    if (!mainEvent?.date) {
      setCountdown(
        EMPTY_COUNTDOWN,
      );

      return;
    }

    function updateCountdown() {
      setCountdown(
        getCountdown(
          mainEvent?.date,
        ),
      );
    }

    updateCountdown();

    const intervalId =
      window.setInterval(
        updateCountdown,
        1000,
      );

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [
    mainEvent?.date,
  ]);

  /*
   * ============================================================
   * POPUP SCROLL LOCK
   * ============================================================
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
  }, [
    isEventPopupOpen,
  ]);

  /*
   * ============================================================
   * ESCAPE CLOSES POPUP
   * ============================================================
   */

  useEffect(() => {
    if (!isEventPopupOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
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
  }, [
    isEventPopupOpen,
  ]);

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

  const websiteLocation =
    settings?.location?.trim() ||
    "Koh Phangan, Thailand";

  const eventLocation =
    mainEvent?.location?.trim() ||
    websiteLocation;

  const shortEventLocation =
    getShortLocation(
      eventLocation,
    );

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

  /*
   * ============================================================
   * MAIN EVENT VALUES
   * ============================================================
   */

  const eventDateLabel =
    formatEventDate(
      mainEvent?.date,
    );

  const popupDateLabel =
    formatPopupDate(
      mainEvent?.date,
    );

  const eventWeekday =
    formatWeekday(
      mainEvent?.date,
    );

  const eventTimeLabel =
    formatEventTime(
      mainEvent?.date,
    );

  const ticketUrl =
    mainEvent?.ticketPurchaseUrl?.trim() ||
    null;

  const posterUrl =
    getApiMediaUrl(
      mainEvent?.heroImageUrl,
    );

  const hasWorkingPoster =
    Boolean(
      posterUrl,
    ) &&
    !posterFailed;

  const posterAlt =
    useMemo(
      () =>
        mainEvent
          ? `${mainEvent.title} event poster for ${eventDateLabel}`
          : `${festivalName} event poster`,
      [
        mainEvent,
        eventDateLabel,
        festivalName,
      ],
    );

  /*
   * ============================================================
   * POSTER
   * ============================================================
   */

  const posterContent =
    hasWorkingPoster &&
    posterUrl ? (
      <>
        <img
          key={`${mainEvent?.id ?? "event"}-${posterUrl}`}
          src={
            posterUrl
          }
          alt={
            posterAlt
          }
          className="home-event-hero__poster"
          onError={() => {
            console.warn(
              "Main event poster could not be loaded:",
              posterUrl,
            );

            setPosterFailed(
              true,
            );
          }}
        />

        <span
          className="home-event-hero__poster-shine"
          aria-hidden="true"
        />
      </>
    ) : (
      <div
        className="home-event-hero__poster home-event-hero__poster--missing"
        role="img"
        aria-label={
          posterAlt
        }
        style={{
          display:
            "flex",
          flexDirection:
            "column",
          alignItems:
            "center",
          justifyContent:
            "center",
          gap:
            "14px",
          minHeight:
            "420px",
          textAlign:
            "center",
          padding:
            "32px",
        }}
      >
        <ImageOff
          size={42}
          aria-hidden="true"
        />

        <strong>
          {mainEvent?.title ||
            festivalName}
        </strong>

        <span>
          {
            eventDateLabel
          }
        </span>
      </div>
    );

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/*
       * ========================================================
       * MAIN EVENT POPUP
       * ========================================================
       */}

      {isEventPopupOpen &&
        mainEvent && (
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
              onClick={(
                event,
              ) =>
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
                    {festivalName}
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

                <p className="event-popup__coming">
                  Get Ready For The
                </p>

                <h2
                  id="event-popup-title"
                  className="event-popup__title"
                >
                  Next

                  <span>
                    Event
                  </span>
                </h2>

                <div className="event-popup__event-info">
                  <span>
                    <CalendarDays
                      size={15}
                      aria-hidden="true"
                    />

                    {
                      popupDateLabel
                    }
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

                    {
                      shortEventLocation
                    }
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

                    {
                      eventTimeLabel
                    }
                  </span>
                </div>

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

                {ticketUrl ? (
                  <a
                    href={
                      ticketUrl
                    }
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
                ) : (
                  <Link
                    to={`/events/${mainEvent.slug}`}
                    className="event-popup__ticket-button"
                    onClick={() =>
                      setIsEventPopupOpen(
                        false,
                      )
                    }
                  >
                    <Ticket
                      size={18}
                      aria-hidden="true"
                    />

                    <span>
                      View Event
                    </span>

                    <span
                      className="event-popup__ticket-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                )}

                <Link
                  to="/birthday-free-entry"
                  className="event-popup__birthday-button"
                  onClick={() =>
                    setIsEventPopupOpen(
                      false,
                    )
                  }
                >
                  <span className="event-popup__birthday-icon">
                    🎂
                  </span>

                  <span className="event-popup__birthday-copy">
                    <small>
                      Born in{" "}
                      {
                        BIRTHDAY_MONTH
                      }
                      ?
                    </small>

                    <strong>
                      Get Free Entry
                    </strong>
                  </span>

                  <span
                    className="event-popup__birthday-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>

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

      {/*
       * ========================================================
       * HOMEPAGE HERO
       * ========================================================
       */}

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
                    {isMainEventLoading
                      ? "Loading event..."
                      : eventDateLabel}
                  </strong>

                  <span>
                    {
                      eventWeekday ||
                      "Waterfall Festival"
                    }
                  </span>
                </div>
              </div>

              <a
                href={
                  WATERFALL_MAP_URL
                }
                target="_blank"
                rel="noopener noreferrer"
                className="home-event-hero__meta-item"
                aria-label="Open Waterfall Festival location in Google Maps"
                style={{
                  color:
                    "inherit",
                  textDecoration:
                    "none",
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
                    {
                      shortEventLocation
                    }
                  </strong>

                  <span>
                    {
                      eventLocation
                    }
                  </span>
                </div>
              </a>

              <div className="home-event-hero__meta-item">
                <span className="home-event-hero__meta-icon">
                  <Clock3
                    size={21}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <strong>
                    {
                      eventTimeLabel
                    }
                  </strong>

                  <span>
                    Thailand Time
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/*
           * ====================================================
           * MAIN EVENT POSTER
           * ====================================================
           */}

          <div className="home-event-hero__poster-wrapper">
            {ticketUrl ? (
              <a
                href={
                  ticketUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="home-event-hero__poster-link"
                aria-label={`Open tickets for ${
                  mainEvent?.title ||
                  festivalName
                }`}
              >
                {
                  posterContent
                }
              </a>
            ) : mainEvent ? (
              <Link
                to={`/events/${mainEvent.slug}`}
                className="home-event-hero__poster-link"
              >
                {
                  posterContent
                }
              </Link>
            ) : (
              <div className="home-event-hero__poster-link">
                {
                  posterContent
                }
              </div>
            )}
          </div>

          {/*
           * ====================================================
           * HERO BUTTONS
           * ====================================================
           */}

          <div className="home-event-hero__actions">
            {ticketUrl ? (
              <a
                href={
                  ticketUrl
                }
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
            ) : mainEvent ? (
              <Link
                to={`/events/${mainEvent.slug}`}
                className="home-event-hero__button home-event-hero__button--primary"
              >
                <Ticket
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  View Event
                </span>
              </Link>
            ) : null}

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

      <PremiumExperiencesSection />

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