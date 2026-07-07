import "./style/gallery.css";

const galleryItems = [
  "Main Stage",
  "Crowd Energy",
  "Waterfall View",
  "VIP Zone",
  "Fire Show",
  "Aftermovie",
  "Food Area",
  "Jungle Lights",
];

function Gallery() {
  return (
    <section className="gallery-page">
      <div className="gallery-container">
        <p className="gallery-label">Gallery</p>

        <h1 className="gallery-title">Festival Moments</h1>

        <p className="gallery-description">
          Explore highlights from Waterfall Festival, including stages, crowds,
          jungle lights, performances, and unforgettable nights.
        </p>

        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div className="gallery-card" key={item}>
              <div className="gallery-image-placeholder">
                <span>{index + 1}</span>
              </div>

              <div className="gallery-card-content">
                <h3>{item}</h3>
                <p>Photo / video placeholder</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;