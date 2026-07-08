import "./style/experience.css";

const experiences = [
  {
    title: "Live Music",
    description:
      "Dance all night with international DJs and unforgettable performances.",
  },
  {
    title: "Waterfall Stage",
    description:
      "Experience music beneath the iconic waterfall surrounded by nature.",
  },
  {
    title: "Fire Shows",
    description:
      "Watch spectacular fire performances throughout the night.",
  },
  {
    title: "VIP Experience",
    description:
      "Relax in exclusive VIP areas with premium services and bars.",
  },
  {
    title: "Food & Drinks",
    description:
      "Discover local Thai food, cocktails, fresh fruit, and festival bars.",
  },
  {
    title: "Jungle Atmosphere",
    description:
      "Immerse yourself in lights, nature, music, and unforgettable vibes.",
  },
];

function Experience() {
  return (
    <section className="experience-page">
      <div className="experience-container">
        <div className="experience-hero">
          <p className="experience-label">Experience</p>

          <h1 className="experience-title">
            More Than A Festival
          </h1>

          <p className="experience-description">
            Waterfall Festival is more than music. It's an unforgettable
            combination of nature, lights, world-class DJs, incredible people,
            and magical moments beneath the waterfalls of Koh Phangan.
          </p>
        </div>

        <div className="experience-grid">
          {experiences.map((item) => (
            <article className="experience-card" key={item.title}>
              <div className="experience-image" />

              <div className="experience-content">
                <h2>{item.title}</h2>

                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="experience-bottom">
          <h2>Create Memories That Last Forever</h2>

          <p>
            Whether you're coming with friends or traveling solo, every night at
            Waterfall Festival becomes a story worth remembering.
          </p>

          <button>Get Your Tickets</button>
        </div>
      </div>
    </section>
  );
}

export default Experience;