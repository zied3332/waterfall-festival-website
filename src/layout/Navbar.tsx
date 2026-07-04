import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "72px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <h2>Waterfall Festival</h2>

        <div
          style={{
            display: "flex",
            gap: "28px",
          }}
        >
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/tickets">Tickets</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/experience">Experience</Link>
        </div>
      </nav>
    </header>
  );
}