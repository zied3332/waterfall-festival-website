import {
  Check,
  Eye,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  createGalleryImage,
  deleteGalleryImage,
  getAdminGallery,
  updateGalleryImage,
} from "../../services/gallery.service";

import type {
  CreateGalleryImageInput,
  GalleryImage,
  GalleryStatus,
  UpdateGalleryImageInput,
} from "../../types/gallery";

import "../style/admin-gallery.css";

type StatusFilter = "ALL" | GalleryStatus;

type GalleryFormState = {
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
  status: GalleryStatus;
  isFeatured: boolean;
  sortOrder: string;
};

const emptyForm: GalleryFormState = {
  title: "",
  description: "",
  imageUrl: "",
  altText: "",
  status: "DRAFT",
  isFeatured: false,
  sortOrder: "0",
};

const statusFilters: StatusFilter[] = [
  "ALL",
  "PUBLISHED",
  "DRAFT",
  "ARCHIVED",
];

function formatStatus(status: GalleryStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function AdminGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<GalleryImage | null>(null);

  const [previewItem, setPreviewItem] =
    useState<GalleryImage | null>(null);

  const [form, setForm] =
    useState<GalleryFormState>(emptyForm);

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getAdminGallery();
      setGalleryItems(data);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to load gallery images.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGallery();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return galleryItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(normalizedSearch) ||
        (item.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (item.altText ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (item.event?.title ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [galleryItems, searchTerm, statusFilter]);

  const publishedCount = galleryItems.filter(
    (item) => item.status === "PUBLISHED",
  ).length;

  const draftCount = galleryItems.filter(
    (item) => item.status === "DRAFT",
  ).length;

  const featuredCount = galleryItems.filter(
    (item) => item.isFeatured,
  ).length;

  const openCreateForm = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: GalleryImage) => {
    setEditingItem(item);

    setForm({
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl,
      altText: item.altText ?? "",
      status: item.status,
      isFeatured: item.isFeatured,
      sortOrder: String(item.sortOrder),
    });

    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const title = form.title.trim();
    const imageUrl = form.imageUrl.trim();
    const sortOrder = Number(form.sortOrder);

    if (!title) {
      setFormError("The image title is required.");
      return;
    }

    if (!imageUrl) {
      setFormError("The image URL is required.");
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError(
        "Sort order must be a positive whole number.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingItem) {
        const updateData: UpdateGalleryImageInput = {
          title,
          description: form.description.trim() || null,
          imageUrl,
          altText: form.altText.trim() || null,
          status: form.status,
          isFeatured: form.isFeatured,
          sortOrder,
        };

        const updatedImage = await updateGalleryImage(
          editingItem.id,
          updateData,
        );

        setGalleryItems((currentItems) =>
          currentItems.map((item) =>
            item.id === updatedImage.id
              ? updatedImage
              : item,
          ),
        );
      } else {
        const createData: CreateGalleryImageInput = {
          title,
          description: form.description.trim() || null,
          imageUrl,
          altText: form.altText.trim() || null,
          status: form.status,
          isFeatured: form.isFeatured,
          sortOrder,
        };

        const createdImage =
          await createGalleryImage(createData);

        setGalleryItems((currentItems) => [
          createdImage,
          ...currentItems,
        ]);
      }

      closeForm();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : editingItem
            ? "Failed to update the image."
            : "Failed to create the image.";

      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: GalleryImage) => {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);
      setError(null);

      await deleteGalleryImage(item.id);

      setGalleryItems((currentItems) =>
        currentItems.filter(
          (galleryItem) => galleryItem.id !== item.id,
        ),
      );

      if (previewItem?.id === item.id) {
        setPreviewItem(null);
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete the image.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (
    item: GalleryImage,
  ) => {
    const nextStatus: GalleryStatus =
      item.status === "PUBLISHED"
        ? "DRAFT"
        : "PUBLISHED";

    try {
      setUpdatingId(item.id);
      setError(null);

      const updatedImage = await updateGalleryImage(
        item.id,
        {
          status: nextStatus,
        },
      );

      setGalleryItems((currentItems) =>
        currentItems.map((galleryItem) =>
          galleryItem.id === updatedImage.id
            ? updatedImage
            : galleryItem,
        ),
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to update the image status.";

      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="admin-gallery">
      <header className="admin-gallery__header">
        <div className="admin-gallery__heading">
          <span className="admin-gallery__eyebrow">
            <ImageIcon size={16} />
            Gallery Management
          </span>

          <h1>Festival Gallery</h1>

          <p>
            Create, edit, publish, preview, and delete gallery
            images.
          </p>
        </div>

        <button
          type="button"
          className="admin-gallery__add"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add Image
        </button>
      </header>

      <div className="admin-gallery__stats">
        <article className="admin-gallery__stat-card">
          <div className="admin-gallery__stat-icon">
            <ImageIcon size={22} />
          </div>

          <div>
            <span>Total Images</span>
            <strong>{galleryItems.length}</strong>
            <small>All gallery records</small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--published">
          <div className="admin-gallery__stat-icon">
            <Check size={22} />
          </div>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
            <small>Visible publicly</small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--draft">
          <div className="admin-gallery__stat-icon">
            <Pencil size={22} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>{draftCount}</strong>
            <small>Hidden from visitors</small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--selected">
          <div className="admin-gallery__stat-icon">
            <Eye size={22} />
          </div>

          <div>
            <span>Featured</span>
            <strong>{featuredCount}</strong>
            <small>Highlighted images</small>
          </div>
        </article>
      </div>

      <div className="admin-gallery__content">
        <div className="admin-gallery__toolbar">
          <div className="admin-gallery__search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search gallery images..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-gallery__filters">
            {statusFilters.map((status) => (
              <button
                type="button"
                key={status}
                className={
                  statusFilter === status
                    ? "admin-gallery__filter admin-gallery__filter--active"
                    : "admin-gallery__filter"
                }
                onClick={() => setStatusFilter(status)}
              >
                {status === "ALL"
                  ? "All"
                  : formatStatus(status)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="admin-gallery__empty">
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void loadGallery()}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && isLoading && (
          <div className="admin-gallery__empty">
            <ImageIcon size={30} />
            <h2>Loading gallery</h2>
            <p>Please wait while the images are loaded.</p>
          </div>
        )}

        {!error &&
          !isLoading &&
          filteredItems.length > 0 && (
            <div className="admin-gallery__grid">
              {filteredItems.map((item) => (
                <article
                  className="admin-gallery__card"
                  key={item.id}
                >
                  <div className="admin-gallery__image-wrap">
                    <img
                      src={item.imageUrl}
                      alt={item.altText ?? item.title}
                    />

                    <div className="admin-gallery__image-overlay" />

                    <span
                      className={`admin-gallery__status admin-gallery__status--${item.status.toLowerCase()}`}
                    >
                      <span />
                      {formatStatus(item.status)}
                    </span>

                    <button
                      type="button"
                      className="admin-gallery__preview-button"
                      onClick={() => setPreviewItem(item)}
                      aria-label={`Preview ${item.title}`}
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  <div className="admin-gallery__body">
                    <div className="admin-gallery__meta">
                      <ImageIcon size={15} />

                      <span>
                        {item.event?.title ??
                          "Waterfall Festival"}
                      </span>
                    </div>

                    <h2>{item.title}</h2>

                    {item.description && (
                      <p className="admin-gallery__file-name">
                        {item.description}
                      </p>
                    )}

                    <div className="admin-gallery__actions">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() =>
                          void handleToggleStatus(item)
                        }
                      >
                        {item.status === "PUBLISHED" ? (
                          <>
                            <Eye size={16} />
                            {updatingId === item.id
                              ? "Updating..."
                              : "Unpublish"}
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            {updatingId === item.id
                              ? "Updating..."
                              : "Publish"}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="admin-gallery__delete-action"
                        disabled={deletingId === item.id}
                        onClick={() =>
                          void handleDelete(item)
                        }
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        {!error &&
          !isLoading &&
          filteredItems.length === 0 && (
            <div className="admin-gallery__empty">
              <div className="admin-gallery__empty-icon">
                <ImageIcon size={30} />
              </div>

              <h2>No gallery images found</h2>

              <p>
                Add an image or change your current filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
      </div>

      {isFormOpen && (
        <div
          className="admin-gallery__modal-overlay"
          role="presentation"
          onClick={closeForm}
        >
          <form
            className="admin-gallery__upload-modal"
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-gallery__modal-header">
              <div>
                <span>
                  {editingItem
                    ? "Edit Gallery Image"
                    : "New Gallery Image"}
                </span>

                <h2>
                  {editingItem
                    ? "Update image"
                    : "Add image"}
                </h2>

                <p>
                  Use a public image URL. File uploads can be
                  added later with Cloudinary or another storage
                  service.
                </p>
              </div>

              <button
                type="button"
                className="admin-gallery__modal-close"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-gallery__pending-fields">
              <label>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Main Stage Crowd"
                  required
                />
              </label>

              <label>
                Image URL
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </label>

              <label>
                Alt text
                <input
                  type="text"
                  value={form.altText}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      altText: event.target.value,
                    }))
                  }
                  placeholder="Festival crowd at the main stage"
                />
              </label>

              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe this festival moment..."
                  rows={4}
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      status: event.target
                        .value as GalleryStatus,
                    }))
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">
                    Published
                  </option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>

              <label>
                Sort order
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      sortOrder: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      isFeatured: event.target.checked,
                    }))
                  }
                />
                Featured image
              </label>
            </div>

            {form.imageUrl && (
              <div className="admin-gallery__pending-item">
                <img
                  src={form.imageUrl}
                  alt={form.altText || form.title || "Preview"}
                />

                <div>
                  <strong>Image preview</strong>
                  <p>
                    Confirm that the image URL loads correctly.
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <div className="admin-gallery__empty">
                <p>{formError}</p>
              </div>
            )}

            <div className="admin-gallery__modal-footer">
              <button
                type="button"
                className="admin-gallery__cancel"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-gallery__confirm-upload"
                disabled={isSubmitting}
              >
                {editingItem ? (
                  <Pencil size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {isSubmitting
                  ? "Saving..."
                  : editingItem
                    ? "Save Changes"
                    : "Create Image"}
              </button>
            </div>
          </form>
        </div>
      )}

      {previewItem && (
        <div
          className="admin-gallery__preview-overlay"
          role="presentation"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="admin-gallery__preview-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              aria-label="Close image preview"
            >
              <X size={21} />
            </button>

            <img
              src={previewItem.imageUrl}
              alt={previewItem.altText ?? previewItem.title}
            />

            <div>
              <span>
                {previewItem.event?.title ??
                  "Waterfall Festival"}
              </span>

              <h2>{previewItem.title}</h2>

              {previewItem.description && (
                <p>{previewItem.description}</p>
              )}

              <p>{formatStatus(previewItem.status)}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminGallery;