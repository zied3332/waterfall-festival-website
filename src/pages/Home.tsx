import { Link } from "react-router-dom";

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
          <p className="home-hero__location">Koh Phangan, Thailand</p>

          <h1 className="home-hero__title">
            Where the Jungle
            <br />
            Meets the Music
          </h1>

          <p className="home-hero__description">
            Join Waterfall Festival for an unforgettable night of music,
            lights, nature, and island energy in the heart of Koh Phangan.
          </p>

          <div className="home-hero__actions">
            <Link
              to="/tickets"
              className="home-hero__button home-hero__button--primary"
            >
              Book Your Night
            </Link>

            <Link
              to="/events"
              className="home-hero__button home-hero__button--secondary"
            >
              Explore Events
            </Link>
          </div>
        </div>
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