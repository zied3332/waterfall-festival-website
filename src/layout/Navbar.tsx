import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Ticket } from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa6";
import "./Navbar.css";
import logo from "./logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <nav className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <img src={logo} alt="Waterfall Festival" className="navbar__logo" />
        </Link>

        <button
          className="navbar__menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/events" onClick={closeMenu}>Events</NavLink>
          <NavLink to="/tickets" onClick={closeMenu}>Tickets</NavLink>
          <NavLink to="/experience" onClick={closeMenu}>Experience</NavLink>
          <NavLink to="/gallery" onClick={closeMenu}>Gallery</NavLink>
          <NavLink to="/venue" onClick={closeMenu}>Venue</NavLink>
          <NavLink to="/faq" onClick={closeMenu}>FAQ</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
        </div>

        <div className="navbar__right">
          <div className="navbar__socials">
            <FaInstagram size={18} />
            <FaFacebookF size={16} />
            <FaYoutube size={19} />
            <FaTiktok size={17} />
          </div>

          <select className="navbar__lang">
            <option>EN</option>
            <option>FR</option>
          </select>

          <Link to="/tickets" className="navbar__button">
            <Ticket size={16} />
            Get Tickets
          </Link>
        </div>
      </nav>
    </header>
  );
}