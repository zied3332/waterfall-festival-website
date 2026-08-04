import {
  FaFacebookF,
  FaInstagram,
  FaSpotify,
  FaYoutube,
} from "react-icons/fa";

import type { IconType } from "react-icons";

import {
  Mail,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import "./Footer.css";
import fallbackLogo from "./logo2.png";
type FooterLink = {
  label: string;
  to: string;
  isVisible: boolean;
};

type SocialLink = {
  label: string;
  href: string;
  icon: IconType;
};

type FooterLinkGroupProps = {
  title: string;
  links: FooterLink[];
};

function FooterLinkGroup({
  title,
  links,
}: FooterLinkGroupProps) {
  const visibleLinks = links.filter(
    (link) => link.isVisible,
  );

  if (visibleLinks.length === 0) {
    return null;
  }

  return (
    <nav
      className="footer__column"
      aria-label={`${title} footer links`}
    >
      <h3>{title}</h3>

      <ul>
        {visibleLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Footer() {
  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival Koh Phangan";

  const footerDescription =
    settings?.footerDescription?.trim() ||
    "Experience Thailand's most unforgettable music festival in the heart of Koh Phangan.";

  const footerCopyright =
    settings?.footerCopyright?.trim() ||
    `© ${new Date().getFullYear()} ${festivalName}. All rights reserved.`;

 const configuredLogoUrl =
  settings?.logoUrl?.trim();

const logoUrl =
  configuredLogoUrl &&
  configuredLogoUrl !== "/logo2.png"
    ? configuredLogoUrl
    : fallbackLogo;
  const location =
    settings?.location?.trim() ||
    "Koh Phangan, Thailand";

  const publicEmail =
    settings?.publicEmail?.trim() || "";

  const festivalLinks: FooterLink[] = [
    {
      label: "Events",
      to: "/events",
      isVisible:
        settings?.eventsPageEnabled !== false,
    },
    {
      label: "Gallery",
      to: "/gallery",
      isVisible:
        settings?.galleryPageEnabled !== false,
    },
    {
      label: "Experience",
      to: "/experience",
      isVisible:
        settings?.experiencePageEnabled !==
        false,
    },
    {
      label: "Contact",
      to: "/contact",
      isVisible:
        settings?.contactFormEnabled !== false,
    },
  ];

  const visitorLinks: FooterLink[] = [
    {
      label: "Tickets",
      to: "/tickets",
      isVisible:
        settings?.ticketsPageEnabled !== false,
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
        settings?.faqPageEnabled !== false,
    },
    {
      label:
        settings?.assistantName?.trim() ||
        "Waterfall Assistant",
      to: "/chat",
      isVisible:
        settings?.assistantEnabled !== false,
    },
  ];

  const socialLinks: SocialLink[] = [
    {
      label: "Instagram",
      href:
        settings?.instagramUrl?.trim() || "",
      icon: FaInstagram,
    },
    {
      label: "Facebook",
      href:
        settings?.facebookUrl?.trim() || "",
      icon: FaFacebookF,
    },
    {
      label: "YouTube",
      href:
        settings?.youtubeUrl?.trim() || "",
      icon: FaYoutube,
    },
    {
      label: "Spotify",
      href:
        settings?.spotifyUrl?.trim() || "",
      icon: FaSpotify,
    },
  ].filter(
    (socialLink) =>
      socialLink.href.length > 0,
  );

  const shouldShowSocialLinks =
    settings?.showSocialLinksInFooter !==
      false &&
    socialLinks.length > 0;

  return (
    <footer className="footer">
      <div
        className="footer__glow footer__glow--purple"
        aria-hidden="true"
      />

      <div
        className="footer__glow footer__glow--cyan"
        aria-hidden="true"
      />

      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link
              to="/"
              className="footer__brand-link"
              aria-label={`${festivalName} homepage`}
            >
              <img
  src={logoUrl}
  alt={`${festivalName} logo`}
  className="footer__logo"
  onError={(event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      fallbackLogo;
  }}
/>
              <span>{festivalName}</span>
            </Link>

            <p className="footer__description">
              {footerDescription}
            </p>

            <div className="footer__contact-details">
              <div className="footer__contact-item">
                <MapPin
                  size={16}
                  aria-hidden="true"
                />

                <span>{location}</span>
              </div>

              {publicEmail && (
                <a
                  className="footer__contact-item"
                  href={`mailto:${publicEmail}`}
                >
                  <Mail
                    size={16}
                    aria-hidden="true"
                  />

                  <span>{publicEmail}</span>
                </a>
              )}
            </div>
          </div>

          <FooterLinkGroup
            title="Festival"
            links={festivalLinks}
          />

          <FooterLinkGroup
            title="Visitors"
            links={visitorLinks}
          />

          <div className="footer__column footer__social-column">
            <h3>Follow Us</h3>

            {shouldShowSocialLinks ? (
              <>
                <p className="footer__social-description">
                  Follow the latest festival
                  announcements, photos and
                  videos.
                </p>

                <div className="footer__socials">
                  {socialLinks.map(
                    ({
                      label,
                      href,
                      icon: Icon,
                    }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${festivalName} on ${label}`}
                        title={label}
                      >
                        <Icon
                          size={18}
                          aria-hidden="true"
                        />
                      </a>
                    ),
                  )}
                </div>
              </>
            ) : (
              <p className="footer__socials-empty">
                Social links are currently
                unavailable.
              </p>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <p>{footerCopyright}</p>

          <nav
            className="footer__legal-links"
            aria-label="Legal links"
          >
            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/terms">
              Terms
            </Link>

            <Link to="/cookies">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;