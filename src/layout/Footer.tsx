import { Link } from "react-router-dom";
import { Globe, Play, Music2, MessageCircle } from "lucide-react";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">

        <div className="footer__grid">

          <div className="footer__brand">
            <h2>Waterfall Festival</h2>

            <p>
              Experience Thailand's most unforgettable music festival in the
              heart of Koh Phangan. Music, nature and unforgettable memories
              await.
            </p>
          </div>

          <div>
            <h3>Festival</h3>

            <ul>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/experience">Experience</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3>Visitors</h3>

            <ul>
              <li><Link to="/tickets">Tickets</Link></li>
              <li><Link to="/venue">Venue</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/chat">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h3>Follow Us</h3>

            <div className="footer__socials">
              {[Globe, MessageCircle, Play, Music2].map((Icon, index) => (
                <button key={index}>
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="footer__bottom">
          <p>© 2026 Waterfall Festival. All rights reserved.</p>

          <div className="footer__links">
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
            <Link to="/">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;