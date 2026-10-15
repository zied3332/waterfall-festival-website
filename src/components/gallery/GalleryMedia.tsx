import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff, VideoOff } from "lucide-react";
import { getApiMediaUrl } from "../../services/api.service";
import "./gallery-media.css";

type GalleryMediaProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> & {
  src?: string | null;
  poster?: string | null;
  mediaType?: "IMAGE" | "VIDEO";
  controls?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  fallbackClassName?: string;
};

/** A failed asset stays associated with its real record; never substitute another photo. */
export default function GalleryMedia({ src, poster, alt, mediaType = "IMAGE", controls = false, muted = true, autoPlay = false, playsInline = true, preload = "metadata", className = "", fallbackClassName = "", ...imageProps }: GalleryMediaProps) {
  const url = getApiMediaUrl(src);
  const sourceKey = `${mediaType}:${url}`;
  const [failedSource, setFailedSource] = useState<string>();
  const label = alt?.trim() || (mediaType === "VIDEO" ? "Gallery video" : "Gallery image");
  function handleError() {
    console.warn(`Gallery ${mediaType.toLowerCase()} could not load: ${label}`, url);
    setFailedSource(sourceKey);
  }
  if (!url || failedSource === sourceKey) {
    const Icon = mediaType === "VIDEO" ? VideoOff : ImageOff;
    return <div className={`gallery-media-fallback ${className} ${fallbackClassName}`} role="img" aria-label={`${label}: ${mediaType === "VIDEO" ? "video" : "image"} unavailable`}>
      <Icon size={24} aria-hidden="true" />
      <span>{mediaType === "VIDEO" ? "Video unavailable" : "Image unavailable"}</span>
      <small>{url ? "The media file could not be loaded." : "No valid media URL was provided."}</small>
    </div>;
  }
  if (mediaType === "VIDEO") {
    return <video key={url} className={className} src={url} poster={getApiMediaUrl(poster) ?? undefined}
      controls={controls} muted={muted} autoPlay={autoPlay} playsInline={playsInline} preload={preload}
      onError={handleError} aria-label={label} />;
  }
  return <img {...imageProps} className={className} src={url} alt={label} onError={handleError} />;
}
