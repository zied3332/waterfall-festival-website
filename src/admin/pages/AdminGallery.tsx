import {
  Check,
  Eye,
  FileImage,
  Image as ImageIcon,
  Images,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useMemo,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import {
  deleteGalleryImage,
  getAdminGallery,
  updateGalleryImage,
  uploadGalleryImages,
} from "../../services/gallery.service";

import type {
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

type SelectedFilePreview = {
  file: File;
  previewUrl: string;
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFilePreviews, setSelectedFilePreviews] =
    useState<SelectedFilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedFilePreviewsRef =
    useRef<SelectedFilePreview[]>([]);

  useEffect(() => {
    selectedFilePreviewsRef.current = selectedFilePreviews;
  }, [selectedFilePreviews]);

  useEffect(() => {
    return () => {
      selectedFilePreviewsRef.current.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, []);

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

  const clearSelectedFiles = () => {
    selectedFilePreviewsRef.current.forEach((preview) => {
      URL.revokeObjectURL(preview.previewUrl);
    });

    selectedFilePreviewsRef.current = [];
    setSelectedFilePreviews([]);
    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openCreateForm = () => {
    clearSelectedFiles();
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
    setIsDragging(false);
    setIsFormOpen(true);
  };

  const openEditForm = (item: GalleryImage) => {
    clearSelectedFiles();
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
    setIsDragging(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) {
      return;
    }

    clearSelectedFiles();
    setIsFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
    setIsDragging(false);
  };

  const addSelectedFiles = (incomingFiles: File[]) => {
    setFormError(null);

    if (incomingFiles.length === 0) {
      return;
    }

    const existingKeys = new Set(selectedFiles.map(getFileKey));
    const acceptedFiles: File[] = [];
    const validationMessages: string[] = [];

    for (const file of incomingFiles) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        validationMessages.push(
          `${file.name}: unsupported file type. Use JPG, PNG, or WEBP.`,
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        validationMessages.push(
          `${file.name}: file is larger than 5 MB.`,
        );
        continue;
      }

      const fileKey = getFileKey(file);

      if (existingKeys.has(fileKey)) {
        validationMessages.push(
          `${file.name}: this file is already selected.`,
        );
        continue;
      }

      if (selectedFiles.length + acceptedFiles.length >= MAX_FILES) {
        validationMessages.push(
          `You can select a maximum of ${MAX_FILES} images.`,
        );
        break;
      }

      existingKeys.add(fileKey);
      acceptedFiles.push(file);
    }

    if (acceptedFiles.length > 0) {
      const newPreviews = acceptedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setSelectedFiles((currentFiles) => [
        ...currentFiles,
        ...acceptedFiles,
      ]);
      setSelectedFilePreviews((currentPreviews) => [
        ...currentPreviews,
        ...newPreviews,
      ]);
    }

    if (validationMessages.length > 0) {
      setFormError(validationMessages.join(" "));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    addSelectedFiles(Array.from(event.target.files ?? []));
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!isSubmitting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (isSubmitting) {
      return;
    }

    addSelectedFiles(Array.from(event.dataTransfer.files));
  };

  const removeSelectedFile = (fileToRemove: File) => {
    if (isSubmitting) {
      return;
    }

    const fileKey = getFileKey(fileToRemove);
    const previewToRemove = selectedFilePreviews.find(
      (preview) => getFileKey(preview.file) === fileKey,
    );

    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.previewUrl);
    }

    setSelectedFiles((currentFiles) =>
      currentFiles.filter((file) => getFileKey(file) !== fileKey),
    );
    setSelectedFilePreviews((currentPreviews) =>
      currentPreviews.filter(
        (preview) => getFileKey(preview.file) !== fileKey,
      ),
    );
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

    if (editingItem && !imageUrl) {
      setFormError("The image URL is required when editing.");
      return;
    }

    if (!editingItem && selectedFiles.length === 0) {
      setFormError("Select at least one image to upload.");
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError(
        "Sort order must be a non-negative whole number.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingItem) {
        const updateData: UpdateGalleryImageInput = {
          title,
          description: form.description.trim() || undefined,

          imageUrl,
          altText: form.altText.trim() || undefined,
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
        const response = await uploadGalleryImages({
          files: selectedFiles,
          title,
          description: form.description.trim() || undefined,
          altText: form.altText.trim() || undefined,
          status: form.status,
          isFeatured: form.isFeatured,
          sortOrder,
        });

        setGalleryItems((currentItems) => [
          ...response.images,
          ...currentItems,
        ]);
      }

      clearSelectedFiles();
      setIsFormOpen(false);
      setEditingItem(null);
      setForm(emptyForm);
      setFormError(null);
      setIsDragging(false);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : editingItem
            ? "Failed to update the image."
            : "Failed to upload the images.";

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
          Add Images
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
                    : "Upload Images"}
                </span>

                <h2>
                  {editingItem
                    ? "Update image"
                    : "Upload gallery images"}
                </h2>

                <p>
                  {editingItem
                    ? "Update the metadata and existing image URL for this gallery record."
                    : "Choose up to 10 JPG, PNG, or WEBP images and apply shared metadata to the full batch."}
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

            <div className="admin-gallery__modal-body">
              {!editingItem && (
                <>
                  <input
                    ref={fileInputRef}
                    className="admin-gallery__file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />

                  <div
                    className={`admin-gallery__drop-zone${
                      isDragging
                        ? " admin-gallery__drop-zone--dragging"
                        : ""
                    }${
                      isSubmitting
                        ? " admin-gallery__drop-zone--disabled"
                        : ""
                    }`}
                    role="button"
                    tabIndex={isSubmitting ? -1 : 0}
                    onClick={() => {
                      if (!isSubmitting) {
                        fileInputRef.current?.click();
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        !isSubmitting &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="admin-gallery__drop-icon">
                      <Upload size={27} />
                    </div>

                    <h3>Drop festival images here</h3>

                    <p>
                      JPG, PNG, or WEBP · maximum 5 MB each · up
                      to 10 files
                    </p>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Images size={16} />
                      Choose Images
                    </button>
                  </div>

                  {selectedFilePreviews.length > 0 && (
                    <div className="admin-gallery__pending">
                      <div className="admin-gallery__pending-header">
                        <div>
                          <h3>Selected images</h3>
                          <p>
                            {selectedFilePreviews.length} of {MAX_FILES}
                            {" "}files selected
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={clearSelectedFiles}
                          disabled={isSubmitting}
                        >
                          <Trash2 size={15} />
                          Clear all
                        </button>
                      </div>

                      <div className="admin-gallery__pending-list">
                        {selectedFilePreviews.map((preview) => (
                          <article
                            className="admin-gallery__pending-item"
                            key={getFileKey(preview.file)}
                          >
                            <img
                              src={preview.previewUrl}
                              alt={preview.file.name}
                            />

                            <div className="admin-gallery__file-details">
                              <FileImage size={17} />

                              <div>
                                <strong className="admin-gallery__file-name-text">
                                  {preview.file.name}
                                </strong>
                                <span className="admin-gallery__file-size">
                                  {formatFileSize(preview.file.size)}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="admin-gallery__remove-pending"
                              onClick={() =>
                                removeSelectedFile(preview.file)
                              }
                              disabled={isSubmitting}
                              aria-label={`Remove ${preview.file.name}`}
                            >
                              <X size={17} />
                            </button>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="admin-gallery__pending-fields admin-gallery__metadata-fields">
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
                    disabled={isSubmitting}
                  />
                </label>

                {editingItem && (
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
                      disabled={isSubmitting}
                    />
                  </label>
                )}

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
                    disabled={isSubmitting}
                  />
                </label>

                <label className="admin-gallery__description-field">
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </label>

                <label className="admin-gallery__featured-field">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        isFeatured: event.target.checked,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                  Featured image
                </label>
              </div>

              {editingItem && form.imageUrl && (
                <div className="admin-gallery__edit-preview">
                  <img
                    src={form.imageUrl}
                    alt={form.altText || form.title || "Preview"}
                  />

                  <div>
                    <strong>Current image preview</strong>
                    <p>
                      Confirm that the existing image URL loads
                      correctly.
                    </p>
                  </div>
                </div>
              )}

              {formError && (
                <div className="admin-gallery__upload-error">
                  <X size={17} />
                  <p>{formError}</p>
                </div>
              )}
            </div>

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
                  <Upload size={17} />
                )}

                {isSubmitting
                  ? editingItem
                    ? "Saving..."
                    : "Uploading..."
                  : editingItem
                    ? "Save Changes"
                    : "Upload Images"}
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