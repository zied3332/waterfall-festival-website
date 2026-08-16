import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  CalendarDays,
  Home,
  Images,
  Info,
  Mail,
  MapPin,
  Menu,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import "./Navbar.css";

import fallbackLogo from "./logo.png";

type NavigationLink = {
  label: string;
  to: string;
  isVisible: boolean;
  external?: boolean;
};

type SocialLink = {
  label: string;
  href: string | null | undefined;
  icon: React.ComponentType<{
    size?: number;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  size: number;
};

const TICKETS_URL =
  "https://www.eventpop.me/e/166443";

function resolveImageUrl(
  configuredUrl: string | null | undefined,
  fallbackUrl: string,
): string {
  const value = configuredUrl?.trim();

  if (!value) {
    return fallbackUrl;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return fallbackUrl;
}

export default function Navbar() {
  const [moreOpen, setMoreOpen] =
    useState(false);

  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival";

  const desktopLogo = resolveImageUrl(
    settings?.logoUrl,
    fallbackLogo,
  );

  const eventsPageEnabled =
    settings?.eventsPageEnabled ?? true;

  const ticketsPageEnabled =
    settings?.ticketsPageEnabled ?? true;

  const experiencePageEnabled =
    settings?.experiencePageEnabled ?? true;

  const galleryPageEnabled =
    settings?.galleryPageEnabled ?? true;

  const faqPageEnabled =
    settings?.faqPageEnabled ?? true;

  const navigationLinks: NavigationLink[] = [
    {
      label: "Home",
      to: "/",
      isVisible: true,
    },
    {
      label: "Events",
      to: "/events",
      isVisible: eventsPageEnabled,
    },
    {
      label: "Tickets",
      to: TICKETS_URL,
      isVisible: ticketsPageEnabled,
      external: true,
    },
    {
      label: "Experience",
      to: "/experience",
      isVisible: experiencePageEnabled,
    },
    {
      label: "Gallery",
      to: "/gallery",
      isVisible: galleryPageEnabled,
    },
    {
      label: "Venue",
      to: "/venue",
      isVisible: true,
    },
    {
      label: "FAQ",
      to: "/faq",
      isVisible: faqPageEnabled,
    },
    {
      label: "Contact",
      to: "/contact",
      isVisible: true,
    },
  ];

  const socialLinks: SocialLink[] = [
    {
      label: "Instagram",
      href: settings?.instagramUrl,
      icon: FaInstagram,
      size: 18,
    },
    {
      label: "Facebook",
      href: settings?.facebookUrl,
      icon: FaFacebookF,
      size: 16,
    },
    {
      label: "YouTube",
      href: settings?.youtubeUrl,
      icon: FaYoutube,
      size: 19,
    },
    {
      label: "TikTok",
      href: settings?.tiktokUrl,
      icon: FaTiktok,
      size: 17,
    },
  ];

  const visibleSocialLinks =
    socialLinks.filter(
      (
        socialLink,
      ): socialLink is SocialLink & {
        href: string;
      } =>
        typeof socialLink.href === "string" &&
        socialLink.href.trim().length > 0,
    );

  const showSocialLinks =
    settings?.showSocialLinksInFooter ?? true;

  const defaultLanguage =
    settings?.defaultLanguage
      ?.trim()
      .toUpperCase() || "EN";

  function closeMore(): void {
    setMoreOpen(false);
  }

  function toggleMore(): void {
    setMoreOpen(
      (currentValue) => !currentValue,
    );
  }

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [moreOpen]);

  return (
    <>
      {/* Desktop navigation */}
      <header className="navbar">
        <nav
          className="navbar__inner"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className="navbar__brand"
            aria-label={`${festivalName} homepage`}
          >
            <img
              src={desktopLogo}
              alt={festivalName}
              className="navbar__logo"
              onError={(event) => {
                event.currentTarget.onerror =
                  null;

                event.currentTarget.src =
                  fallbackLogo;
              }}
            />
          </Link>

          <div className="navbar__links">
            {navigationLinks
              .filter(
                (navigationLink) =>
                  navigationLink.isVisible,
              )
              .map((navigationLink) =>
                navigationLink.external ? (
                  <a
                    key={navigationLink.to}
                    href={navigationLink.to}
                  >
                    {navigationLink.label}
                  </a>
                ) : (
                  <NavLink
                    key={navigationLink.to}
                    to={navigationLink.to}
                    end={
                      navigationLink.to === "/"
                    }
                  >
                    {navigationLink.label}
                  </NavLink>
                ),
              )}
          </div>

          <div className="navbar__right">
            {showSocialLinks &&
              visibleSocialLinks.length >
                0 && (
                <div
                  className="navbar__socials"
                  aria-label="Social media links"
                >
                  {visibleSocialLinks.map(
                    (socialLink) => {
                      const SocialIcon =
                        socialLink.icon;

                      return (
                        <a
                          key={
                            socialLink.label
                          }
                          href={
                            socialLink.href
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${festivalName} on ${socialLink.label}`}
                          title={
                            socialLink.label
                          }
                        >
                          <SocialIcon
                            size={
                              socialLink.size
                            }
                            aria-hidden="true"
                          />
                        </a>
                      );
                    },
                  )}
                </div>
              )}

            <select
              key={defaultLanguage}
              className="navbar__lang"
              defaultValue={
                defaultLanguage === "FR"
                  ? "FR"
                  : "EN"
              }
              aria-label="Website language"
            >
              <option value="EN">
                EN
              </option>

              <option value="FR">
                FR
              </option>
            </select>

            {ticketsPageEnabled && (
              <a
                href={TICKETS_URL}
                className="navbar__button"
              >
                <Ticket
                  size={16}
                  aria-hidden="true"
                />

                Get Tickets
              </a>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile more overlay */}
      {moreOpen && (
        <button
          type="button"
          className="mobile-more__backdrop"
          onClick={closeMore}
          aria-label="Close more navigation"
        />
      )}

      {/* Mobile more sheet */}
      <div
        className={`mobile-more ${
          moreOpen
            ? "mobile-more--open"
            : ""
        }`}
        aria-hidden={!moreOpen}
      >
        <div className="mobile-more__header">
          <div>
            <span className="mobile-more__eyebrow">
              Explore
            </span>

            <strong>
              More festival pages
            </strong>
          </div>

          <button
            type="button"
            className="mobile-more__close"
            onClick={closeMore}
            aria-label="Close more navigation"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="mobile-more__grid">
          {experiencePageEnabled && (
            <NavLink
              to="/experience"
              onClick={closeMore}
              className="mobile-more__link"
            >
              <Sparkles
                size={21}
                aria-hidden="true"
              />

              <span>Experience</span>
            </NavLink>
          )}

          {galleryPageEnabled && (
            <NavLink
              to="/gallery"
              onClick={closeMore}
              className="mobile-more__link"
            >
              <Images
                size={21}
                aria-hidden="true"
              />

              <span>Gallery</span>
            </NavLink>
          )}

          <NavLink
            to="/venue"
            onClick={closeMore}
            className="mobile-more__link"
          >
            <MapPin
              size={21}
              aria-hidden="true"
            />

            <span>Venue</span>
          </NavLink>

          {faqPageEnabled && (
            <NavLink
              to="/faq"
              onClick={closeMore}
              className="mobile-more__link"
            >
              <Info
                size={21}
                aria-hidden="true"
              />

              <span>FAQ</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        <NavLink
          to="/"
          end
          onClick={closeMore}
          className="mobile-bottom-nav__item"
        >
          <Home
            size={20}
            aria-hidden="true"
          />

          <span>Home</span>
        </NavLink>

        {eventsPageEnabled && (
          <NavLink
            to="/events"
            onClick={closeMore}
            className="mobile-bottom-nav__item"
          >
            <CalendarDays
              size={20}
              aria-hidden="true"
            />

            <span>Events</span>
          </NavLink>
        )}

        {ticketsPageEnabled && (
          <a
            href={TICKETS_URL}
            onClick={closeMore}
            className="mobile-bottom-nav__item mobile-bottom-nav__item--tickets"
          >
            <span className="mobile-bottom-nav__ticket-icon">
              <Ticket
                size={21}
                aria-hidden="true"
              />
            </span>

            <span>Tickets</span>
          </a>
        )}

        <NavLink
          to="/contact"
          onClick={closeMore}
          className="mobile-bottom-nav__item"
        >
          <Mail
            size={20}
            aria-hidden="true"
          />

          <span>Contact</span>
        </NavLink>

        <button
          type="button"
          className={`mobile-bottom-nav__item mobile-bottom-nav__more ${
            moreOpen
              ? "mobile-bottom-nav__more--active"
              : ""
          }`}
          onClick={toggleMore}
          aria-label="Open more pages"
          aria-expanded={moreOpen}
        >
          <Menu
            size={20}
            aria-hidden="true"
          />

          <span>More</span>
        </button>
      </nav>
    </>
  );
}