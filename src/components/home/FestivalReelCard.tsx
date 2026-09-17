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

import type {
  GalleryImage,
} from "../../types/gallery";

type FestivalReelCardProps = {
  video: GalleryImage;

  /*
   * Local MP4 assigned by FestivalReelsSection.
   *
   * Example:
   * /videos/reels/waterfall-reel-1.mp4
   */
  fallbackVideoUrl: string;
};

export default function FestivalReelCard({
  video,
  fallbackVideoUrl,
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

  /*
   * Start with the backend/Cloudinary URL.
   *
   * If there is no remote URL, immediately
   * use the local fallback.
   */
  const [videoSource, setVideoSource] =
    useState<string>(
      video.imageUrl ||
        fallbackVideoUrl,
    );

  /*
   * Cloudinary thumbnails are also unavailable
   * while the Cloudinary account is disabled.
   *
   * We initially try the thumbnail, but remove
   * it if the remote video fails.
   */
  const [posterSource, setPosterSource] =
    useState<string | undefined>(
      video.thumbnailUrl ??
        undefined,
    );

  const [
    usingFallback,
    setUsingFallback,
  ] = useState(
    !video.imageUrl,
  );

  const [
    hasVideoError,
    setHasVideoError,
  ] = useState(false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(true);

  /* =========================================================
     RESET WHEN VIDEO CHANGES
  ========================================================= */

  useEffect(() => {
    setVideoSource(
      video.imageUrl ||
        fallbackVideoUrl,
    );

    setPosterSource(
      video.thumbnailUrl ??
        undefined,
    );

    setUsingFallback(
      !video.imageUrl,
    );

    setHasVideoError(
      false,
    );

    setIsPlaying(
      false,
    );
  }, [
    video.imageUrl,
    video.thumbnailUrl,
    fallbackVideoUrl,
  ]);

  /* =========================================================
     AUTO PLAY / PAUSE
  ========================================================= */

  useEffect(() => {
    const cardElement =
      cardRef.current;

    const currentVideoElement =
      videoRef.current;

    if (
      !cardElement ||
      !currentVideoElement ||
      hasVideoError
    ) {
      return;
    }

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
                setIsPlaying(
                  false,
                );
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
            setIsPlaying(
              false,
            );
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
    videoSource,
    hasVideoError,
  ]);

  /* =========================================================
     REMOTE VIDEO FAILURE
  ========================================================= */

  function handleVideoError() {
    /*
     * Remote Cloudinary video failed.
     *
     * Switch THIS card to the exact local
     * fallback passed from FestivalReelsSection.
     */

    if (
      !usingFallback &&
      videoSource !== fallbackVideoUrl
    ) {
      console.warn(
        `Remote reel unavailable: ${video.title}. Using ${fallbackVideoUrl}`,
      );

      setUsingFallback(
        true,
      );

      /*
       * Cloudinary thumbnail will probably
       * also return 401, so remove it.
       */
      setPosterSource(
        undefined,
      );

      setHasVideoError(
        false,
      );

      setIsPlaying(
        false,
      );

      setVideoSource(
        fallbackVideoUrl,
      );

      return;
    }

    /*
     * The local fallback itself failed.
     *
     * Stop here instead of triggering
     * an infinite error loop.
     */

    console.error(
      `Local fallback reel failed: ${fallbackVideoUrl}`,
    );

    setHasVideoError(
      true,
    );

    setIsPlaying(
      false,
    );
  }

  /* =========================================================
     PLAY / PAUSE
  ========================================================= */

  async function togglePlayback() {
    const videoElement =
      videoRef.current;

    if (
      !videoElement ||
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
      setIsPlaying(
        false,
      );
    }
  }

  /* =========================================================
     SOUND
  ========================================================= */

  function toggleMuted() {
    const videoElement =
      videoRef.current;

    if (
      !videoElement ||
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <article
      ref={cardRef}
      className="festival-reel-card"
    >
      <div className="festival-reel-card__media">

        {!hasVideoError && (
          <video
            /*
             * Recreate the video element whenever
             * the source changes from Cloudinary
             * to the local fallback.
             */
            key={videoSource}
            ref={videoRef}
            className="festival-reel-card__video"
            src={videoSource}
            poster={posterSource}
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
              setIsPlaying(
                true,
              );
            }}
            onPause={() => {
              setIsPlaying(
                false,
              );
            }}
            onEnded={() => {
              setIsPlaying(
                false,
              );
            }}
            aria-label={
              video.altText ??
              video.title
            }
          />
        )}

        {!hasVideoError && (
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