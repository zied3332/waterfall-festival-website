import {
  Check,
  CheckSquare,
  Eye,
  FileImage,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import "../style/admin-gallery.css";

type GalleryStatus = "Published" | "Draft";

type GalleryItem = {
  id: number;
  title: string;
  category: string;
  image: string;
  status: GalleryStatus;
  fileName?: string;
};

type PendingImage = {
  id: string;
  file: File;
  preview: string;
  title: string;
  category: string;
  status: GalleryStatus;
};

const initialGalleryItems: GalleryItem[] = [
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

const galleryCategories = [
  "Festival",
  "Show",
  "Venue",
  "Experience",
  "Artists",
  "Crowd",
  "Other",
];

const statusFilters = ["All", "Published", "Draft"] as const;

function AdminGallery() {
  const [galleryItems, setGalleryItems] =
    useState<GalleryItem[]>(initialGalleryItems);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusFilters)[number]>("All");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return galleryItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [galleryItems, searchTerm, statusFilter]);

  const publishedCount = galleryItems.filter(
    (item) => item.status === "Published",
  ).length;

  const draftCount = galleryItems.filter(
    (item) => item.status === "Draft",
  ).length;

  const visibleSelectedIds = filteredItems
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.id);

  const allVisibleSelected =
    filteredItems.length > 0 &&
    visibleSelectedIds.length === filteredItems.length;

  const createPendingImages = (files: File[]) => {
    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/"),
    );

    const newPendingImages: PendingImage[] = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      category: "Festival",
      status: "Published",
    }));

    setPendingImages((currentImages) => [
      ...currentImages,
      ...newPendingImages,
    ]);

    if (newPendingImages.length > 0) {
      setIsUploadOpen(true);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    createPendingImages(files);

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    createPendingImages(Array.from(event.dataTransfer.files));
  };

  const handleAddImages = () => {
    const newGalleryItems: GalleryItem[] = pendingImages.map(
      (pendingImage, index) => ({
        id: Date.now() + index,
        title: pendingImage.title.trim() || "Untitled Image",
        category: pendingImage.category,
        image: pendingImage.preview,
        status: pendingImage.status,
        fileName: pendingImage.file.name,
      }),
    );

    setGalleryItems((currentItems) => [
      ...newGalleryItems,
      ...currentItems,
    ]);

    setPendingImages([]);
    setIsUploadOpen(false);
  };

  const removePendingImage = (id: string) => {
    setPendingImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return currentImages.filter((image) => image.id !== id);
    });
  };

  const updatePendingImage = (
    id: string,
    field: "title" | "category" | "status",
    value: string,
  ) => {
    setPendingImages((currentImages) =>
      currentImages.map((image) =>
        image.id === id
          ? {
              ...image,
              [field]: value,
            }
          : image,
      ),
    );
  };

  const closeUploadPanel = () => {
    pendingImages.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setPendingImages([]);
    setIsUploadOpen(false);
  };

  const toggleImageSelection = (id: number) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((selectedId) => selectedId !== id)
        : [...currentIds, id],
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredItems.map((item) => item.id);

    if (allVisibleSelected) {
      setSelectedIds((currentIds) =>
        currentIds.filter((id) => !visibleIds.includes(id)),
      );

      return;
    }

    setSelectedIds((currentIds) => [
      ...new Set([...currentIds, ...visibleIds]),
    ]);
  };

  const deleteSingleItem = () => {
    if (!itemToDelete) {
      return;
    }

    setGalleryItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemToDelete.id),
    );

    setSelectedIds((currentIds) =>
      currentIds.filter((id) => id !== itemToDelete.id),
    );

    setItemToDelete(null);
  };

  const deleteSelectedItems = () => {
    setGalleryItems((currentItems) =>
      currentItems.filter((item) => !selectedIds.includes(item.id)),
    );

    setSelectedIds([]);
    setShowBulkDeleteModal(false);
  };

  const toggleItemStatus = (id: number) => {
    setGalleryItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Published" ? "Draft" : "Published",
            }
          : item,
      ),
    );
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
            Upload, organize, publish, and manage festival photos displayed
            across the public website.
          </p>
        </div>

        <button
          type="button"
          className="admin-gallery__add"
          onClick={() => setIsUploadOpen(true)}
        >
          <Plus size={18} />
          Upload Images
        </button>
      </header>

      <div className="admin-gallery__stats">
        <article className="admin-gallery__stat-card">
          <div className="admin-gallery__stat-icon">
            <ImageIcon size={22} />
          </div>

          <div>
            <span>Total Media</span>
            <strong>{galleryItems.length}</strong>
            <small>Images in the gallery</small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--published">
          <div className="admin-gallery__stat-icon">
            <Check size={22} />
          </div>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
            <small>Visible on the website</small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--draft">
          <div className="admin-gallery__stat-icon">
            <Pencil size={22} />
          </div>

          <div>
            <span>Draft Images</span>
            <strong>{draftCount}</strong>
            <small>Hidden from visitors</small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--selected">
          <div className="admin-gallery__stat-icon">
            <CheckSquare size={22} />
          </div>

          <div>
            <span>Selected</span>
            <strong>{selectedIds.length}</strong>
            <small>Ready for bulk actions</small>
          </div>
        </article>
      </div>

      <div className="admin-gallery__content">
        <div className="admin-gallery__toolbar">
          <div className="admin-gallery__search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search gallery by title or category..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-gallery__bulk-toolbar">
          <button
            type="button"
            className="admin-gallery__select-all"
            onClick={toggleSelectAllVisible}
            disabled={filteredItems.length === 0}
          >
            {allVisibleSelected ? (
              <CheckSquare size={18} />
            ) : (
              <Square size={18} />
            )}

            {allVisibleSelected ? "Deselect All" : "Select All"}
          </button>

          <span>
            {selectedIds.length > 0
              ? `${selectedIds.length} image${
                  selectedIds.length === 1 ? "" : "s"
                } selected`
              : `${filteredItems.length} image${
                  filteredItems.length === 1 ? "" : "s"
                } shown`}
          </span>

          {selectedIds.length > 0 && (
            <div className="admin-gallery__bulk-actions">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
              >
                <X size={16} />
                Clear
              </button>

              <button
                type="button"
                className="admin-gallery__bulk-delete"
                onClick={() => setShowBulkDeleteModal(true)}
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="admin-gallery__grid">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <article
                  className={
                    isSelected
                      ? "admin-gallery__card admin-gallery__card--selected"
                      : "admin-gallery__card"
                  }
                  key={item.id}
                >
                  <div className="admin-gallery__image-wrap">
                    <img src={item.image} alt={item.title} />

                    <div className="admin-gallery__image-overlay" />

                    <button
                      type="button"
                      className={
                        isSelected
                          ? "admin-gallery__select-button admin-gallery__select-button--selected"
                          : "admin-gallery__select-button"
                      }
                      onClick={() => toggleImageSelection(item.id)}
                      aria-label={
                        isSelected
                          ? `Deselect ${item.title}`
                          : `Select ${item.title}`
                      }
                    >
                      {isSelected ? (
                        <Check size={17} />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>

                    <span
                      className={`admin-gallery__status admin-gallery__status--${item.status.toLowerCase()}`}
                    >
                      <span />
                      {item.status}
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
                      <span>{item.category}</span>
                    </div>

                    <h2>{item.title}</h2>

                    {item.fileName && (
                      <p className="admin-gallery__file-name">
                        {item.fileName}
                      </p>
                    )}

                    <div className="admin-gallery__actions">
                      <button type="button">
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleItemStatus(item.id)}
                      >
                        {item.status === "Published" ? (
                          <>
                            <Eye size={16} />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Publish
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="admin-gallery__delete-action"
                        onClick={() => setItemToDelete(item)}
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-gallery__empty">
            <div className="admin-gallery__empty-icon">
              <ImageIcon size={30} />
            </div>

            <h2>No gallery images found</h2>

            <p>
              Change your filters or upload new festival images.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {isUploadOpen && (
        <div
          className="admin-gallery__modal-overlay"
          role="presentation"
          onClick={closeUploadPanel}
        >
          <div
            className="admin-gallery__upload-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-upload-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-gallery__modal-header">
              <div>
                <span>Gallery Upload</span>
                <h2 id="gallery-upload-title">Add Multiple Images</h2>
                <p>
                  Upload several festival photos and configure them before
                  publishing.
                </p>
              </div>

              <button
                type="button"
                className="admin-gallery__modal-close"
                onClick={closeUploadPanel}
                aria-label="Close upload panel"
              >
                <X size={20} />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
            />

            <div
              className={
                isDragging
                  ? "admin-gallery__drop-zone admin-gallery__drop-zone--dragging"
                  : "admin-gallery__drop-zone"
              }
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
            >
              <div className="admin-gallery__drop-icon">
                <Upload size={28} />
              </div>

              <h3>Drag and drop images here</h3>

              <p>
                Upload JPG, PNG, WEBP, or other supported image files.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileImage size={17} />
                Choose Images
              </button>
            </div>

            {pendingImages.length > 0 && (
              <div className="admin-gallery__pending">
                <div className="admin-gallery__pending-header">
                  <div>
                    <h3>Selected Images</h3>
                    <p>
                      {pendingImages.length} image
                      {pendingImages.length === 1 ? "" : "s"} ready to
                      upload
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus size={16} />
                    Add More
                  </button>
                </div>

                <div className="admin-gallery__pending-list">
                  {pendingImages.map((image) => (
                    <article
                      className="admin-gallery__pending-item"
                      key={image.id}
                    >
                      <img src={image.preview} alt={image.title} />

                      <div className="admin-gallery__pending-fields">
                        <label>
                          Image title
                          <input
                            type="text"
                            value={image.title}
                            onChange={(event) =>
                              updatePendingImage(
                                image.id,
                                "title",
                                event.target.value,
                              )
                            }
                          />
                        </label>

                        <label>
                          Category
                          <select
                            value={image.category}
                            onChange={(event) =>
                              updatePendingImage(
                                image.id,
                                "category",
                                event.target.value,
                              )
                            }
                          >
                            {galleryCategories.map((category) => (
                              <option value={category} key={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Status
                          <select
                            value={image.status}
                            onChange={(event) =>
                              updatePendingImage(
                                image.id,
                                "status",
                                event.target.value,
                              )
                            }
                          >
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                          </select>
                        </label>
                      </div>

                      <button
                        type="button"
                        className="admin-gallery__remove-pending"
                        onClick={() => removePendingImage(image.id)}
                        aria-label={`Remove ${image.title}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-gallery__modal-footer">
              <button
                type="button"
                className="admin-gallery__cancel"
                onClick={closeUploadPanel}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-gallery__confirm-upload"
                disabled={pendingImages.length === 0}
                onClick={handleAddImages}
              >
                <Upload size={17} />
                Add {pendingImages.length || ""} Image
                {pendingImages.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
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

            <img src={previewItem.image} alt={previewItem.title} />

            <div>
              <span>{previewItem.category}</span>
              <h2>{previewItem.title}</h2>
              <p>{previewItem.status}</p>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div
          className="admin-gallery__confirm-overlay"
          role="presentation"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="admin-gallery__confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-gallery__confirm-icon">
              <Trash2 size={25} />
            </div>

            <h2>Delete this image?</h2>

            <p>
              You are about to delete <strong>{itemToDelete.title}</strong>.
              This action cannot be undone.
            </p>

            <div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-gallery__confirm-delete"
                onClick={deleteSingleItem}
              >
                <Trash2 size={16} />
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        <div
          className="admin-gallery__confirm-overlay"
          role="presentation"
          onClick={() => setShowBulkDeleteModal(false)}
        >
          <div
            className="admin-gallery__confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-gallery__confirm-icon">
              <Trash2 size={25} />
            </div>

            <h2>Delete selected images?</h2>

            <p>
              You are about to delete{" "}
              <strong>
                {selectedIds.length} image
                {selectedIds.length === 1 ? "" : "s"}
              </strong>
              . This action cannot be undone.
            </p>

            <div>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-gallery__confirm-delete"
                onClick={deleteSelectedItems}
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminGallery;