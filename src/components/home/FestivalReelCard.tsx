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

import type { GalleryImage } from "../../types/gallery";

type FestivalReelCardProps = {
  video: GalleryImage;
};

export default function FestivalReelCard({
  video,
}: FestivalReelCardProps) {
  const cardRef =
    useRef<HTMLElement | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const isVisibleRef =
    useRef(false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(true);

  useEffect(() => {
    const cardElement =
      cardRef.current;

    const videoElement =
      videoRef.current;

    if (
      !cardElement ||
      !videoElement
    ) {
      return;
    }

    /*
     * Keep autoplay compatible with
     * Safari/iPhone and other mobile
     * browsers.
     */
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

      if (
        isVisibleRef.current
      ) {
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
  }, []);

  async function togglePlayback() {
    const videoElement =
      videoRef.current;

    if (!videoElement) {
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

  function toggleMuted() {
    const videoElement =
      videoRef.current;

    if (!videoElement) {
      return;
    }

    const nextMuted =
      !videoElement.muted;

    videoElement.muted =
      nextMuted;

    setIsMuted(nextMuted);
  }

  return (
    <article
      ref={cardRef}
      className="festival-reel-card"
    >
      <div className="festival-reel-card__media">
        <video
          ref={videoRef}
          className="festival-reel-card__video"
          src={video.imageUrl}
          poster={
            video.thumbnailUrl ??
            undefined
          }
          muted={isMuted}
          playsInline
          loop
          preload="metadata"
          onClick={togglePlayback}
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

        <button
          type="button"
          className={`festival-reel-card__play ${
            isPlaying
              ? "festival-reel-card__play--playing"
              : ""
          }`}
          onClick={togglePlayback}
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
          onClick={toggleMuted}
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