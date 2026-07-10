import { useEffect, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
} from "lucide-react";

import "./style/gallery.css";

import gallery1 from "../../assets/gallery-1.jpg";
import gallery2 from "../../assets/gallery-2.jpg";
import gallery3 from "../../assets/gallery-3.jpg";
import gallery4 from "../../assets/gallery-4.jpg";
import gallery5 from "../../assets/gallery-5.jpg";

type GalleryCategory =
  | "All"
  | "Stage"
  | "Crowd"
  | "Experience"
  | "Nature";

type GalleryItem = {
  id: number;
  title: string;
  category: Exclude<GalleryCategory, "All">;
  image: string;
  type: "photo" | "video";
  size: "standard" | "wide" | "tall" | "large";
};

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Waterfall Main Stage",
    category: "Stage",
    image: gallery1,
    type: "photo",
    size: "large",
  },
  {
    id: 2,
    title: "Fire Under the Stars",
    category: "Experience",
    image: gallery2,
    type: "video",
    size: "standard",
  },
  {
    id: 3,
    title: "Festival Friends",
    category: "Crowd",
    image: gallery3,
    type: "photo",
    size: "tall",
  },
  {
    id: 4,
    title: "Jungle Night Lights",
    category: "Nature",
    image: gallery4,
    type: "photo",
    size: "standard",
  },
  {
    id: 5,
    title: "Dance Until Sunrise",
    category: "Crowd",
    image: gallery5,
    type: "video",
    size: "wide",
  },
  {
    id: 6,
    title: "Electric Stage Energy",
    category: "Stage",
    image: gallery2,
    type: "photo",
    size: "standard",
  },
  {
    id: 7,
    title: "Island Festival Escape",
    category: "Nature",
    image: gallery1,
    type: "photo",
    size: "tall",
  },
  {
    id: 8,
    title: "An Unforgettable Night",
    category: "Experience",
    image: gallery3,
    type: "video",
    size: "wide",
  },
];

const categories: GalleryCategory[] = [
  "All",
  "Stage",
  "Crowd",
  "Experience",
  "Nature",
];

function Gallery() {
  const [activeCategory, setActiveCategory] =
    useState<GalleryCategory>("All");

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const selectedItem =
    selectedIndex !== null ? filteredItems[selectedIndex] : null;

  const openGalleryItem = (index: number) => {
    setSelectedIndex(index);
  };

  const closeGalleryItem = () => {
    setSelectedIndex(null);
  };

  const showPreviousItem = () => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return null;
      }

      return currentIndex === 0
        ? filteredItems.length - 1
        : currentIndex - 1;
    });
  };

  const showNextItem = () => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return null;
      }

      return currentIndex === filteredItems.length - 1
        ? 0
        : currentIndex + 1;
    });
  };

  const handleCategoryChange = (category: GalleryCategory) => {
    setActiveCategory(category);
    setSelectedIndex(null);
  };

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (selectedIndex === null) {
        return;
      }

      if (event.key === "Escape") {
        closeGalleryItem();
      }

      if (event.key === "ArrowLeft") {
        showPreviousItem();
      }

      if (event.key === "ArrowRight") {
        showNextItem();
      }
    };

    window.addEventListener("keydown", handleKeyboardNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [selectedIndex, filteredItems.length]);

  useEffect(() => {
    document.body.style.overflow =
      selectedIndex !== null ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <main className="gallery-page">
      <div className="gallery-page__background" aria-hidden="true">
        <div className="gallery-page__orb gallery-page__orb--one" />
        <div className="gallery-page__orb gallery-page__orb--two" />
        <div className="gallery-page__grid-pattern" />
      </div>

      <section className="gallery-hero">
        <div className="gallery-container">
          <div className="gallery-hero__content">
            <div className="gallery-hero__eyebrow">
              <Camera size={16} />
              <span>Waterfall Memories</span>
            </div>

            <h1 className="gallery-hero__title">
              Moments that live
              <span> forever.</span>
            </h1>

            <p className="gallery-hero__description">
              Step inside the energy of Waterfall Festival. Explore powerful
              performances, unforgettable crowds, tropical landscapes and
              nights filled with music.
            </p>

            <div className="gallery-hero__stats">
              <div className="gallery-hero__stat">
                <strong>100+</strong>
                <span>Festival moments</span>
              </div>

              <div className="gallery-hero__divider" />

              <div className="gallery-hero__stat">
                <strong>5</strong>
                <span>Unique experiences</span>
              </div>

              <div className="gallery-hero__divider" />

              <div className="gallery-hero__stat">
                <strong>1</strong>
                <span>Unforgettable island</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-showcase">
        <div className="gallery-container">
          <div className="gallery-toolbar">
            <div>
              <span className="gallery-toolbar__label">Explore the festival</span>
              <h2>Captured in the moment</h2>
            </div>

            <div
              className="gallery-filters"
              role="group"
              aria-label="Gallery filters"
            >
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`gallery-filter ${
                    activeCategory === category
                      ? "gallery-filter--active"
                      : ""
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="gallery-grid">
            {filteredItems.map((item, index) => (
              <button
                type="button"
                className={`gallery-card gallery-card--${item.size}`}
                key={item.id}
                onClick={() => openGalleryItem(index)}
                aria-label={`Open ${item.title}`}
              >
                <img
                  className="gallery-card__image"
                  src={item.image}
                  alt={item.title}
                />

                <div className="gallery-card__shade" />

                <div className="gallery-card__top">
                  <span className="gallery-card__category">
                    {item.category}
                  </span>

                  <span className="gallery-card__type">
                    {item.type === "video" ? (
                      <>
                        <Play size={14} fill="currentColor" />
                        Video
                      </>
                    ) : (
                      <>
                        <Camera size={14} />
                        Photo
                      </>
                    )}
                  </span>
                </div>

                {item.type === "video" && (
                  <span className="gallery-card__play" aria-hidden="true">
                    <Play size={24} fill="currentColor" />
                  </span>
                )}

                <div className="gallery-card__content">
                  <span>Waterfall Festival</span>
                  <h3>{item.title}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedItem && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={closeGalleryItem}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={closeGalleryItem}
            aria-label="Close image viewer"
          >
            <X size={24} />
          </button>

          {filteredItems.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-lightbox__navigation gallery-lightbox__navigation--previous"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousItem();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                type="button"
                className="gallery-lightbox__navigation gallery-lightbox__navigation--next"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextItem();
                }}
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <div
            className="gallery-lightbox__content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gallery-lightbox__image-wrapper">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="gallery-lightbox__image"
              />

              {selectedItem.type === "video" && (
                <div className="gallery-lightbox__play">
                  <Play size={30} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="gallery-lightbox__details">
              <div>
                <span>{selectedItem.category}</span>
                <h2>{selectedItem.title}</h2>
              </div>

              <p>
                {selectedIndex !== null ? selectedIndex + 1 : 1} /{" "}
                {filteredItems.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Gallery;