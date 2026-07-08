import { Link } from "react-router-dom";

import logo from "./logo1.png";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import TicketsPreviewSection from "../components/tickets/TicketsPreviewSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
import GalleryPreviewSection from "../components/gallery/GalleryPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";
import AIChatPreviewSection from "../components/chat/AIChatPreviewSection";

import "./style/home.css";

function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__background" />
        <div className="home-hero__overlay" />

        <div className="home-hero__content">
          <img
            src={logo}
            alt="Waterfall Festival"
            className="home-hero__logo"
          />

      

         

          <div className="home-hero__divider">
            <span />
            <b>✣</b>
            <span />
          </div>

          <h2 className="home-hero__title">
            Dance Under The
            <br />
            <strong>Waterfall</strong>
          </h2>

          <p className="home-hero__description">
            The world's most unforgettable tropical electronic music festival.
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

          <div className="home-hero__info">
            <div>
              <span>📍</span>
              <p>
                Koh Phangan
                <small>Thailand</small>
              </p>
            </div>

            <div>
              <span>🗓️</span>
              <p>
                Next Event
                <small>12 - 16 Aug 2026</small>
              </p>
            </div>

            <div>
              <span>☆</span>
              <p>
                15 Years
                <small>Of Magic</small>
              </p>
            </div>
          </div>
        </div>

        <div className="home-hero__scroll">Scroll to discover</div>
      </section>

      <UpcomingEventsSection />
      <TicketsPreviewSection />
      <ExperiencePreviewSection />
      <GalleryPreviewSection />
      <FAQPreviewSection />
      <AIChatPreviewSection />
    </>
  );
}

export default Home;