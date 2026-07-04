import { Link } from "react-router-dom";

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
            A clean first prototype focused on layout, user flow,
            ticket conversion and mobile experience.
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

      {/* ================= FEATURES ================= */}

      <section className="bg-gray-50 py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-16 text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
              Explore
            </p>

            <h2 className="mt-4 text-4xl font-bold text-gray-900">
              Everything You Need
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              This is the first UX prototype. Every section uses placeholder
              content that will later become the real festival experience.
            </p>

          </div>

          <div className="grid gap-8 md:grid-cols-3">

            {[
              {
                title: "Upcoming Events",
                description:
                  "Discover every upcoming party and special event.",
              },
              {
                title: "Ticket Options",
                description:
                  "Choose the perfect ticket for your adventure.",
              },
              {
                title: "Festival Guide",
                description:
                  "Everything you need before arriving on the island.",
              },
            ].map((card) => (

              <div
                key={card.title}
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-gray-200
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-xl
                "
              >

                {/* Image Placeholder */}

                <div className="flex h-52 items-center justify-center bg-gray-200 text-gray-400">
                  Image Placeholder
                </div>

                {/* Content */}

                <div className="p-8">

                  <h3 className="text-2xl font-bold text-gray-900">
                    {card.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-600">
                    {card.description}
                  </p>

                  <button
                    className="
                      mt-8
                      font-semibold
                      text-gray-900
                      transition
                      hover:translate-x-1
                    "
                  >
                    Learn More →
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>
    </>
  );
}

export default Home;