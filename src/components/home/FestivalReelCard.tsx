import {
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
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(true);

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
      } else {
        videoElement.pause();
      }
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
    <article className="festival-reel-card">
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
          preload="metadata"
          onPlay={() =>
            setIsPlaying(true)
          }
          onPause={() =>
            setIsPlaying(false)
          }
          onEnded={() =>
            setIsPlaying(false)
          }
          aria-label={
            video.altText ??
            video.title
          }
        />

        <button
          type="button"
          className="festival-reel-card__play"
          onClick={togglePlayback}
          aria-label={
            isPlaying
              ? `Pause ${video.title}`
              : `Play ${video.title}`
          }
        >
          {isPlaying ? (
            <Pause
              size={24}
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