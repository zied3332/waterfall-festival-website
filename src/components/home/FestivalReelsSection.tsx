import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Film,
} from "lucide-react";

import { Link } from "react-router-dom";

import { getHomepageVideos } from "../../services/gallery.service";

import type { GalleryImage } from "../../types/gallery";

import FestivalReelCard from "./FestivalReelCard";

import "./festival-reels.css";

export default function FestivalReelsSection() {
  const [videos, setVideos] =
    useState<GalleryImage[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [hasError, setHasError] =
    useState(false);

  const scrollContainerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      try {
        setIsLoading(true);
        setHasError(false);

        const response =
          await getHomepageVideos();

        if (!isMounted) {
          return;
        }

        const homepageVideos =
          response
            .filter(
              (video) =>
                video.mediaType ===
                  "VIDEO" &&
                video.status ===
                  "PUBLISHED" &&
                video.showOnHomepage,
            )
            .sort(
              (
                firstVideo,
                secondVideo,
              ) =>
                firstVideo.homepageSortOrder -
                secondVideo.homepageSortOrder,
            );

        setVideos(
          homepageVideos,
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  function scrollReels(
    direction:
      | "left"
      | "right",
  ) {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        ".festival-reel-card",
      );

    const cardWidth =
      firstCard?.offsetWidth ??
      container.clientWidth;

    const gap = 18;

    container.scrollBy({
      left:
        direction === "right"
          ? cardWidth + gap
          : -(cardWidth + gap),

      behavior:
        "smooth",
    });
  }

  if (isLoading) {
    return (
      <section
        className="festival-reels"
        aria-label="Festival reels"
      >
        <div className="festival-reels__container">
          <div className="festival-reels__header">
            <div>
              <span className="festival-reels__eyebrow">
                Festival Moments
              </span>

              <h2>
                Feel the Waterfall
              </h2>
            </div>
          </div>

          <div
            className="festival-reels__loading"
            aria-hidden="true"
          >
            <div />
            <div />
            <div />
          </div>
        </div>
      </section>
    );
  }

  if (
    hasError ||
    videos.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="festival-reels"
      aria-labelledby="festival-reels-title"
    >
      <div className="festival-reels__container">
        <div className="festival-reels__header">
          <div className="festival-reels__heading">
            <div className="festival-reels__eyebrow">
              <Film
                size={15}
                aria-hidden="true"
              />

              <span>
                Festival Moments
              </span>
            </div>

            <h2
              id="festival-reels-title"
            >
              Feel the Waterfall
            </h2>

            <p>
              Real moments from Waterfall
              Festival — music, fire,
              lights, and energy from Koh
              Phangan.
            </p>
          </div>

          {videos.length > 1 && (
            <div className="festival-reels__controls">
              <button
                type="button"
                onClick={() =>
                  scrollReels("left")
                }
                aria-label="Previous festival reels"
              >
                <ArrowLeft
                  size={19}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollReels("right")
                }
                aria-label="Next festival reels"
              >
                <ArrowRight
                  size={19}
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="festival-reels__track"
          aria-label="Festival video reels"
        >
          {videos.map(
            (video) => (
              <FestivalReelCard
                key={video.id}
                video={video}
              />
            ),
          )}
        </div>

        <div className="festival-reels__footer">
          {videos.length > 1 ? (
            <span>
              Swipe to watch more
            </span>
          ) : (
            <span>
              Festival moments
            </span>
          )}

          <Link to="/gallery">
            View Gallery

            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}