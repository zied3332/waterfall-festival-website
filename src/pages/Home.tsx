import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";

import logo from "./logo1.png";
import homepageImage from "../../assets/homepage1.jpg";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import TicketsPreviewSection from "../components/tickets/TicketsPreviewSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";
import AIChatPreviewSection from "../components/chat/AIChatPreviewSection";

import "./style/home.css";

function Home() {
  const heroStyle = {
    "--home-hero-image": `url(${homepageImage})`,
  } as CSSProperties;

  return (
    <>
      <section className="home-hero" style={heroStyle}>
        <div className="home-hero__background" />
        <div className="home-hero__overlay" />
        <div className="home-hero__glow home-hero__glow--purple" />
        <div className="home-hero__glow home-hero__glow--cyan" />

        <div className="home-hero__container">
          <div className="home-hero__content">
            <img
              src={logo}
              alt="Waterfall Festival"
              className="home-hero__logo"
            />

            <div className="home-hero__eyebrow">
              <span className="home-hero__eyebrow-line" />

              <Sparkles size={15} />

              <span>Thailand’s Tropical Music Experience</span>

              <span className="home-hero__eyebrow-line" />
            </div>

            <h1 className="home-hero__title">
              Dance Under
              <span>The Waterfall</span>
            </h1>

            <p className="home-hero__description">
              Experience an unforgettable night of electronic music, fire
              performances, tropical energy, and dancing beneath the waterfall
              in Koh Phangan.
            </p>

            <div className="home-hero__actions">
              <Link
                to="/tickets"
                className="home-hero__button home-hero__button--primary"
              >
                Get Tickets
              </Link>

              <Link
                to="/events"
                className="home-hero__button home-hero__button--secondary"
              >
                Explore Events
              </Link>
            </div>

            <div className="home-hero__details">
              <div className="home-hero__detail">
                <div className="home-hero__detail-icon">
                  <MapPin size={19} />
                </div>

                <div>
                  <span>Location</span>
                  <strong>Koh Phangan, Thailand</strong>
                </div>
              </div>

              <div className="home-hero__detail">
                <div className="home-hero__detail-icon">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <span>Next Event</span>
                  <strong>12–16 August 2026</strong>
                </div>
              </div>

              <div className="home-hero__detail">
                <div className="home-hero__detail-icon">
                  <Sparkles size={19} />
                </div>

                <div>
                  <span>Celebrating</span>
                  <strong>15 Years of Magic</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#upcoming-events" className="home-hero__scroll">
          <span>Discover More</span>

          <div>
            <ArrowDown size={17} />
          </div>
        </a>
      </section>

      <div id="upcoming-events">
        <UpcomingEventsSection />
      </div>

      <TicketsPreviewSection />
      <ExperiencePreviewSection />
      <GalleryPreviewSection />
      <FAQPreviewSection />
      <AIChatPreviewSection />
    </>
  );
}

export default Home;