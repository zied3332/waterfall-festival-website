import { useEffect, useRef, type KeyboardEvent, type RefObject, type TouchEvent } from "react";
import { gallerySwipeDirection, type GalleryTouchPoint } from "../utils/gallery-gestures";

type GalleryViewerOptions = {
  isOpen: boolean;
  dialogRef: RefObject<HTMLDialogElement | null>;
  openerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  allowSwipe?: boolean;
};

export function useGalleryViewer({ isOpen, dialogRef, openerRef, onClose, onPrevious, onNext, allowSwipe = true }: GalleryViewerOptions) {
  const touchStart = useRef<GalleryTouchPoint | null>(null);
  const multiTouch = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const opener = openerRef.current;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>("[data-viewer-close]")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      // An opener can disappear after unfavoriting in the Favorites filter.
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      else document.querySelector<HTMLButtonElement>('.gallery-filter[aria-pressed="true"]')?.focus({ preventScroll: true });
      touchStart.current = null;
      multiTouch.current = false;
    };
  }, [isOpen, dialogRef, openerRef]);

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    // Native video controls keep their playback/seek keyboard behavior.
    if (!(event.target instanceof HTMLVideoElement)) {
      if (event.key === "ArrowLeft") { event.preventDefault(); onPrevious(); }
      if (event.key === "ArrowRight") { event.preventDefault(); onNext(); }
    }
    if (event.key === "Tab") {
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), video[controls], [href], [tabindex="0"]');
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (!allowSwipe || event.touches.length !== 1) {
      touchStart.current = null;
      multiTouch.current = true;
      return;
    }
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    multiTouch.current = false;
  }
  function onTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length > 1) { multiTouch.current = true; touchStart.current = null; }
  }
  function onTouchCancel() { touchStart.current = null; multiTouch.current = false; }
  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0];
    const direction = allowSwipe && !multiTouch.current && event.touches.length === 0
      ? gallerySwipeDirection(touchStart.current, touch ? { x: touch.clientX, y: touch.clientY } : null) : 0;
    onTouchCancel();
    if (direction === 1) onNext();
    if (direction === -1) onPrevious();
  }
  return { onKeyDown, onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}
