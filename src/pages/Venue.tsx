import "./style/venue.css";
import festivalMap from "./style/festival-map.png";

const mapItems = [
  { number: "🚪", name: "Entrance" },
  { number: "1", name: "Main Stage" },
  { number: "2", name: "Sky Stage" },
  { number: "3", name: "Secret Stage" },
  { number: "4", name: "Panorama Stage" },
  { number: "VIP", name: "VIP Zone" },
  { number: "🚻", name: "Toilets" },
  { number: "⛑", name: "First Aid" },
  { number: "🍔", name: "Food Area" },
  { number: "🅿", name: "Parking Area" },
];

function Venue() {
  return (
    <section className="venue-page">
      <div className="venue-container">
        <p className="venue-label">Venue</p>

        <h1 className="venue-title">Festival Map</h1>

        <p className="venue-description">
          Explore the festival before you arrive. Find every stage, food court,
          VIP area, parking, and important facilities.
        </p>

        <div className="venue-grid">

          {/* Map */}

          <div className="venue-map-card">
            <img
              src={festivalMap}
              alt="Waterfall Festival Map"
              className="venue-map-image"
            />
          </div>

          {/* Information */}

          <div className="venue-info-card">

            <h2>Key Locations</h2>

            <div className="venue-list">
              {mapItems.map((item) => (
                <div className="venue-list-item" key={item.name}>
                  <div className="venue-icon">
                    {item.number}
                  </div>

                  <p>{item.name}</p>
                </div>
              ))}
            </div>

            <button className="venue-button">
              Ask AI Assistant
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}

export default Venue;