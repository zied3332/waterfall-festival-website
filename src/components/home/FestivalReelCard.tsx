import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  getApiMediaUrl,
} from "../../services/api.service";

import type {
  GalleryImage,
} from "../../types/gallery";

type FestivalReelCardProps = {
  video: GalleryImage;
};

export default function FestivalReelCard({
  video,
}: FestivalReelCardProps) {
  const cardRef =
    useRef<HTMLElement | null>(
      null,
    );

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null,
    );

  const isVisibleRef =
    useRef(false);

  const [hasVideoError, setHasVideoError] =
    useState(false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(true);

  /*
   * =========================================================
   * MEDIA URLS
   * =========================================================
   *
   * New gallery uploads are stored in the database as:
   *
   * /uploads/gallery/videos/example.mp4
   *
   * getApiMediaUrl() converts that into the complete backend URL.
   *
   * Existing absolute URLs are preserved.
   * =========================================================
   */

  const videoUrl =
    getApiMediaUrl(
      video.imageUrl,
    );

  const posterUrl =
    getApiMediaUrl(
      video.thumbnailUrl,
    );

  /*
   * =========================================================
   * RESET WHEN VIDEO CHANGES
   * =========================================================
   */

  useEffect(() => {
    setHasVideoError(false);
    setIsPlaying(false);
    setIsMuted(true);
  }, [
    video.id,
    videoUrl,
  ]);

  /*
   * =========================================================
   * AUTO PLAY / PAUSE
   * =========================================================
   */

  useEffect(() => {
    const cardElement =
      cardRef.current;

    const currentVideoElement =
      videoRef.current;

    if (
      !cardElement ||
      !currentVideoElement ||
      !videoUrl ||
      hasVideoError
    ) {
      return;
    }

    /*
     * Keep a stable non-null reference for callbacks.
     */
    const videoElement =
      currentVideoElement;

    videoElement.muted = true;
    videoElement.playsInline = true;

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (!entry) {
            return;
          }

          const isVisible =
            entry.isIntersecting &&
            entry.intersectionRatio >=
              0.55;

          isVisibleRef.current =
            isVisible;

          if (isVisible) {
            void videoElement
              .play()
              .catch(() => {
                setIsPlaying(false);
              });

            return;
          }

          videoElement.pause();
        },
        {
          threshold: [
            0,
            0.25,
            0.55,
            0.75,
            1,
          ],
        },
      );

    observer.observe(
      cardElement,
    );

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        videoElement.pause();

        return;
      }

      if (isVisibleRef.current) {
        void videoElement
          .play()
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      observer.disconnect();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      videoElement.pause();
    };
  }, [
    videoUrl,
    hasVideoError,
  ]);

  /*
   * =========================================================
   * VIDEO ERROR
   * =========================================================
   */

  function handleVideoError() {
    console.error(
      `Festival reel failed to load: ${video.title}`,
      videoUrl,
    );

    setHasVideoError(true);
    setIsPlaying(false);
  }

  /*
   * =========================================================
   * PLAY / PAUSE
   * =========================================================
   */

  async function togglePlayback() {
    const videoElement =
      videoRef.current;

    if (
      !videoElement ||
      !videoUrl ||
      hasVideoError
    ) {
      return;
    }

    try {
      if (
        videoElement.paused ||
        videoElement.ended
      ) {
        await videoElement.play();

        return;
      }

      videoElement.pause();
    } catch {
      setIsPlaying(false);
    }
  }

  /*
   * =========================================================
   * SOUND
   * =========================================================
   */

  function toggleMuted() {
    const videoElement =
      videoRef.current;

    if (
      !videoElement ||
      !videoUrl ||
      hasVideoError
    ) {
      return;
    }

    const nextMuted =
      !videoElement.muted;

    videoElement.muted =
      nextMuted;

    setIsMuted(
      nextMuted,
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <article
      ref={cardRef}
      className="festival-reel-card"
    >
      <div className="festival-reel-card__media">
        {!hasVideoError && videoUrl ? (
          <video
            ref={videoRef}
            className="festival-reel-card__video"
            src={videoUrl}
            poster={
              posterUrl ??
              undefined
            }
            muted={isMuted}
            playsInline
            loop
            preload="metadata"
            onClick={
              togglePlayback
            }
            onError={
              handleVideoError
            }
            onPlay={() => {
              setIsPlaying(true);
            }}
            onPause={() => {
              setIsPlaying(false);
            }}
            onEnded={() => {
              setIsPlaying(false);
            }}
            aria-label={
              video.altText ??
              video.title
            }
          />
        ) : (
          <div className="festival-reel-card__error">
            <span>
              Video unavailable
            </span>
          </div>
        )}

        {!hasVideoError && videoUrl && (
          <>
            <button
              type="button"
              className={`festival-reel-card__play ${
                isPlaying
                  ? "festival-reel-card__play--playing"
                  : ""
              }`}
              onClick={
                togglePlayback
              }
              aria-label={
                isPlaying
                  ? `Pause ${video.title}`
                  : `Play ${video.title}`
              }
            >
              {isPlaying ? (
                <Pause
                  size={22}
                  aria-hidden="true"
                />
              ) : (
                <Play
                  size={26}
                  aria-hidden="true"
                />
              )}
            </button>

            <button
              type="button"
              className="festival-reel-card__sound"
              onClick={
                toggleMuted
              }
              aria-label={
                isMuted
                  ? `Unmute ${video.title}`
                  : `Mute ${video.title}`
              }
            >
              {isMuted ? (
                <VolumeX
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Volume2
                  size={18}
                  aria-hidden="true"
                />
              )}
            </button>
          </>
        )}

        <div
          className="festival-reel-card__gradient"
          aria-hidden="true"
        />

        <div className="festival-reel-card__content">
          <span className="festival-reel-card__badge">
            Festival Reel
          </span>

          <h3>
            {video.title}
          </h3>

          {video.description && (
            <p>
              {video.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}