import { Link } from "react-router-dom";

import UpcomingEventsSection from "../components/events/UpcomingEventsSection";
import TicketsPreviewSection from "../components/tickets/TicketsPreviewSection";
import FAQPreviewSection from "../components/faq/FAQPreviewSection";
import "./style/home.css";
import AIChatPreviewSection from "../components/chat/AIChatPreviewSection";
import ExperiencePreviewSection from "../components/experience/ExperiencePreviewSection";
function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__background" />
        <div className="home-hero__overlay" />

        <div className="home-hero__content">
          <p className="home-hero__location">Koh Phangan, Thailand</p>

          <h1 className="home-hero__title">
            Experience
            <br />
            The Waterfall
            <br />
            Festival
          </h1>

          <p className="home-hero__description">
            A clean first prototype focused on layout, user flow, ticket
            conversion and mobile experience.
          </p>

          <div className="home-hero__actions">
            <Link to="/tickets" className="home-hero__button home-hero__button--primary">
              Get Tickets
            </Link>

            <Link to="/events" className="home-hero__button home-hero__button--secondary">
              View Events
            </Link>
          </div>
        </div>
      </section>

      <UpcomingEventsSection />

      <TicketsPreviewSection />
      <ExperiencePreviewSection />

      <FAQPreviewSection />
      <AIChatPreviewSection />
    </>
  );
}

export default Home;