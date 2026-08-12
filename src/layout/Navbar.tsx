import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  CalendarDays,
  Home,
  Mail,
  Ticket,
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
import fallbackCompactLogo from "./logo2.png";

type NavigationLink = {
  label: string;
  to: string;
  isVisible: boolean;
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
  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival";

  const desktopLogo = resolveImageUrl(
    settings?.logoUrl,
    fallbackLogo,
  );

  const compactLogo = resolveImageUrl(
    settings?.compactLogoUrl,
    fallbackCompactLogo,
  );

  const navigationLinks: NavigationLink[] = [
    {
      label: "Home",
      to: "/",
      isVisible: true,
    },
    {
      label: "Events",
      to: "/events",
      isVisible:
        settings?.eventsPageEnabled ?? true,
    },
    {
      label: "Tickets",
      to: "/tickets",
      isVisible:
        settings?.ticketsPageEnabled ?? true,
    },
    {
      label: "Experience",
      to: "/experience",
      isVisible:
        settings?.experiencePageEnabled ??
        true,
    },
    {
      label: "Gallery",
      to: "/gallery",
      isVisible:
        settings?.galleryPageEnabled ?? true,
    },
    {
      label: "Venue",
      to: "/venue",
      isVisible: true,
    },
    {
      label: "FAQ",
      to: "/faq",
      isVisible:
        settings?.faqPageEnabled ?? true,
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

  const ticketsPageEnabled =
    settings?.ticketsPageEnabled ?? true;

  const eventsPageEnabled =
    settings?.eventsPageEnabled ?? true;

  const showSocialLinks =
    settings?.showSocialLinksInFooter ?? true;

  const defaultLanguage =
    settings?.defaultLanguage
      ?.trim()
      .toUpperCase() || "EN";

  return (
    <>
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
            <picture>
              <source
                srcSet={compactLogo}
                media="(max-width: 900px)"
              />

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
            </picture>
          </Link>

          <div className="navbar__links">
            {navigationLinks
              .filter(
                (navigationLink) =>
                  navigationLink.isVisible,
              )
              .map((navigationLink) => (
                <NavLink
                  key={navigationLink.to}
                  to={navigationLink.to}
                  end={
                    navigationLink.to === "/"
                  }
                >
                  {navigationLink.label}
                </NavLink>
              ))}
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
              <Link
                to="/tickets"
                className="navbar__button"
              >
                <Ticket
                  size={16}
                  aria-hidden="true"
                />

                Get Tickets
              </Link>
            )}
          </div>
        </nav>
      </header>

      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        <NavLink
          to="/"
          end
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
          <NavLink
            to="/tickets"
            className="mobile-bottom-nav__item mobile-bottom-nav__item--tickets"
          >
            <span className="mobile-bottom-nav__ticket-icon">
              <Ticket
                size={21}
                aria-hidden="true"
              />
            </span>

            <span>Tickets</span>
          </NavLink>
        )}

        <NavLink
          to="/contact"
          className="mobile-bottom-nav__item"
        >
          <Mail
            size={20}
            aria-hidden="true"
          />

          <span>Contact</span>
        </NavLink>
      </nav>
    </>
  );
}