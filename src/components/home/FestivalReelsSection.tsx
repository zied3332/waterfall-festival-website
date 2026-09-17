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

/* =========================================================
   LOCAL FALLBACK REELS

   Used when:
   - The API/backend fails
   - The backend returns no homepage videos

   Files:
   public/videos/reels/waterfall-reel-1.mp4
   public/videos/reels/waterfall-reel-2.mp4
   public/videos/reels/waterfall-reel-3.mp4
========================================================= */

const FALLBACK_REELS: GalleryImage[] = [
  {
    id: -1,

    title:
      "Waterfall Festival Moment 1",

    mediaType:
      "VIDEO",

    status:
      "PUBLISHED",

    showOnHomepage:
      true,

    homepageSortOrder:
      1,

    imageUrl:
      "/videos/reels/waterfall-reel-1.mp4",
  },

  {
    id: -2,

    title:
      "Waterfall Festival Moment 2",

    mediaType:
      "VIDEO",

    status:
      "PUBLISHED",

    showOnHomepage:
      true,

    homepageSortOrder:
      2,

    imageUrl:
      "/videos/reels/waterfall-reel-2.mp4",
  },

  {
    id: -3,

    title:
      "Waterfall Festival Moment 3",

    mediaType:
      "VIDEO",

    status:
      "PUBLISHED",

    showOnHomepage:
      true,

    homepageSortOrder:
      3,

    imageUrl:
      "/videos/reels/waterfall-reel-3.mp4",
  },
] as GalleryImage[];

/* =========================================================
   LOCAL FALLBACK VIDEO PATHS

   These are passed directly to each FestivalReelCard.

   This is important because we do NOT want the card
   to guess its fallback based on homepageSortOrder.

   Card 1 -> reel 1
   Card 2 -> reel 2
   Card 3 -> reel 3
========================================================= */

const FALLBACK_VIDEO_URLS = [
  "/videos/reels/waterfall-reel-1.mp4",
  "/videos/reels/waterfall-reel-2.mp4",
  "/videos/reels/waterfall-reel-3.mp4",
];

export default function FestivalReelsSection() {
  const [videos, setVideos] =
    useState<GalleryImage[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const scrollContainerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      try {
        setIsLoading(true);

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

        /*
         * Backend works, but there are
         * no homepage videos.
         *
         * Use the local fallback reels.
         */

        if (
          homepageVideos.length === 0
        ) {
          console.warn(
            "No homepage reels returned. Using local fallback reels.",
          );

          setVideos(
            FALLBACK_REELS,
          );

          return;
        }

        /*
         * Backend returned videos.
         *
         * We keep the backend records.
         *
         * FestivalReelCard will try the
         * remote video first.
         *
         * If the remote video fails,
         * the card receives its exact
         * local fallback URL based on
         * its position in this list.
         */

        setVideos(
          homepageVideos,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        /*
         * Backend/API unavailable.
         *
         * Use the local reels so this
         * homepage section never disappears.
         */

        console.warn(
          "Festival reels API unavailable. Using local fallback reels.",
          error,
        );

        setVideos(
          FALLBACK_REELS,
        );
      } finally {
        if (isMounted) {
          setIsLoading(
            false,
          );
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

  /* =========================================================
     LOADING STATE
  ========================================================= */

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

  /* =========================================================
     FESTIVAL REELS
  ========================================================= */

  return (
    <section
      className="festival-reels"
      aria-labelledby="festival-reels-title"
    >
      <div className="festival-reels__container">

        {/* =========================
            Header
        ========================= */}

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

          {/* =========================
              Desktop controls
          ========================= */}

          {videos.length > 1 && (
            <div className="festival-reels__controls">

              <button
                type="button"
                onClick={() =>
                  scrollReels(
                    "left",
                  )
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
                  scrollReels(
                    "right",
                  )
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

        {/* =========================
            Reels track
        ========================= */}

        <div
          ref={scrollContainerRef}
          className="festival-reels__track"
          aria-label="Festival video reels"
        >
          {videos.map(
            (
              video,
              index,
            ) => {
              /*
               * Give each card its own
               * deterministic local fallback.
               *
               * 0 -> reel 1
               * 1 -> reel 2
               * 2 -> reel 3
               *
               * If there are more than
               * three backend videos, the
               * fallback sequence repeats.
               */

              const fallbackVideoUrl =
                FALLBACK_VIDEO_URLS[
                  index %
                    FALLBACK_VIDEO_URLS.length
                ];

              return (
                <FestivalReelCard
                  key={video.id}
                  video={video}
                  fallbackVideoUrl={
                    fallbackVideoUrl
                  }
                />
              );
            },
          )}
        </div>

        {/* =========================
            Footer
        ========================= */}

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