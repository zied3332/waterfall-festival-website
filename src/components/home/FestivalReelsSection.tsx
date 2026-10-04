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

import {
  Link,
} from "react-router-dom";

import {
  getHomepageVideos,
} from "../../services/gallery.service";

import type {
  GalleryImage,
} from "../../types/gallery";

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

  /*
   * =========================================================
   * LOAD HOMEPAGE VIDEOS FROM DATABASE
   * =========================================================
   */

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
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Unable to load homepage festival videos.",
          error,
        );

        setVideos([]);
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

  /*
   * =========================================================
   * REEL NAVIGATION
   * =========================================================
   */

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

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (isLoading) {
    return (
      <section
        className="festival-reels"
        aria-label="Festival video reels"
      >
        <div className="festival-reels__container">
          <div className="festival-reels__loading">
            <div />
            <div />
            <div />
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * EMPTY / ERROR
   * =========================================================
   */

  if (videos.length === 0) {
    return (
      <section
        className="festival-reels festival-reels--empty"
        aria-label="Festival video reels"
      >
        <div className="festival-reels__container">
          <div className="festival-reels__empty">
            <Film
              size={22}
              aria-hidden="true"
            />

            <span>
              {hasError
                ? "Festival moments are temporarily unavailable."
                : "New festival moments coming soon."}
            </span>
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * REELS
   * =========================================================
   *
   * No large heading is rendered here.
   * The videos are the first visual content.
   * =========================================================
   */

  return (
    <section
      className="festival-reels festival-reels--hero"
      aria-label="Waterfall Festival video reels"
    >
      <div className="festival-reels__container">

        {/*
         * =====================================================
         * VIDEO TRACK
         * =====================================================
         */}

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

        {/*
         * =====================================================
         * COMPACT FOOTER
         * =====================================================
         */}

        <div className="festival-reels__footer">
          <span>
            {videos.length > 1
              ? "Swipe to watch more"
              : "Festival moment"}
          </span>

          <div className="festival-reels__footer-actions">
            {videos.length > 1 && (
              <div className="festival-reels__controls">
                <button
                  type="button"
                  onClick={() =>
                    scrollReels(
                      "left",
                    )
                  }
                  aria-label="Previous festival reel"
                >
                  <ArrowLeft
                    size={18}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollReels(
                      "right",
                    )
                  }
                  aria-label="Next festival reel"
                >
                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}

            <Link to="/gallery">
              View Gallery

              <ArrowRight
                size={15}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}