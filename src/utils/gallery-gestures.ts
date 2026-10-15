export type GalleryTouchPoint = { x: number; y: number };

// Do not treat vertical scrolling, small taps, or multi-touch zoom as navigation.
export function gallerySwipeDirection(start: GalleryTouchPoint | null, end: GalleryTouchPoint | null): -1 | 0 | 1 {
  if (!start || !end) return 0;
  const horizontal = start.x - end.x;
  const vertical = start.y - end.y;
  if (Math.abs(horizontal) < 50 || Math.abs(horizontal) <= Math.abs(vertical) * 1.2) return 0;
  return horizontal > 0 ? 1 : -1;
}
