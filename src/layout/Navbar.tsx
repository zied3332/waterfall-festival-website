import { Link, NavLink } from "react-router-dom";
import { Ticket } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa6";
import "./Navbar.css";
import logo from "./logo.png";
export default function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__inner">
      <Link to="/" className="navbar__brand">
  <img
    src={logo}
    alt="Waterfall Festival"
    className="navbar__logo"
  />
</Link>

        <div className="navbar__links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/tickets">Tickets</NavLink>
          <NavLink to="/experience">Experience</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/info">Info</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/contact">Contact</NavLink>
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