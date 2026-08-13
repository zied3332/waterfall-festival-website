import type { CSSProperties } from "react";

import { Link } from "react-router-dom";

import {
  ArrowDown,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import TicketsPreviewSection from "../components/tickets/TicketsPreviewSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import FestivalReelsSection from "../components/home/FestivalReelsSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";

import logo from "./logo1.png";
import homepageImage from "../../assets/homepage1.jpg";

import "./style/home.css";

function formatFestivalDate(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

function formatFestivalDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const formattedStartDate =
    formatFestivalDate(startDate);

  const formattedEndDate =
    formatFestivalDate(endDate);

  if (
    formattedStartDate &&
    formattedEndDate
  ) {
    return `${formattedStartDate} – ${formattedEndDate}`;
  }

  if (formattedStartDate) {
    return formattedStartDate;
  }

  if (formattedEndDate) {
    return formattedEndDate;
  }

  return "Dates coming soon";
}

function formatFestivalStatus(
  status: string | null | undefined,
): string {
  switch (status) {
    case "LIVE":
      return "Festival Live Now";

    case "FINISHED":
      return "Festival Memories";

    case "UPCOMING":
      return "Upcoming Festival";

    default:
      return "Updates Coming Soon";
  }
}

function getFestivalTitleParts(
  festivalName: string,
): {
  firstLine: string;
  secondLine: string;
} {
  const words = festivalName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return {
      firstLine:
        "Waterfall Festival",
      secondLine:
        "Koh Phangan",
    };
  }

  if (words.length === 1) {
    return {
      firstLine:
        words[0],
      secondLine:
        "Festival",
    };
  }

  const normalizedName =
    words
      .join(" ")
      .toLowerCase();

  if (
    normalizedName.endsWith(
      "koh phangan",
    )
  ) {
    const firstLineWords =
      words.slice(0, -2);

    return {
      firstLine:
        firstLineWords.join(" ") ||
        "Waterfall Festival",

      secondLine:
        words
          .slice(-2)
          .join(" "),
    };
  }

  if (
    normalizedName ===
    "waterfall festival"
  ) {
    return {
      firstLine:
        "Waterfall",

      secondLine:
        "Festival",
    };
  }

  const splitIndex =
    Math.ceil(
      words.length / 2,
    );

  return {
    firstLine:
      words
        .slice(
          0,
          splitIndex,
        )
        .join(" "),

    secondLine:
      words
        .slice(
          splitIndex,
        )
        .join(" "),
  };
}

function Home() {
  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival Koh Phangan";

  const tagline =
    settings?.tagline?.trim() ||
    "Thailand’s Tropical Music Experience";

  const location =
    settings?.location?.trim() ||
    "Koh Phangan, Thailand";

  const venue =
    settings?.venue?.trim() ||
    "";

  const displayedLocation =
    venue &&
    venue.toLowerCase() !==
      location.toLowerCase()
      ? `${venue}, ${location}`
      : location;

  const festivalDates =
    formatFestivalDateRange(
      settings?.startDate,
      settings?.endDate,
    );

  const festivalStatus =
    formatFestivalStatus(
      settings?.festivalStatus,
    );

  const titleParts =
    getFestivalTitleParts(
      festivalName,
    );

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
    ticketsEnabled ||
    experienceEnabled ||
    galleryEnabled ||
    faqEnabled;

  const firstSectionId =
    eventsEnabled
      ? "upcoming-events"
      : ticketsEnabled
        ? "tickets-preview"
        : experienceEnabled
          ? "experience-preview"
          : galleryEnabled
            ? "gallery-preview"
            : faqEnabled
              ? "faq-preview"
              : null;

  const heroStyle = {
    "--home-hero-image":
      `url(${homepageImage})`,
  } as CSSProperties;

  return (
    <>
      <section
        className="home-hero"
        style={heroStyle}
        aria-labelledby="home-hero-title"
      >
        <div
          className="home-hero__background"
          aria-hidden="true"
        />

        <div
          className="home-hero__overlay"
          aria-hidden="true"
        />

        <div
          className="home-hero__glow home-hero__glow--purple"
          aria-hidden="true"
        />

        <div
          className="home-hero__glow home-hero__glow--cyan"
          aria-hidden="true"
        />

        <div className="home-hero__container">
          <div className="home-hero__content">
            <img
              src={logo}
              alt={`${festivalName} logo`}
              className="home-hero__logo"
            />

            <div className="home-hero__eyebrow">
              <span
                className="home-hero__eyebrow-line"
                aria-hidden="true"
              />

              <Sparkles
                size={14}
                aria-hidden="true"
              />

              <span>
                {tagline}
              </span>

              <Sparkles
                size={14}
                aria-hidden="true"
              />

              <span
                className="home-hero__eyebrow-line"
                aria-hidden="true"
              />
            </div>

            <h1
              id="home-hero-title"
              className="home-hero__title"
            >
              {
                titleParts.firstLine
              }

              {titleParts.secondLine && (
                <span>
                  {
                    titleParts.secondLine
                  }
                </span>
              )}
            </h1>

            <p className="home-hero__description">
              Electronic music, fire
              performances and tropical
              energy beneath the
              waterfalls of{" "}
              {location}.
            </p>

            {(
              ticketsEnabled ||
              eventsEnabled
            ) && (
              <div className="home-hero__actions">
                {ticketsEnabled && (
                  <Link
                    to="/tickets"
                    className="home-hero__button home-hero__button--primary"
                  >
                    Get Tickets
                  </Link>
                )}

                {eventsEnabled && (
                  <Link
                    to="/events"
                    className="home-hero__button home-hero__button--secondary"
                  >
                    Explore Events
                  </Link>
                )}
              </div>
            )}

            <div className="home-hero__details">
              <div className="home-hero__detail">
                <div className="home-hero__detail-icon">
                  <MapPin
                    size={18}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>
                    Location
                  </span>

                  <strong
                    title={
                      displayedLocation
                    }
                  >
                    {
                      displayedLocation
                    }
                  </strong>
                </div>
              </div>

              <div className="home-hero__detail">
                <div className="home-hero__detail-icon">
                  <CalendarDays
                    size={18}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>
                    Festival Dates
                  </span>

                  <strong
                    title={
                      festivalDates
                    }
                  >
                    {
                      festivalDates
                    }
                  </strong>
                </div>
              </div>

              <div className="home-hero__detail">
                <div className="home-hero__detail-icon">
                  <Sparkles
                    size={18}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong
                    title={
                      festivalStatus
                    }
                  >
                    {
                      festivalStatus
                    }
                  </strong>
                </div>
              </div>
            </div>
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

              <div
                aria-hidden="true"
              >
                <ArrowDown
                  size={17}
                />
              </div>
            </a>
          )}
      </section>

      {eventsEnabled && (
        <div id="upcoming-events">
          <UpcomingEventsSection />
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
        <div id="festival-reels">
          <FestivalReelsSection />
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