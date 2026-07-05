import { Link } from "react-router-dom";
import UpcomingEventsSection from "../components/events/UpcomingEventsSection";

function Home() {
  return (
    <>
      {/* ================= HERO ================= */}

      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-gray-900">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black" />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.45em] text-gray-300">
            Koh Phangan, Thailand
          </p>

          <h1 className="text-5xl font-black leading-none text-white md:text-7xl lg:text-8xl">
            Experience
            <br />
            The Waterfall
            <br />
            Festival
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-300">
            A clean first prototype focused on layout, user flow, ticket
            conversion and mobile experience.
          </p>

          {/* Buttons */}

          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link
              to="/tickets"
              className="
                rounded-full
                bg-white
                px-9
                py-4
                font-semibold
                text-gray-900
                shadow-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
              "
            >
              Get Tickets
            </Link>

            <Link
              to="/events"
              className="
                rounded-full
                border
                border-white/70
                bg-white/5
                px-9
                py-4
                font-semibold
                text-white
                backdrop-blur-sm
                transition-all
                duration-300
                hover:bg-white
                hover:text-black
                hover:-translate-y-1
              "
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* ================= UPCOMING EVENTS ================= */}

      <UpcomingEventsSection />
    </>
  );
}

export default Home;