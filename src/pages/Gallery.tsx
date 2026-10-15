import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Film, Images, RotateCcw, Star, X } from "lucide-react";
import GalleryMedia from "../components/gallery/GalleryMedia";
import { getGallery } from "../services/gallery.service";
import type { GalleryImage } from "../types/gallery";
import "./style/gallery.css";

type GalleryFilter = "all" | "featured" | "photos" | "videos";

export default function Gallery() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [event, setEvent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const loadGallery = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedIndex(null);
    try { setItems(await getGallery()); }
    catch (error) { setError(error instanceof Error ? error.message : "Gallery media could not be loaded."); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    getGallery().then(data => { if (active) setItems(data); })
      .catch((error: unknown) => { if (active) setError(error instanceof Error ? error.message : "Gallery media could not be loaded."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const events = useMemo(() => [...new Set(items.map(item => item.event?.title).filter((title): title is string => Boolean(title)))].sort(), [items]);
  const filteredItems = useMemo(() => items.filter(item =>
    (!event || item.event?.title === event)
    && (filter !== "featured" || item.isFeatured)
    && (filter !== "photos" || item.mediaType === "IMAGE")
    && (filter !== "videos" || item.mediaType === "VIDEO")), [items, filter, event]);
  const selectedItem = selectedIndex === null ? null : filteredItems[selectedIndex] ?? null;
  const isViewerOpen = selectedItem !== null;
  const closeViewer = useCallback(() => setSelectedIndex(null), []);
  function moveViewer(direction: number) {
    setSelectedIndex(index => index === null || !filteredItems.length ? null : (index + direction + filteredItems.length) % filteredItems.length);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isViewerOpen || !dialog) return;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>(".gallery-lightbox__close")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [isViewerOpen]);

  const filterOptions: { value: GalleryFilter; label: string }[] = [
    { value: "all", label: "All moments" }, { value: "photos", label: "Photos" },
    { value: "videos", label: "Videos" }, { value: "featured", label: "Featured" },
  ];

  return <main className="gallery-page">
    <section className="gallery-container" aria-labelledby="gallery-title">
      <header className="gallery-hero">
        <p className="gallery-eyebrow">WATERFALL FESTIVAL / THE ALBUM</p>
        <h1 id="gallery-title">Nights worth<br /><span>remembering.</span></h1>
        <p>Find your favorite moments. Feel the music, the lights, and the energy all over again.</p>
        <div className="gallery-hero__meta"><Camera size={16} aria-hidden="true" /> Photos, films &amp; festival memories</div>
      </header>

      <div className="gallery-toolbar">
        <div className="gallery-filters" aria-label="Filter gallery media">
          {filterOptions.map(option => <button key={option.value} type="button" className="gallery-filter"
            aria-pressed={filter === option.value} onClick={() => { setFilter(option.value); setSelectedIndex(null); }}>
            {option.label}
          </button>)}
        </div>
        <label className="gallery-event-filter">Event
          <select value={event} onChange={event => { setEvent(event.target.value); setSelectedIndex(null); }}>
            <option value="">All events</option>
            {events.map(title => <option key={title} value={title}>{title}</option>)}
          </select>
        </label>
      </div>

      {isLoading && <div className="gallery-grid" role="status" aria-label="Loading gallery media" aria-busy="true">
        {Array.from({ length: 12 }, (_, index) => <div key={index} className="gallery-skeleton" aria-hidden="true" />)}
      </div>}
      {!isLoading && error && <div className="gallery-state" role="alert">
        <Images size={32} aria-hidden="true" /><h2>The album couldn't load</h2><p>{error}</p>
        <button type="button" onClick={() => void loadGallery()}><RotateCcw size={16} aria-hidden="true" />Try again</button>
      </div>}
      {!isLoading && !error && <>
        <p className="gallery-results-count" role="status" aria-live="polite">{filteredItems.length} {filteredItems.length === 1 ? "moment" : "moments"}{filter === "all" && !event ? " to explore" : " matching your filters"}</p>
        {filteredItems.length === 0 ? <div className="gallery-state">
          <Images size={32} aria-hidden="true" /><h2>{items.length ? "No moments match these filters" : "The next memories are on their way"}</h2>
          <p>{items.length ? "Try another event or explore all festival moments." : "Published festival photos and videos will appear here."}</p>
          {items.length > 0 && <button type="button" onClick={() => { setFilter("all"); setEvent(""); }}>Clear filters</button>}
        </div> : <div className="gallery-grid">
          {filteredItems.map((item, index) => <article className="gallery-tile" key={item.id}>
            <button type="button" className={`gallery-card${item.isFeatured ? " gallery-card--featured" : ""}`}
              aria-label={`Open ${item.title}`} aria-haspopup="dialog" onClick={event => { openerRef.current = event.currentTarget; setSelectedIndex(index); }}>
              <GalleryMedia mediaType={item.mediaType} src={item.imageUrl} poster={item.thumbnailUrl}
                alt={item.altText || item.title} className="gallery-card__image" loading={index < 4 ? "eager" : "lazy"} decoding="async" />
              <span className="gallery-card__shade" aria-hidden="true" />
              {item.mediaType === "VIDEO" && <span className="gallery-card__type"><Film size={12} aria-hidden="true" />Video</span>}
              {item.isFeatured && <span className="gallery-card__featured"><Star size={12} aria-hidden="true" />Featured</span>}
              <span className="gallery-card__info"><small>{item.event?.title || "Waterfall Festival"}</small><strong>{item.title}</strong></span>
            </button>
          </article>)}
        </div>}
      </>}
      <footer className="gallery-footer"><span>Nature. Music. Memories.</span><p>Made at Waterfall Festival, Koh Phangan.</p></footer>
    </section>

    <dialog ref={dialogRef} className="gallery-lightbox" aria-label="Festival media viewer" onCancel={event => { event.preventDefault(); closeViewer(); }}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); closeViewer(); }
        if (event.key === "ArrowLeft") { event.preventDefault(); moveViewer(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); moveViewer(1); }
      }}>
      {selectedItem && <>
        <div className="gallery-lightbox__top"><span aria-live="polite">Moment {(selectedIndex ?? 0) + 1} of {filteredItems.length}</span>
          <button type="button" className="gallery-lightbox__close" onClick={closeViewer} aria-label="Close media viewer"><X size={24} aria-hidden="true" /></button>
        </div>
        <div className="gallery-lightbox__viewer">
          <GalleryMedia key={selectedItem.id} mediaType={selectedItem.mediaType} src={selectedItem.imageUrl} poster={selectedItem.thumbnailUrl}
            alt={selectedItem.altText || selectedItem.title} controls muted={false} className="gallery-lightbox__image" draggable={false} />
        </div>
        <div className="gallery-lightbox__bottom"><div><strong>{selectedItem.title}</strong><p>{selectedItem.event?.title || "Waterfall Festival"}</p></div>
          {filteredItems.length > 1 && <div className="gallery-lightbox__navigation">
            <button type="button" aria-label="Previous media item" onClick={() => moveViewer(-1)}><ArrowLeft size={22} aria-hidden="true" /></button>
            <button type="button" aria-label="Next media item" onClick={() => moveViewer(1)}><ArrowRight size={22} aria-hidden="true" /></button>
          </div>}
        </div>
      </>}
    </dialog>
  </main>;
}
