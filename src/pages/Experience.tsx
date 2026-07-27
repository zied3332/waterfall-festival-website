import { Link } from "react-router-dom";

import {
  ArrowRight,
  Crown,
  Flame,
  GlassWater,
  Headphones,
  MapPin,
  Music2,
  Sparkles,
  Star,
  Trees,
  Waves,
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
      "Dance beneath the stars with international DJs, artists, and powerful sound systems.",
    image: gallery1,
    icon: Headphones,
  },
  {
    number: "02",
    title: "Waterfall Stage",
    category: "Iconic Location",
    description:
      "Experience music beside the legendary waterfall surrounded by tropical nature.",
    image: gallery4,
    icon: Music2,
  },
  {
    number: "03",
    title: "Fire Shows",
    category: "Live Performance",
    description:
      "Watch talented performers create spectacular moments and light up the festival night.",
    image: gallery2,
    icon: Flame,
  },
  {
    number: "04",
    title: "VIP Experience",
    category: "Premium Festival",
    description:
      "Enjoy exclusive areas, premium service, and a comfortable view above the crowd.",
    image: gallery3,
    icon: Crown,
  },
  {
    number: "05",
    title: "Food & Drinks",
    category: "Island Flavours",
    description:
      "Discover Thai food, fresh fruit, cocktails, cold drinks, and festival favourites.",
    image: gallery5,
    icon: GlassWater,
  },
  {
    number: "06",
    title: "Jungle Atmosphere",
    category: "Into The Wild",
    description:
      "Explore tropical trees, immersive lights, decorations, music, and island energy.",
    image: gallery4,
    icon: Trees,
  },
];

const experienceFeatures = [
  {
    title: "Live music",
    description: "International DJs and artists",
    icon: Music2,
  },
  {
    title: "Tropical nature",
    description: "Waterfalls, jungle, and island views",
    icon: Trees,
  },
  {
    title: "Live shows",
    description: "Fire shows and special performances",
    icon: Flame,
  },
  {
    title: "Food & drinks",
    description: "Thai food, drinks, and cocktails",
    icon: GlassWater,
  },
];

const highlights = [
  {
    value: "6+",
    label: "Festival experiences",
    icon: Star,
  },
  {
    value: "1",
    label: "Iconic waterfall",
    icon: Waves,
  },
  {
    value: "Koh Phangan",
    label: "Thailand",
    icon: MapPin,
  },
];

function Experience() {
  return (
    <main className="experience-page">
      <section className="experience-hero">
        <div className="experience-hero__content">
          <p className="experience-hero__label">
            Experience
          </p>

          <h1 className="experience-hero__title">
            The Waterfall Experience
          </h1>

          <p className="experience-hero__description">
            Discover music, performances, nature,
            food, and unforgettable festival nights
            in Koh Phangan.
          </p>
        </div>
      </section>

      <section className="experience-content">
        <div className="experience-container">
          <section className="experience-introduction">
            <div className="experience-introduction__content">
              <p className="experience-section-label">
                The festival experience
              </p>

              <h2>
                Everything waiting for you
              </h2>

              <p>
                Waterfall Festival combines
                world-class music, tropical
                surroundings, exciting
                performances, delicious food, and
                an international community.
              </p>
            </div>

            <div className="experience-features">
              {experienceFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    className="experience-feature"
                    key={feature.title}
                  >
                    <span
                      className="experience-feature__icon"
                      aria-hidden="true"
                    >
                      <Icon size={21} />
                    </span>

                    <h3>{feature.title}</h3>

                    <p>{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            className="experience-showcase"
            aria-labelledby="experience-showcase-title"
          >
            <div className="experience-showcase__header">
              <div>
                <p className="experience-section-label">
                  Discover every moment
                </p>

                <h2 id="experience-showcase-title">
                  What you can experience
                </h2>
              </div>

              <p>
                From the first beat to the final
                moment, every part of the festival
                is designed to create an
                unforgettable night.
              </p>
            </div>

            <div className="experience-grid">
              {experiences.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="experience-card"
                    key={item.title}
                  >
                    <div className="experience-card__image-wrapper">
                      <img
                        className="experience-card__image"
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="experience-card__content">
                      <div className="experience-card__heading">
                        <span
                          className="experience-card__icon"
                          aria-hidden="true"
                        >
                          <Icon size={19} />
                        </span>

                        <div>
                          <h3>{item.title}</h3>

                          <p className="experience-card__category">
                            {item.category}
                          </p>
                        </div>

                        <span
                          className="experience-card__number"
                          aria-hidden="true"
                        >
                          {item.number}
                        </span>
                      </div>

                      <p className="experience-card__description">
                        {item.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            className="experience-highlights"
            aria-label="Festival highlights"
          >
            {highlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <div
                  className="experience-highlight"
                  key={highlight.label}
                >
                  <span
                    className="experience-highlight__icon"
                    aria-hidden="true"
                  >
                    <Icon size={25} />
                  </span>

                  <div>
                    <strong>{highlight.value}</strong>

                    <span>{highlight.label}</span>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="experience-story">
            <div className="experience-story__image-wrapper">
              <img
                className="experience-story__image"
                src={gallery3}
                alt="Festival visitors enjoying Waterfall Festival"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="experience-story__content">
              <p className="experience-section-label">
                The Waterfall story
              </p>

              <h2>
                Come for the music. Stay for the
                memories.
              </h2>

              <div
                className="experience-story__line"
                aria-hidden="true"
              />

              <p>
                Waterfall Festival is about
                connection, freedom, and living in
                the moment. Meet people from around
                the world, dance beneath tropical
                trees, and create memories that
                stay with you long after the music
                ends.
              </p>

              <p>
                Whether you arrive with friends or
                travel alone, you become part of a
                community brought together by
                music, nature, and adventure.
              </p>

              <Link
                className="experience-story__link"
                to="/gallery"
              >
                Explore the gallery

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>

          <section className="experience-cta">
            <div className="experience-cta__heading">
              <p className="experience-cta__label">
                Join the experience
              </p>

              <h2>
                Ready for the Waterfall experience?
              </h2>
            </div>

            <p className="experience-cta__description">
              Be part of the magic. Get your
              tickets and join us for an
              unforgettable night in Koh Phangan.
            </p>

            <Link
              className="experience-cta__button"
              to="/tickets"
            >
              Get Your Tickets

              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Link>
          </section>

          <div className="experience-mobile-note">
            <Sparkles
              size={18}
              aria-hidden="true"
            />

            <span>
              Music, nature, and unforgettable
              island memories.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Experience;