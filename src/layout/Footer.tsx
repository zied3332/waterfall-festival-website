import { Link } from "react-router-dom";
import { Globe, Play, Music2, MessageCircle } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#05050d] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <h2 className="text-3xl font-black">Waterfall Festival</h2>
            <p className="mt-5 max-w-sm leading-7 text-gray-400">
              Experience Thailand's most unforgettable music festival in the
              heart of Koh Phangan.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[3px] text-violet-400">
              Festival
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/experience">Experience</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[3px] text-violet-400">
              Visitors
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/tickets">Tickets</Link></li>
              <li><Link to="/venue">Venue</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/chat">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-[3px] text-violet-400">
              Follow Us
            </h3>

            <div className="flex gap-3">
              {[Globe, MessageCircle, Play, Music2].map((Icon, index) => (
                <button
                  key={index}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-violet-600"
                >
                  <Icon size={19} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-5 border-t border-white/10 pt-8 text-sm text-gray-500 md:flex-row">
          <p>© 2026 Waterfall Festival. All rights reserved.</p>

          <div className="flex gap-6">
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