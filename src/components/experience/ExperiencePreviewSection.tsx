import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  Martini,
  Music2,
  Sparkles,
  Star,
  Trees,
  Waves,
} from "lucide-react";

import "./experience-preview.css";

import gallery1 from "../../../assets/gallery-1.jpg";
import gallery2 from "../../../assets/gallery-2.jpg";
import gallery3 from "../../../assets/gallery-3.jpg";
import gallery4 from "../../../assets/gallery-4.jpg";
import gallery5 from "../../../assets/gallery-5.jpg";

const experiences = [
  {
    number: "01",
    title: "Live Music",
    description:
      "International DJs, powerful sound, and unforgettable performances beneath the stars.",
    image: gallery1,
    icon: Music2,
    className: "experience-preview-card--large",
  },
  {
    number: "02",
    title: "Waterfalls",
    description:
      "Dance beside the iconic waterfalls of Koh Phangan surrounded by tropical nature.",
    image: gallery4,
    icon: Waves,
    className: "experience-preview-card--standard",
  },
  {
    number: "03",
    title: "Fire Shows",
    description:
      "Spectacular fire performances that light up the jungle throughout the night.",
    image: gallery2,
    icon: Flame,
    className: "experience-preview-card--tall",
  },
  {
    number: "04",
    title: "Jungle Atmosphere",
    description:
      "Immersive lights, tropical trees, music, and unforgettable island energy.",
    image: gallery5,
    icon: Trees,
    className: "experience-preview-card--standard",
  },
  {
    number: "05",
    title: "Food & Drinks",
    description:
      "Thai food, fresh fruit, cold drinks, cocktails, and festival favourites.",
    image: gallery3,
    icon: Martini,
    className: "experience-preview-card--wide",
  },
  {
    number: "06",
    title: "VIP Experience",
    description:
      "Premium areas, exclusive bars, comfortable spaces, and priority access.",
    image: gallery1,
    icon: Star,
    className: "experience-preview-card--standard",
  },
];

function ExperiencePreviewSection() {
  return (
    <section className="experience-preview">
      <div className="experience-preview__background" aria-hidden="true">
        <div className="experience-preview__grid-pattern" />
        <div className="experience-preview__glow experience-preview__glow--one" />
        <div className="experience-preview__glow experience-preview__glow--two" />
      </div>

      <div className="experience-preview__container">
        <div className="experience-preview__header">
          <div className="experience-preview__header-content">
            <div className="experience-preview__eyebrow">
              <Sparkles size={15} />
              <span>The Festival Experience</span>
            </div>

            <h2 className="experience-preview__title">
              More than a festival.
              <span> A world of its own.</span>
            </h2>
          </div>

          <div className="experience-preview__header-side">
            <p className="experience-preview__description">
              Discover music, waterfalls, fire, lights, food, and tropical
              island energy in one unforgettable night.
            </p>

            <Link
              className="experience-preview__header-link"
              to="/experience"
            >
              Explore everything
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="experience-preview__grid">
          {experiences.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className={`experience-preview-card ${item.className}`}
                key={item.title}
              >
                <img
                  className="experience-preview-card__image"
                  src={item.image}
                  alt={item.title}
                />

                <div className="experience-preview-card__overlay" />

                <div className="experience-preview-card__top">
                  <span className="experience-preview-card__number">
                    {item.number}
                  </span>

                  <span className="experience-preview-card__icon">
                    <Icon size={19} />
                  </span>
                </div>

                <div className="experience-preview-card__content">
                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <Link
                    to="/experience"
                    className="experience-preview-card__link"
                    aria-label={`Learn more about ${item.title}`}
                  >
                    Discover
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="experience-preview__footer">
          <div>
            <span>Ready to experience it?</span>

            <p>
              Discover everything waiting for you beneath the waterfalls of Koh
              Phangan.
            </p>
          </div>

          <Link className="experience-preview__button" to="/experience">
            Explore The Experience
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ExperiencePreviewSection;