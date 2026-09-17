import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Crown,
  MapPin,
  Ship,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import type {
  TouchEvent,
} from "react";

import "./PremiumExperiencesSection.css";

const EVENTPOP_URL =
  "https://www.eventpop.me/e/169991";

type PackageType =
  | "vip"
  | "boat";

type PackageFeature = {
  icon: React.ReactNode;
  text: string;
};

type ExperiencePackage = {
  id: PackageType;
  tabLabel: string;
  eyebrow: string;
  title: string;
  price: string;
  priceNote: string;
  description: string;
  badge: string;
  features: PackageFeature[];
  buttonLabel: string;
  note: React.ReactNode;
};

const packages: ExperiencePackage[] = [
  {
    id: "vip",

    tabLabel:
      "VIP",

    eyebrow:
      "The Ultimate",

    title:
      "VIP Experience",

    price:
      "2,500",

    priceNote:
      "Online price",

    description:
      "Take your Waterfall night to the next level with exclusive access, premium views and festival extras.",

    badge:
      "Limited to 150 tickets",

    features: [
      {
        icon: (
          <Crown
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "VIP Zone with panoramic views",
      },
      {
        icon: (
          <Sparkles
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "2 Signature Cocktails included",
      },
      {
        icon: (
          <Check
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "Exclusive VIP amenities",
      },
      {
        icon: (
          <Ticket
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "Waterfall Party merchandise",
      },
    ],

    buttonLabel:
      "Get VIP Ticket",

    note: (
      <>
        Door price{" "}
        <strong>
          ฿2,800
        </strong>
        . Online sales close at
        9:00 PM.
      </>
    ),
  },

  {
    id: "boat",

    tabLabel:
      "Boat + VIP",

    eyebrow:
      "From Koh Samui",

    title:
      "Boat Package + VIP",

    price:
      "4,000",

    priceNote:
      "Boat + VIP included",

    description:
      "Travel from Koh Samui to Koh Phangan, experience Waterfall as a VIP, then return after the party.",

    badge:
      "Round trip + VIP",

    features: [
      {
        icon: (
          <Ship
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "Koh Samui ↔ Koh Phangan",
      },
      {
        icon: (
          <Crown
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "VIP festival ticket included",
      },
      {
        icon: (
          <Clock3
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "Pickup 9:00–9:30 PM",
      },
      {
        icon: (
          <Clock3
            size={16}
            aria-hidden="true"
          />
        ),
        text:
          "Return around 4:30 AM",
      },
    ],

    buttonLabel:
      "Get Boat + VIP",

    note: (
      <>
        <strong>
          Minimum 6 passengers.
        </strong>{" "}
        If the minimum is not reached,
        our team will contact you and
        arrange a refund.
      </>
    ),
  },
];

function PremiumExperiencesSection() {
  const [
    activePackage,
    setActivePackage,
  ] = useState<PackageType>(
    "vip",
  );

  const touchStartX =
    useRef<number | null>(
      null,
    );

  const currentIndex =
    packages.findIndex(
      (item) =>
        item.id === activePackage,
    );

  const currentPackage =
    packages[currentIndex];

  const showPrevious =
    () => {
      const previousIndex =
        currentIndex === 0
          ? packages.length - 1
          : currentIndex - 1;

      setActivePackage(
        packages[
          previousIndex
        ].id,
      );
    };

  const showNext =
    () => {
      const nextIndex =
        currentIndex ===
        packages.length - 1
          ? 0
          : currentIndex + 1;

      setActivePackage(
        packages[nextIndex].id,
      );
    };

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    touchStartX.current =
      event.touches[0]
        .clientX;
  };

  const handleTouchEnd = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    if (
      touchStartX.current ===
      null
    ) {
      return;
    }

    const touchEndX =
      event.changedTouches[0]
        .clientX;

    const difference =
      touchStartX.current -
      touchEndX;

    /*
     * Ignore small finger movements.
     */
    if (
      Math.abs(difference) >
      45
    ) {
      if (difference > 0) {
        showNext();
      } else {
        showPrevious();
      }
    }

    touchStartX.current =
      null;
  };

  return (
    <section
      className="premium-slider"
      id="premium-experiences"
      aria-labelledby="premium-slider-title"
    >
      <div className="premium-slider__container">
        {/* =========================
            Section heading
        ========================= */}

        <header className="premium-slider__header">
          <div className="premium-slider__eyebrow">
            <span />

            <Sparkles
              size={13}
              aria-hidden="true"
            />

            Premium Experiences

            <span />
          </div>

          <h2
            id="premium-slider-title"
          >
            Upgrade Your
            <strong>
              Waterfall Night
            </strong>
          </h2>

          <p>
            Choose how you want to
            experience Waterfall.
          </p>
        </header>

        {/* =========================
            Package tabs
        ========================= */}

        <div
          className="premium-slider__tabs"
          role="tablist"
          aria-label="Waterfall premium packages"
        >
          {packages.map(
            (item) => {
              const isActive =
                activePackage ===
                item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={
                    isActive
                  }
                  className={
                    isActive
                      ? "premium-slider__tab premium-slider__tab--active"
                      : "premium-slider__tab"
                  }
                  onClick={() =>
                    setActivePackage(
                      item.id,
                    )
                  }
                >
                  {item.id ===
                  "vip" ? (
                    <Crown
                      size={15}
                      aria-hidden="true"
                    />
                  ) : (
                    <Ship
                      size={15}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {
                      item.tabLabel
                    }
                  </span>
                </button>
              );
            },
          )}
        </div>

        {/* =========================
            Carousel
        ========================= */}

        <div className="premium-slider__stage">
          <button
            type="button"
            className="premium-slider__arrow premium-slider__arrow--left"
            onClick={
              showPrevious
            }
            aria-label="Previous package"
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />
          </button>

          <div
            className={`premium-offer premium-offer--${currentPackage.id}`}
            onTouchStart={
              handleTouchStart
            }
            onTouchEnd={
              handleTouchEnd
            }
          >
            {/* =====================
                Visual area
            ===================== */}

            <div className="premium-offer__visual">
              <div
                className="premium-offer__visual-glow"
                aria-hidden="true"
              />

              <div
                className="premium-offer__visual-lines"
                aria-hidden="true"
              />

              <div className="premium-offer__visual-top">
                <span className="premium-offer__badge">
                  {
                    currentPackage.badge
                  }
                </span>

                <span className="premium-offer__swipe">
                  Swipe
                  <ArrowRight
                    size={12}
                    aria-hidden="true"
                  />
                </span>
              </div>

              {currentPackage.id ===
              "vip" ? (
                <div className="premium-offer__art premium-offer__art--vip">
                  <Crown
                    size={74}
                    strokeWidth={1}
                    aria-hidden="true"
                  />

                  <span>
                    VIP
                  </span>
                </div>
              ) : (
                <div className="premium-offer__art premium-offer__art--boat">
                  <div className="premium-offer__route">
                    <div>
                      <MapPin
                        size={16}
                        aria-hidden="true"
                      />

                      <span>
                        Koh Samui
                      </span>
                    </div>

                    <span className="premium-offer__route-line">
                      <span />

                      <Ship
                        size={26}
                        aria-hidden="true"
                      />

                      <span />
                    </span>

                    <div>
                      <MapPin
                        size={16}
                        aria-hidden="true"
                      />

                      <span>
                        Koh Phangan
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="premium-offer__visual-copy">
                <span>
                  {
                    currentPackage.eyebrow
                  }
                </span>

                <strong>
                  {
                    currentPackage.title
                  }
                </strong>
              </div>
            </div>

            {/* =====================
                Information
            ===================== */}

            <div className="premium-offer__body">
              <div className="premium-offer__main">
                <div className="premium-offer__title-area">
                  <span>
                    {
                      currentPackage.eyebrow
                    }
                  </span>

                  <h3>
                    {
                      currentPackage.title
                    }
                  </h3>
                </div>

                <div className="premium-offer__price">
                  <small>
                    ฿
                  </small>

                  <strong>
                    {
                      currentPackage.price
                    }
                  </strong>

                  <span>
                    THB
                  </span>
                </div>
              </div>

              <div className="premium-offer__price-note">
                {
                  currentPackage.priceNote
                }
              </div>

              <p className="premium-offer__description">
                {
                  currentPackage.description
                }
              </p>

              <div className="premium-offer__features">
                {currentPackage.features.map(
                  (
                    feature,
                    index,
                  ) => (
                    <div
                      className="premium-offer__feature"
                      key={`${currentPackage.id}-${index}`}
                    >
                      <span>
                        {
                          feature.icon
                        }
                      </span>

                      {
                        feature.text
                      }
                    </div>
                  ),
                )}
              </div>

              <a
                href={
                  EVENTPOP_URL
                }
                target="_blank"
                rel="noopener noreferrer"
                className="premium-offer__cta"
              >
                {currentPackage.id ===
                "vip" ? (
                  <Crown
                    size={17}
                    aria-hidden="true"
                  />
                ) : (
                  <Ship
                    size={17}
                    aria-hidden="true"
                  />
                )}

                <span>
                  {
                    currentPackage.buttonLabel
                  }
                </span>

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </a>

              <div className="premium-offer__note">
                {currentPackage.id ===
                "boat" && (
                  <Users
                    size={13}
                    aria-hidden="true"
                  />
                )}

                <p>
                  {
                    currentPackage.note
                  }
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="premium-slider__arrow premium-slider__arrow--right"
            onClick={
              showNext
            }
            aria-label="Next package"
          >
            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* =========================
            Carousel dots
        ========================= */}

        <div className="premium-slider__dots">
          {packages.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className={
                  activePackage ===
                  item.id
                    ? "premium-slider__dot premium-slider__dot--active"
                    : "premium-slider__dot"
                }
                onClick={() =>
                  setActivePackage(
                    item.id,
                  )
                }
                aria-label={`Show ${item.tabLabel} package`}
              />
            ),
          )}
        </div>

        <p className="premium-slider__mobile-hint">
          Swipe to explore packages
        </p>
      </div>
    </section>
  );
}

export default PremiumExperiencesSection;