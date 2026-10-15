import GalleryMedia from "../../components/gallery/GalleryMedia";
import type { ImgHTMLAttributes } from "react";

export default function GalleryMediaImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <GalleryMedia {...props} fallbackClassName="admin-gallery__media-fallback" />;
}
