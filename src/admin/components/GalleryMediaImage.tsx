import { useState, type ImgHTMLAttributes } from "react";
import { FileImage } from "lucide-react";

export default function GalleryMediaImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedUrl, setFailedUrl] = useState<string>();
  if (!src || failedUrl === src) {
    return <div className="admin-gallery__media-fallback" role="img" aria-label={`${alt || "Gallery image"}: preview unavailable`}>
      <FileImage size={24} aria-hidden="true" />
      <span>Image unavailable</span>
    </div>;
  }
  return <img {...props} src={src} alt={alt ?? ""} onError={() => setFailedUrl(src)} />;
}
