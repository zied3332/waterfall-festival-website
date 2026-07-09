import { Plus, Pencil, Trash2, Image } from "lucide-react";
import "../style/admin-gallery.css";

const galleryItems = [
  {
    id: 1,
    title: "Main Stage Crowd",
    category: "Festival",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=900&auto=format&fit=crop",
    status: "Published",
  },
  {
    id: 2,
    title: "Fire Performance",
    category: "Show",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=900&auto=format&fit=crop",
    status: "Published",
  },
  {
    id: 3,
    title: "Waterfall Venue",
    category: "Venue",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop",
    status: "Draft",
  },
  {
    id: 4,
    title: "Night Lights",
    category: "Experience",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=900&auto=format&fit=crop",
    status: "Published",
  },
];

function AdminGallery() {
  return (
    <section className="admin-gallery">
      <div className="admin-gallery__header">
        <div>
          <span className="admin-gallery__eyebrow">Gallery Management</span>
          <h1>Gallery</h1>
          <p>Manage festival images, categories, and gallery visibility.</p>
        </div>

        <button className="admin-gallery__add">
          <Plus size={18} />
          Add Image
        </button>
      </div>

      <div className="admin-gallery__grid">
        {galleryItems.map((item) => (
          <article className="admin-gallery__card" key={item.id}>
            <div className="admin-gallery__image-wrap">
              <img src={item.image} alt={item.title} />
              <span
                className={`admin-gallery__status admin-gallery__status--${item.status.toLowerCase()}`}
              >
                {item.status}
              </span>
            </div>

            <div className="admin-gallery__body">
              <div className="admin-gallery__meta">
                <Image size={16} />
                <span>{item.category}</span>
              </div>

              <h2>{item.title}</h2>

              <div className="admin-gallery__actions">
                <button>
                  <Pencil size={16} />
                  Edit
                </button>

                <button className="danger">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminGallery;