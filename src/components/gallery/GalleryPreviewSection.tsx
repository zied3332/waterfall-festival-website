import {
  useState,
  type CSSProperties,
} from "react";

import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

import gallery1 from "../../../assets/gallery-1.jpg";
import gallery2 from "../../../assets/gallery-2.jpg";
import gallery3 from "../../../assets/gallery-3.jpg";
import gallery4 from "../../../assets/gallery-4.jpg";
import gallery5 from "../../../assets/gallery-5.jpg";

import "./gallery-preview.css";

type GalleryMemory = {
  image: string;
  className: string;
  alt: string;
  pin?: boolean;
  tape?: boolean;
};

const memories: GalleryMemory[] = [
  {
    image: gallery1,
    className: "memory-1",
    alt: "Waterfall Festival crowd and DJ performance",
    pin: true,
  },
  {
    image: gallery2,
    className: "memory-2",
    alt: "Waterfall Festival fire performance",
    tape: true,
  },
  {
    image: gallery3,
    className: "memory-3",
    alt: "Friends enjoying Waterfall Festival",
    pin: true,
  },
  {
    image: gallery4,
    className: "memory-4",
    alt: "DJ performing at Waterfall Festival",
    tape: true,
  },
  {
    image: gallery5,
    className: "memory-5",
    alt: "Waterfall Festival tropical atmosphere",
    pin: true,
  },
];

type StackStyle = CSSProperties & {
  "--stack-index": number;
  "--stack-z": number;
};

function GalleryPreviewSection() {
  const [activeMemory, setActiveMemory] =
    useState(0);

  function showNextMemory(): void {
    setActiveMemory(
      (current) =>
        (current + 1) % memories.length,
    );
  }

  return (
    <section
      className="gallery-preview"
      aria-labelledby="gallery-preview-title"
    >
      <div className="gallery-preview-container">
        <header className="gallery-preview-header">
          <p className="gallery-preview-label">
            Gallery
          </p>

          <h2
            id="gallery-preview-title"
            className="gallery-preview-title"
          >
            Experience the atmosphere
          </h2>

          <p className="gallery-preview-description">
            A glimpse of unforgettable nights,
            incredible performances and magical
            moments from Waterfall Festival.
          </p>
        </header>

        <div className="gallery-memory-wall">
          {memories.map((item, index) => {
            const stackIndex =
              (index -
                activeMemory +
                memories.length) %
              memories.length;

            const stackStyle: StackStyle = {
              "--stack-index": stackIndex,
              "--stack-z":
                memories.length - stackIndex,
            };

            return (
              <button
                key={item.className}
                type="button"
                className={[
                  "memory-card",
                  "memory-photo",
                  item.className,
                  stackIndex === 0
                    ? "is-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={stackStyle}
                onClick={showNextMemory}
                aria-label={`Show next gallery memory. Currently showing ${item.alt}.`}
              >
                {item.pin && (
                  <span
                    className="memory-pin"
                    aria-hidden="true"
                  />
                )}

                {item.tape && (
                  <span
                    className="memory-tape"
                    aria-hidden="true"
                  />
                )}

                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                />
              </button>
            );
          })}

          <Link
            to="/gallery"
            className="memory-card memory-cta"
            aria-label="Explore the complete Waterfall Festival gallery"
          >
            <Camera
              className="memory-cta-icon"
              size={36}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <strong>1,500+</strong>

            <small>Festival memories</small>

            <span className="memory-cta-link">
              Explore gallery
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>

        <div
          className="gallery-preview-wave"
          aria-hidden="true"
        >
          <span />
          <b>≋</b>
          <span />
        </div>
      </div>
    </section>
  );
}

export default GalleryPreviewSection;