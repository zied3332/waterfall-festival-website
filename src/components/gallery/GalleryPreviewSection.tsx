import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import "./gallery-preview.css";

import gallery1 from "../../../assets/gallery-1.jpg";
import gallery2 from "../../../assets/gallery-2.jpg";
import gallery3 from "../../../assets/gallery-3.jpg";
import gallery4 from "../../../assets/gallery-4.jpg";
import gallery5 from "../../../assets/gallery-5.jpg";

const memories = [
  { image: gallery1, className: "memory-1", alt: "Festival crowd", pin: true },
  { image: gallery2, className: "memory-2", alt: "Fire show", tape: true },
  { image: gallery3, className: "memory-3", alt: "Festival friends", pin: true },
  { image: gallery4, className: "memory-4", alt: "DJ performance", tape: true },
  { image: gallery5, className: "memory-5", alt: "Waterfall", pin: true },
];

type StackStyle = CSSProperties & {
  "--stack-index": number;
  "--stack-z": number;
};

function GalleryPreviewSection() {
  const [activeMemory, setActiveMemory] = useState(0);

  function showNextMemory() {
    setActiveMemory((current) => (current + 1) % memories.length);
  }

  return (
    <section className="gallery-preview">
      <div className="gallery-preview-container">
        <p className="gallery-preview-label">Gallery</p>

        <h2 className="gallery-preview-title">Experience The Atmosphere</h2>

        <p className="gallery-preview-description">
          A glimpse of unforgettable nights, incredible performances and
          magical moments from Waterfall Festival.
        </p>

        <div className="gallery-memory-wall">
          {memories.map((item, index) => {
            const stackIndex =
              (index - activeMemory + memories.length) % memories.length;

            const stackStyle: StackStyle = {
              "--stack-index": stackIndex,
              "--stack-z": memories.length - stackIndex,
            };

            return (
              <button
                type="button"
                key={item.className}
                onClick={showNextMemory}
                className={`memory-card memory-photo ${item.className} ${
                  stackIndex === 0 ? "is-active" : ""
                }`}
                style={stackStyle}
                aria-label="Next gallery memory"
              >
                {item.pin && <span className="memory-pin" />}
                {item.tape && <span className="memory-tape" />}
                <img src={item.image} alt={item.alt} />
              </button>
            );
          })}

          <Link to="/gallery" className="memory-card memory-cta">
            <Camera className="memory-cta-icon" size={46} strokeWidth={1.8} />
            <strong>1,500+</strong>
            <small>Festival Memories</small>
            <p>Explore Gallery →</p>
          </Link>
        </div>

        <div className="gallery-preview-wave">
          <span />
          <b>≋</b>
          <span />
        </div>
      </div>
    </section>
  );
}

export default GalleryPreviewSection;