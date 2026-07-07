import { Link } from "react-router-dom";
import "./gallery-preview.css";

const items = [
  "Main Stage",
  "Fire Show",
  "VIP",
  "Crowd",
  "Waterfall",
  "Jungle",
];

function GalleryPreviewSection() {
  return (
    <section className="gallery-preview">
      <div className="gallery-preview-container">

        <p className="gallery-preview-label">
          Gallery
        </p>

        <h2 className="gallery-preview-title">
          Experience The Atmosphere
        </h2>

        <p className="gallery-preview-description">
          A glimpse of unforgettable nights,
          incredible performances and magical
          moments from Waterfall Festival.
        </p>

        <div className="gallery-preview-grid">

          {items.map((item, index) => (
            <div
              key={item}
              className={`gallery-preview-image image-${index + 1}`}
            >
              <span>{item}</span>
            </div>
          ))}

        </div>

        <Link
          to="/gallery"
          className="gallery-preview-button"
        >
          View Full Gallery →
        </Link>

      </div>
    </section>
  );
}

export default GalleryPreviewSection;