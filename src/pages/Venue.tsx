import {
  Bot,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { useWebsiteSettings } from "../context/WebsiteSettingsContext";

import festivalMap from "./style/festival-map.png";

import "./style/venue.css";

const mapItems = [
  { number: "🚪", name: "Entrance" },
  { number: "1", name: "Main Stage" },
  { number: "2", name: "Sky Stage" },
  { number: "3", name: "Secret Stage" },
  { number: "4", name: "Panorama Stage" },
  { number: "VIP", name: "VIP Zone" },
  { number: "🚻", name: "Toilets" },
  { number: "⛑", name: "First Aid" },
  { number: "🍔", name: "Food Area" },
  { number: "🅿", name: "Parking Area" },
];

function normalizePhoneHref(
  phoneNumber: string,
): string {
  return `tel:${phoneNumber.replace(
    /[^\d+]/g,
    "",
  )}`;
}

function normalizeWhatsAppHref(
  whatsappNumber: string,
): string {
  const normalizedNumber =
    whatsappNumber.replace(/\D/g, "");

  return `https://wa.me/${normalizedNumber}`;
}

function Venue() {
  const { settings } =
    useWebsiteSettings();

  const festivalName =
    settings?.festivalName?.trim() ||
    "Waterfall Festival";

  const location =
    settings?.location?.trim() ||
    "Koh Phangan, Thailand";

  const venue =
    settings?.venue?.trim() || "";

  const address =
    settings?.address?.trim() || "";

  const googleMapsUrl =
    settings?.googleMapsUrl?.trim() || "";

  const phoneNumber =
    settings?.phoneNumber?.trim() || "";

  const whatsappNumber =
    settings?.whatsappNumber?.trim() ||
    "";

  const assistantEnabled =
    settings?.assistantEnabled ?? true;

  const assistantName =
    settings?.assistantName?.trim() ||
    "AI Assistant";

  const displayedVenue =
    venue || festivalName;

  const displayedAddress =
    address || location;

  return (
    <section className="venue-page">
      <div className="venue-container">
        <p className="venue-label">
          Venue
        </p>

        <h1 className="venue-title">
          Festival Map
        </h1>

        <p className="venue-description">
          Explore {festivalName} before you
          arrive. Find every stage, food
          court, VIP area, parking zone, and
          important facility at{" "}
          {displayedVenue}.
        </p>

        <div className="venue-grid">
          <div className="venue-map-card">
            <img
              src={festivalMap}
              alt={`${festivalName} venue map`}
              className="venue-map-image"
            />
          </div>

          <div className="venue-info-card">
            <h2>Key Locations</h2>

            <div className="venue-list">
              {mapItems.map((item) => (
                <div
                  className="venue-list-item"
                  key={item.name}
                >
                  <div
                    className="venue-icon"
                    aria-hidden="true"
                  >
                    {item.number}
                  </div>

                  <p>{item.name}</p>
                </div>
              ))}
            </div>

            <div className="venue-contact">
              <div className="venue-contact__item">
                <MapPin
                  size={18}
                  aria-hidden="true"
                />

                <div>
                  <span>Venue</span>
                  <strong>
                    {displayedVenue}
                  </strong>
                  <p>{displayedAddress}</p>
                </div>
              </div>

              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venue-button"
                >
                  <MapPin
                    size={17}
                    aria-hidden="true"
                  />
                  Open in Google Maps
                </a>
              )}

              {phoneNumber && (
                <a
                  href={normalizePhoneHref(
                    phoneNumber,
                  )}
                  className="venue-button"
                >
                  <Phone
                    size={17}
                    aria-hidden="true"
                  />
                  Call Venue
                </a>
              )}

              {whatsappNumber && (
                <a
                  href={normalizeWhatsAppHref(
                    whatsappNumber,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venue-button"
                >
                  <MessageCircle
                    size={17}
                    aria-hidden="true"
                  />
                  WhatsApp
                </a>
              )}

              {assistantEnabled && (
                <button
                  type="button"
                  className="venue-button"
                  aria-label={`Ask ${assistantName} about the venue`}
                >
                  <Bot
                    size={17}
                    aria-hidden="true"
                  />
                  Ask {assistantName}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Venue;