import { Link } from "react-router-dom";
import {
  Music2,
  Waves,
  Flame,
  Trees,
  Martini,
  Star,
} from "lucide-react";

import "./experience-preview.css";

const experiences = [
  {
    title: "Live Music",
    description: "International DJs and unforgettable performances all night.",
    icon: <Music2 size={36} />,
  },
  {
    title: "Waterfalls",
    description: "Dance beneath the famous waterfalls of Koh Phangan.",
    icon: <Waves size={36} />,
  },
  {
    title: "Fire Shows",
    description: "Amazing fire performances lighting up the jungle.",
    icon: <Flame size={36} />,
  },
  {
    title: "Jungle Atmosphere",
    description: "Nature, lights and music combined into one experience.",
    icon: <Trees size={36} />,
  },
  {
    title: "Food & Drinks",
    description: "Local food, cocktails and refreshing drinks everywhere.",
    icon: <Martini size={36} />,
  },
  {
    title: "VIP Experience",
    description: "Premium areas, exclusive bars and priority access.",
    icon: <Star size={36} />,
  },
];

function ExperiencePreviewSection() {
  return (
    <section className="experience">
      <div className="experience-container">
        <p className="experience-label">Experience</p>

        <h2 className="experience-title">
          More Than Just A Festival
        </h2>

        <p className="experience-description">
          Discover everything waiting for you beneath the waterfalls of
          Koh Phangan.
        </p>

        <div className="experience-grid">
          {experiences.map((item) => (
            <article className="experience-card" key={item.title}>
              <div className="experience-icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <Link className="experience-button" to="/experience">
          Explore Experience →
        </Link>
      </div>
    </section>
  );
}

export default ExperiencePreviewSection;