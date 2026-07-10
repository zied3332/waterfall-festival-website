import { Link } from "react-router-dom";
import {
  ArrowRight,
  Crown,
  Flame,
  GlassWater,
  Headphones,
  Music2,
  Sparkles,
  Trees,
  Users,
} from "lucide-react";

import "./style/experience.css";

import gallery1 from "../../assets/gallery-1.jpg";
import gallery2 from "../../assets/gallery-2.jpg";
import gallery3 from "../../assets/gallery-3.jpg";
import gallery4 from "../../assets/gallery-4.jpg";
import gallery5 from "../../assets/gallery-5.jpg";

const experiences = [
  {
    number: "01",
    title: "Live Music",
    category: "World-Class Sound",
    description:
      "Dance beneath the stars with international DJs, powerful sound systems, and performances that keep the jungle alive all night.",
    image: gallery1,
    icon: Headphones,
    className: "experience-card--large",
  },
  {
    number: "02",
    title: "Waterfall Stage",
    category: "Iconic Location",
    description:
      "Experience music beside the legendary waterfall, surrounded by tropical nature, lights, and the energy of Koh Phangan.",
    image: gallery4,
    icon: Music2,
    className: "experience-card--standard",
  },
  {
    number: "03",
    title: "Fire Shows",
    category: "Live Performance",
    description:
      "Watch talented performers create unforgettable moments with spectacular fire shows throughout the festival night.",
    image: gallery2,
    icon: Flame,
    className: "experience-card--tall",
  },
  {
    number: "04",
    title: "VIP Experience",
    category: "Premium Festival",
    description:
      "Enjoy exclusive viewing areas, premium service, comfortable spaces, and a private atmosphere above the crowd.",
    image: gallery3,
    icon: Crown,
    className: "experience-card--standard",
  },
  {
    number: "05",
    title: "Food & Drinks",
    category: "Island Flavours",
    description:
      "Discover Thai street food, fresh fruit, cocktails, cold drinks, and festival favourites throughout the venue.",
    image: gallery5,
    icon: GlassWater,
    className: "experience-card--wide",
  },
  {
    number: "06",
    title: "Jungle Atmosphere",
    category: "Into The Wild",
    description:
      "Step into a world of tropical trees, glowing decorations, immersive lighting, music, and unforgettable island energy.",
    image: gallery4,
    icon: Trees,
    className: "experience-card--standard",
  },
];

const highlights = [
  {
    value: "6+",
    label: "Festival experiences",
  },
  {
    value: "1",
    label: "Iconic waterfall",
  },
  {
    value: "100%",
    label: "Island energy",
  },
];

function Experience() {
  return (
    <main className="experience-page">
      <div className="experience-background" aria-hidden="true">
        <div className="experience-background__grid" />
        <div className="experience-background__glow experience-background__glow--purple" />
        <div className="experience-background__glow experience-background__glow--cyan" />
      </div>

      <section className="experience-hero">
        <div className="experience-container experience-hero__container">
          <div className="experience-hero__content">
            <div className="experience-eyebrow">
              <Sparkles size={16} />
              <span>The Waterfall Experience</span>
            </div>

            <h1 className="experience-title">
              More than music.
              <span> A world of its own.</span>
            </h1>

            <p className="experience-description">
              Waterfall Festival brings together music, nature, fire, lights,
              international artists, and people from around the world in one
              unforgettable jungle experience.
            </p>

            <div className="experience-hero__actions">
              <Link to="/tickets" className="experience-button experience-button--primary">
                Get Your Tickets
                <ArrowRight size={18} />
              </Link>

              <Link to="/gallery" className="experience-button experience-button--secondary">
                Explore Gallery
              </Link>
            </div>

            <div className="experience-highlights">
              {highlights.map((highlight) => (
                <div className="experience-highlight" key={highlight.label}>
                  <strong>{highlight.value}</strong>
                  <span>{highlight.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="experience-hero__visual">
            <div className="experience-hero__image-wrapper">
              <img
                src={gallery1}
                alt="Waterfall Festival stage and crowd"
                className="experience-hero__image"
              />

              <div className="experience-hero__image-overlay" />

              <div className="experience-hero__floating-card">
                <div className="experience-hero__floating-icon">
                  <Users size={22} />
                </div>

                <div>
                  <span>Festival Community</span>
                  <strong>One night. Endless memories.</strong>
                </div>
              </div>

              <div className="experience-hero__badge">
                <Music2 size={20} />
                <span>Koh Phangan</span>
              </div>
            </div>

            <div className="experience-hero__decoration experience-hero__decoration--one" />
            <div className="experience-hero__decoration experience-hero__decoration--two" />
          </div>
        </div>
      </section>

      <section className="experience-showcase">
        <div className="experience-container">
          <div className="experience-section-header">
            <div>
              <span className="experience-section-header__label">
                Discover every moment
              </span>

              <h2>Everything waiting for you</h2>
            </div>

            <p>
              From the first beat to the final sunrise, every part of Waterfall
              Festival is designed to create an unforgettable night.
            </p>
          </div>

          <div className="experience-grid">
            {experiences.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className={`experience-card ${item.className}`}
                  key={item.title}
                >
                  <img
                    className="experience-card__image"
                    src={item.image}
                    alt={item.title}
                  />

                  <div className="experience-card__overlay" />

                  <div className="experience-card__top">
                    <span className="experience-card__number">
                      {item.number}
                    </span>

                    <span className="experience-card__icon">
                      <Icon size={19} />
                    </span>
                  </div>

                  <div className="experience-card__content">
                    <span className="experience-card__category">
                      {item.category}
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <span className="experience-card__link">
                      Discover experience
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="experience-story">
        <div className="experience-container experience-story__container">
          <div className="experience-story__images">
            <div className="experience-story__image experience-story__image--main">
              <img src={gallery3} alt="Friends enjoying Waterfall Festival" />
            </div>

            <div className="experience-story__image experience-story__image--small">
              <img src={gallery2} alt="Festival fire performance" />
            </div>

            <div className="experience-story__image-label">
              <Sparkles size={17} />
              <span>Made for unforgettable nights</span>
            </div>
          </div>

          <div className="experience-story__content">
            <span className="experience-story__label">
              The heart of the festival
            </span>

            <h2>Come for the music. Stay for the memories.</h2>

            <p>
              Waterfall Festival is about more than standing in front of a
              stage. It is about meeting new people, discovering the island,
              dancing beneath tropical trees, and sharing moments that stay
              with you long after the music ends.
            </p>

            <p>
              Whether you arrive with friends or travel alone, you become part
              of a community brought together by music, nature, and adventure.
            </p>

            <Link to="/gallery" className="experience-story__link">
              See festival moments
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="experience-cta-section">
        <div className="experience-container">
          <div className="experience-cta">
            <div className="experience-cta__glow" aria-hidden="true" />

            <div className="experience-cta__icon">
              <Music2 size={28} />
            </div>

            <span className="experience-cta__label">
              Your island adventure starts here
            </span>

            <h2>Create memories that last forever.</h2>

            <p>
              Join us beneath the waterfall for music, lights, nature, and a
              night you will never forget.
            </p>

            <Link to="/tickets" className="experience-cta__button">
              Get Your Tickets
              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Experience;