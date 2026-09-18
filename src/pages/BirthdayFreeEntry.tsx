import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  BadgeCheck,
  
  CakeSlice,
  Check,
  Clock3,
  Gift,
  IdCard,
  MapPin,
  Send,
  Sparkles,
  Ticket,
} from "lucide-react";

import {
  FaInstagram,
} from "react-icons/fa6";

import {
  Link,
} from "react-router-dom";

import {
  getHomepageEvent,
} from "../services/events.service";

import {
  getApiMediaUrl,
} from "../services/api.service";

import type {
  Event,
} from "../types/event";

import "./style/birthday-free-entry.css";

const INSTAGRAM_URL =
  "https://www.instagram.com/waterfallfestivalphangan/";

const THAILAND_TIME_ZONE =
  "Asia/Bangkok";

function getThailandMonth(): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      timeZone:
        THAILAND_TIME_ZONE,
    },
  ).format(new Date());
}

function formatEventDate(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone:
        THAILAND_TIME_ZONE,
    },
  ).format(new Date(date));
}

function formatEventDay(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      timeZone:
        THAILAND_TIME_ZONE,
    },
  ).format(new Date(date));
}

function formatEventTime(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone:
        THAILAND_TIME_ZONE,
    },
  ).format(new Date(date));
}

function BirthdayFreeEntry() {
  const [
    mainEvent,
    setMainEvent,
  ] = useState<Event | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const birthdayMonth =
    getThailandMonth();

  useEffect(() => {
    let cancelled = false;

    async function loadMainEvent() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getHomepageEvent();

        if (!cancelled) {
          setMainEvent(
            response.event,
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "We couldn't load the main event right now.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMainEvent();

    return () => {
      cancelled = true;
    };
  }, []);

  const posterUrl =
    getApiMediaUrl(
      mainEvent?.heroImageUrl,
    );

  return (
    <div className="birthday-page">
      {/* HERO */}

      <section className="birthday-hero">
        <div
          className="birthday-hero__orb birthday-hero__orb--purple"
          aria-hidden="true"
        />

        <div
          className="birthday-hero__orb birthday-hero__orb--cyan"
          aria-hidden="true"
        />

        <div
          className="birthday-hero__grid"
          aria-hidden="true"
        />

        <div className="birthday-shell birthday-hero__content">
          <div className="birthday-hero__cake">
            <CakeSlice
              size={34}
              aria-hidden="true"
            />
          </div>

          <div className="birthday-kicker">
            <Sparkles
              size={14}
              aria-hidden="true"
            />

            <span>
              Birthday Month Special
            </span>

            <Sparkles
              size={14}
              aria-hidden="true"
            />
          </div>

          <h1 className="birthday-hero__title">
            Born In

            <strong>
              {birthdayMonth}?
            </strong>
          </h1>

          <h2 className="birthday-hero__offer">
            Your Entry Is On Us!
          </h2>

          <p className="birthday-hero__text">
            Celebrate your birthday
            month at Waterfall Festival
            Koh Phangan and enjoy{" "}

            <strong>
              FREE ENTRY
            </strong>{" "}

            when you complete the
            birthday offer steps.
          </p>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="birthday-main-cta"
          >
            <FaInstagram
              size={21}
              aria-hidden="true"
            />

            <span>
              Claim Your Free Entry
            </span>

            <ArrowRight
              size={20}
              aria-hidden="true"
            />
          </a>

          <div className="birthday-hero__note">
            <BadgeCheck
              size={14}
              aria-hidden="true"
            />

            <span>
              Available for guests
              born in {birthdayMonth}
            </span>
          </div>
        </div>
      </section>

      {/* HOW TO CLAIM */}

      <section className="birthday-section birthday-claim-section">
        <div className="birthday-shell">
          <header className="birthday-heading">
            <div className="birthday-heading__eyebrow">
              <span />
              How To Claim
              <span />
            </div>

            <h2>
              Four Simple Steps
            </h2>

            <p>
              Complete the steps and
              wait for confirmation
              from our team.
            </p>
          </header>

          <div className="birthday-claim-grid">
            <article className="birthday-claim-card">
              <span className="birthday-claim-card__number">
                1
              </span>

              <div className="birthday-claim-card__icon birthday-claim-card__icon--pink">
                <FaInstagram
                  size={26}
                  aria-hidden="true"
                />
              </div>

              <h3>
                Follow Us
              </h3>

              <p>
                Follow Waterfall Festival
                on Instagram.
              </p>
            </article>

            <article className="birthday-claim-card">
              <span className="birthday-claim-card__number">
                2
              </span>

              <div className="birthday-claim-card__icon birthday-claim-card__icon--cyan">
                <Send
                  size={25}
                  aria-hidden="true"
                />
              </div>

              <h3>
                Share A Reel
              </h3>

              <p>
                Share any reel from our
                profile to your story
                and tag us.
              </p>
            </article>

            <article className="birthday-claim-card">
              <span className="birthday-claim-card__number">
                3
              </span>

              <div className="birthday-claim-card__icon birthday-claim-card__icon--cyan">
                <IdCard
                  size={27}
                  aria-hidden="true"
                />
              </div>

              <h3>
                Confirm Your Month
              </h3>

              <p>
                Send the requested proof
                of your birth month to
                our Instagram team.
              </p>
            </article>

            <article className="birthday-claim-card">
              <span className="birthday-claim-card__number">
                4
              </span>

              <div className="birthday-claim-card__icon birthday-claim-card__icon--green">
                <Check
                  size={27}
                  aria-hidden="true"
                />
              </div>

              <h3>
                Get Confirmed
              </h3>

              <p>
                Wait for confirmation
                from the Waterfall
                Festival team.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* NEXT EVENT */}

      <section className="birthday-section birthday-next-section">
        <div className="birthday-shell">
          <header className="birthday-heading birthday-heading--left">
            <div className="birthday-heading__eyebrow">
              Next Waterfall
            </div>

            <h2>
              Your Next Chance
              To Celebrate
            </h2>
          </header>

          {loading && (
            <div className="birthday-status-card">
              Loading the next event...
            </div>
          )}

          {!loading &&
            error && (
              <div className="birthday-status-card">
                {error}
              </div>
            )}

          {!loading &&
            !error &&
            !mainEvent && (
              <div className="birthday-status-card">
                The next Waterfall
                Festival date will be
                announced soon.
              </div>
            )}

          {!loading &&
            !error &&
            mainEvent && (
              <article className="birthday-event">
                <div className="birthday-event__info">
                  <div className="birthday-event__label">
                    <Sparkles
                      size={13}
                      aria-hidden="true"
                    />

                    Next Event
                  </div>

                  <h3>
                    {formatEventDate(
                      mainEvent.date,
                    )}
                  </h3>

                  <span className="birthday-event__weekday">
                    {formatEventDay(
                      mainEvent.date,
                    )}
                  </span>

                  <div className="birthday-event__meta">
                    <div>
                      <span className="birthday-event__meta-icon">
                        <MapPin
                          size={17}
                          aria-hidden="true"
                        />
                      </span>

                      <span>
                        <small>
                          Location
                        </small>

                        <strong>
                          Koh Phangan
                        </strong>
                      </span>
                    </div>

                    <div>
                      <span className="birthday-event__meta-icon">
                        <Clock3
                          size={17}
                          aria-hidden="true"
                        />
                      </span>

                      <span>
                        <small>
                          Gate Opens
                        </small>

                        <strong>
                          {formatEventTime(
                            mainEvent.date,
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/events/${mainEvent.slug}`}
                    className="birthday-event__button"
                  >
                    View Event

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                    />
                  </Link>
                </div>

                <Link
                  to={`/events/${mainEvent.slug}`}
                  className="birthday-event__poster"
                  aria-label={`View ${mainEvent.title}`}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={`${mainEvent.title} poster`}
                    />
                  ) : (
                    <div
                      className="birthday-event__poster-placeholder"
                      aria-label={`${mainEvent.title} poster unavailable`}
                    >
                      <Ticket
                        size={34}
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  <span>
                    View Event

                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </article>
            )}
        </div>
      </section>

      {/* OFFER CONDITIONS */}

      <section className="birthday-rules">
        <div className="birthday-shell">
          <div className="birthday-rules__grid">
            <article>
              <div className="birthday-rules__icon">
                <Gift
                  size={22}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h3>
                  Who Qualifies?
                </h3>

                <p>
                  Anyone born in{" "}
                  {birthdayMonth}.
                </p>
              </div>
            </article>

            <article>
              <div className="birthday-rules__icon">
                <Clock3
                  size={22}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h3>
                  Deadline
                </h3>

                <p>
                  Apply before 9 PM
                  on event day.
                </p>
              </div>
            </article>

            <article>
              <div className="birthday-rules__icon">
                <Ticket
                  size={22}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h3>
                  Free Entry
                </h3>

                <p>
                  After confirmation
                  from our team.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="birthday-final">
        <div
          className="birthday-final__glow"
          aria-hidden="true"
        />

        <div className="birthday-shell birthday-final__content">
          <div className="birthday-final__icon">
            <CakeSlice
              size={29}
              aria-hidden="true"
            />
          </div>

          <span className="birthday-final__kicker">
            {birthdayMonth} Birthday?
          </span>

          <h2>
            Let's Celebrate
            Together
          </h2>

          <p>
            Good music. Amazing people.
            Jungle energy and a night
            by the waterfall.
          </p>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="birthday-main-cta birthday-main-cta--final"
          >
            <FaInstagram
              size={21}
              aria-hidden="true"
            />

            <span>
              Claim Your Free Entry
            </span>

            <ArrowRight
              size={20}
              aria-hidden="true"
            />
          </a>
        </div>
      </section>

      {/* FAQ */}

      <section className="birthday-section birthday-faq">
        <div className="birthday-shell">
          <header className="birthday-heading">
            <div className="birthday-heading__eyebrow">
              Need To Know
            </div>

            <h2>
              Birthday Offer FAQ
            </h2>
          </header>

          <div className="birthday-faq__list">
            <details>
              <summary>
                <span>
                  Do I need to be born
                  in {birthdayMonth}?
                </span>

                <span className="birthday-faq__plus">
                  +
                </span>
              </summary>

              <p>
                Yes. The current
                birthday-month promotion
                is for guests born in{" "}
                {birthdayMonth}.
              </p>
            </details>

            <details>
              <summary>
                <span>
                  What proof is
                  required?
                </span>

                <span className="birthday-faq__plus">
                  +
                </span>
              </summary>

              <p>
                Follow the instructions
                provided by the Waterfall
                Festival Instagram team
                when requesting the
                offer.
              </p>
            </details>

            <details>
              <summary>
                <span>
                  When should I apply?
                </span>

                <span className="birthday-faq__plus">
                  +
                </span>
              </summary>

              <p>
                Applications close at
                9:00 PM on the day of
                the event. Applying
                earlier is recommended.
              </p>
            </details>

            <details>
              <summary>
                <span>
                  Is free entry
                  automatic?
                </span>

                <span className="birthday-faq__plus">
                  +
                </span>
              </summary>

              <p>
                No. Wait for confirmation
                from the Waterfall
                Festival team before
                considering your free
                entry confirmed.
              </p>
            </details>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="birthday-instagram-link"
          >
            <FaInstagram
              size={18}
              aria-hidden="true"
            />

            Questions? Message us
            on Instagram

            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </a>
        </div>
      </section>
    </div>
  );
}

export default BirthdayFreeEntry;