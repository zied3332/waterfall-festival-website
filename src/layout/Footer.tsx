import {
  FaFacebookF,
  FaInstagram,
  FaSpotify,
  FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import "./Footer.css";

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

function Footer() {
  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName ||
    "Waterfall Festival";

  const footerDescription =
    settings?.footerDescription ||
    "Experience Thailand's most unforgettable music festival in the heart of Koh Phangan. Music, nature and unforgettable memories await.";

  const footerCopyright =
    settings?.footerCopyright ||
    `© ${new Date().getFullYear()} ${festivalName}. All rights reserved.`;

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
        settings?.assistantName ||
        "AI Assistant",
      to: "/chat",
      isVisible:
        settings?.assistantEnabled !== false,
    },
  ];

const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: settings?.instagramUrl ?? "",
    icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: settings?.facebookUrl ?? "",
    icon: FaFacebookF,
  },
  {
    label: "YouTube",
    href: settings?.youtubeUrl ?? "",
    icon: FaYoutube,
  },
  {
    label: "Spotify",
    href: settings?.spotifyUrl ?? "",
    icon: FaSpotify,
  },
].filter(
  (socialLink) =>
    socialLink.href.trim().length > 0,
);

  const shouldShowSocialLinks =
    settings?.showSocialLinksInFooter !==
      false &&
    socialLinks.length > 0;

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__brand">
            <h2>{festivalName}</h2>

            <p>{footerDescription}</p>
          </div>

          <FooterLinkGroup
            title="Festival"
            links={festivalLinks}
          />

          <FooterLinkGroup
            title="Visitors"
            links={visitorLinks}
          />

          <div>
            <h3>Follow Us</h3>

            {shouldShowSocialLinks ? (
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
                      <Icon size={20} />
                    </a>
                  ),
                )}
              </div>
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

          <div className="footer__links">
            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/terms">
              Terms
            </Link>

            <Link to="/cookies">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
    <div>
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
    </div>
  );
}

export default Footer;