import {
  Check,
  Eye,
  Film,
  FileImage,
  Image as ImageIcon,
  Images,
  Pencil,
  Play,
  
  Search,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import {
  deleteGalleryImage,
  deleteGalleryImagesBatch,
  getGalleryCleanupOperations,
  getGalleryCleanupOperation,
  retryGalleryCleanup,
  parseGalleryDeletion,
  getAdminGallery,
  updateGalleryImage,
  uploadGalleryImages,
  uploadGalleryVideo,
} from "../../services/gallery.service";

import type {
  GalleryImage,
  GalleryDeletionResponse,
  GalleryStatus,
  UpdateGalleryImageInput,
} from "../../types/gallery";

import { API_URL, ApiError } from "../../services/api.service";
import GalleryMedia from "../../components/gallery/GalleryMedia";
import GalleryMediaImage from "../components/GalleryMediaImage";
import { selectVisibleImages, pruneGallerySelection, reconcileGalleryDeletion, describeGalleryDeletion } from "../utils/gallery-selection";
import "../style/admin-gallery.css";

type StatusFilter =
  | "ALL"
  | GalleryStatus;

type MediaFilter =
  | "ALL"
  | "IMAGE"
  | "VIDEO"
  | "HOMEPAGE";

type UploadMode =
  | "IMAGES"
  | "VIDEO";

type GalleryFormState = {
  title: string;
  description: string;
  imageUrl: string;
  altText: string;

  status: GalleryStatus;

  isFeatured: boolean;

  sortOrder: string;

  showOnHomepage: boolean;
  homepageSortOrder: string;
};

type SelectedFilePreview = {
  file: File;
  previewUrl: string;
};

const MAX_IMAGE_FILES = 10;

const MAX_IMAGE_FILE_SIZE =
  5 * 1024 * 1024;

const MAX_VIDEO_FILE_SIZE =
  100 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const emptyForm: GalleryFormState = {
  title: "",
  description: "",
  imageUrl: "",
  altText: "",

  status: "DRAFT",

  isFeatured: false,

  sortOrder: "0",

  showOnHomepage: false,
  homepageSortOrder: "0",
};

const statusFilters: StatusFilter[] = [
  "ALL",
  "PUBLISHED",
  "DRAFT",
  "ARCHIVED",
];

const mediaFilters: {
  value: MediaFilter;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "All Media",
  },
  {
    value: "IMAGE",
    label: "Images",
  },
  {
    value: "VIDEO",
    label: "Videos",
  },
  {
    value: "HOMEPAGE",
    label: "Homepage Reels",
  },
];

function formatStatus(
  status: GalleryStatus,
): string {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

function formatFileSize(
  size: number,
): string {
  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function formatDuration(
  duration: number | null,
): string | null {
  if (
    duration === null ||
    !Number.isFinite(duration)
  ) {
    return null;
  }

  const totalSeconds =
    Math.max(
      0,
      Math.round(duration),
    );

  const minutes =
    Math.floor(
      totalSeconds / 60,
    );

  const seconds =
    totalSeconds % 60;

  return `${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

function getFileKey(
  file: File,
): string {
  return [
    file.name,
    file.size,
    file.lastModified,
  ].join("-");
}

function deletionErrorMessage(error: unknown): string {
  const details = error instanceof Error ? error.message : "Unable to reach the API.";
  if (error instanceof ApiError) {
    const context: Record<number, string> = {
      400: "The API rejected this request. Check the selected images and storage ownership.",
      401: "Your session has expired. Sign in again before deleting.",
      403: "Your account does not have permission for this action.",
      409: "An asset is shared or reserved by another cleanup operation. No deletion was confirmed.",
      500: "The server could not confirm the outcome. Refresh gallery data and cleanup operations before retrying.",
    };
    return `${context[error.status] ?? "The API could not complete this action."} ${details}`;
  }
  return `${details} If a delete request was sent, its outcome may be unknown. Refresh gallery data and cleanup operations before retrying.`;
}

function AdminGallery() {
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [operationBusy, setOperationBusy] = useState<string | null>(null);
  const [operations, setOperations] = useState<GalleryDeletionResponse[]>([]);
  const [apiVerified, setApiVerified] = useState(false);
  const [checkingApi, setCheckingApi] = useState(true);
  const [capabilityError, setCapabilityError] = useState<string | null>(null);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [deletionNotice, setDeletionNotice] = useState<string | null>(null);
  const deletionLock = useRef(false);
  const confirmationRef = useRef<HTMLDialogElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const deleteSelectedRef = useRef<HTMLButtonElement>(null);

  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(
    () => new Set(),
  );

  function toggleImageSelection(id: number) {
    setSelectedImageIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const [
    galleryItems,
    setGalleryItems,
  ] = useState<GalleryImage[]>([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>("ALL");

  const [
    mediaFilter,
    setMediaFilter,
  ] =
    useState<MediaFilter>("ALL");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<number | null>(
    null,
  );

  const [
    deletingId,
    setDeletingId,
  ] = useState<number | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    formError,
    setFormError,
  ] = useState<
    string | null
  >(null);

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const [
    uploadMode,
    setUploadMode,
  ] =
    useState<UploadMode>("IMAGES");

  const [
    editingItem,
    setEditingItem,
  ] =
    useState<GalleryImage | null>(
      null,
    );

  const [
    previewItem,
    setPreviewItem,
  ] =
    useState<GalleryImage | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<GalleryFormState>(
      emptyForm,
    );

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState<File[]>([]);

  const [
    selectedFilePreviews,
    setSelectedFilePreviews,
  ] = useState<
    SelectedFilePreview[]
  >([]);

  const [
    selectedVideo,
    setSelectedVideo,
  ] = useState<File | null>(
    null,
  );

  const [
    selectedVideoPreview,
    setSelectedVideoPreview,
  ] = useState<
    string | null
  >(null);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const imageInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const videoInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const selectedFilePreviewsRef =
    useRef<
      SelectedFilePreview[]
    >([]);

  const selectedVideoPreviewRef =
    useRef<string | null>(
      null,
    );

  useEffect(() => {
    selectedFilePreviewsRef.current =
      selectedFilePreviews;
  }, [selectedFilePreviews]);

  useEffect(() => {
    selectedVideoPreviewRef.current =
      selectedVideoPreview;
  }, [selectedVideoPreview]);

  useEffect(() => {
    return () => {
      selectedFilePreviewsRef.current.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview.previewUrl,
          );
        },
      );

      if (
        selectedVideoPreviewRef.current
      ) {
        URL.revokeObjectURL(
          selectedVideoPreviewRef.current,
        );
      }
    };
  }, []);

  const updateOperation = useCallback((result: GalleryDeletionResponse) => {
    setOperations(current => [result, ...current.filter(item => item.operationId !== result.operationId)].slice(0, 100));
  }, []);

  const verifyApi = useCallback((isActive: () => boolean = () => true) => {
    return getGalleryCleanupOperations().then(pending => {
      if (!isActive()) return;
      setOperations(current => [...pending, ...current.filter(item => !pending.some(operation => operation.operationId === item.operationId))].slice(0, 100));
      setApiVerified(true);
      setCapabilityError(null);
    }).catch((error: unknown) => {
      if (!isActive()) return;
      setApiVerified(false);
      setCapabilityError(`Bulk deletion is disabled: the active API could not verify the cleanup operations contract. ${error instanceof Error ? error.message : "Connection failed."}`);
    }).finally(() => {
      if (isActive()) setCheckingApi(false);
    });
  }, []);

  useEffect(() => {
    let active = true;
    void verifyApi(() => active);
    return () => { active = false; };
  }, [verifyApi]);

  function applyDeletion(result: GalleryDeletionResponse) {
    setGalleryItems(current => reconcileGalleryDeletion(current, new Set(), result).items);
    setSelectedImageIds(current => reconcileGalleryDeletion([], current, result).selection);
    if (previewItem && [...result.deletedIds, ...result.notFoundIds].includes(previewItem.id)) setPreviewItem(null);
    updateOperation(result);
    setDeletionNotice(describeGalleryDeletion(result));
  }

  async function handleBatchDelete() {
    if (deletionLock.current || !apiVerified || selectedImageIds.size < 1 || selectedImageIds.size > 100) return;
    // Snapshot at confirmation, including selections hidden by filters.
    const ids = [...selectedImageIds];
    deletionLock.current = true;
    setIsBulkDeleting(true);
    setDeletionError(null);
    setDeletionNotice(null);
    try {
      applyDeletion(await deleteGalleryImagesBatch(ids));
      confirmationRef.current?.close();
      deleteSelectedRef.current?.focus();
    } catch (error) {
      if (error instanceof ApiError && [404, 405].includes(error.status)) {
        setApiVerified(false);
        setCapabilityError("Bulk deletion is disabled because this deployment does not provide the batch route. Check the active API before retrying.");
      }
      setDeletionError(deletionErrorMessage(error));
      confirmationRef.current?.close();
      deleteSelectedRef.current?.focus();
    } finally {
      deletionLock.current = false;
      setIsBulkDeleting(false);
    }
  }

  async function handleOperation(operationId: string, retry: boolean) {
    if (deletionLock.current) return;
    deletionLock.current = true;
    setOperationBusy(operationId);
    setDeletionError(null);
    try {
      const result = await (retry ? retryGalleryCleanup(operationId) : getGalleryCleanupOperation(operationId));
      applyDeletion(result);
    } catch (error) {
      setDeletionError(deletionErrorMessage(error));
    } finally {
      deletionLock.current = false;
      setOperationBusy(null);
    }
  }

  async function loadGallery() {
    try {
      setIsLoading(true);
      setError(null);

      const data =
        await getAdminGallery();

      setGalleryItems(data);
      setSelectedImageIds((current) => pruneGallerySelection(current, data));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load gallery media.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminGallery().then((items) => {
      if (active) setGalleryItems(items);
    }).catch((requestError: unknown) => {
      if (active) setError(requestError instanceof Error ? requestError.message : "Failed to load gallery media.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filteredItems =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return galleryItems.filter(
        (item) => {
          const matchesSearch =
            item.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              item.description ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              item.altText ?? ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              item.event?.title ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            item.status ===
              statusFilter;

          let matchesMedia =
            true;

          if (
            mediaFilter === "IMAGE"
          ) {
            matchesMedia =
              item.mediaType ===
              "IMAGE";
          }

          if (
            mediaFilter === "VIDEO"
          ) {
            matchesMedia =
              item.mediaType ===
              "VIDEO";
          }

          if (
            mediaFilter ===
            "HOMEPAGE"
          ) {
            matchesMedia =
              item.mediaType ===
                "VIDEO" &&
              item.showOnHomepage;
          }

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMedia
          );
        },
      );
    }, [
      galleryItems,
      searchTerm,
      statusFilter,
      mediaFilter,
    ]);

  const visibleImages = filteredItems.filter((item) => item.mediaType === "IMAGE");
  const visibleSelectedCount = visibleImages.filter((item) => selectedImageIds.has(item.id)).length;
  const hiddenSelectedCount = selectedImageIds.size - visibleSelectedCount;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < visibleImages.length;
  }, [visibleSelectedCount, visibleImages.length]);

  const isMutating = isBulkDeleting || operationBusy !== null || deletingId !== null || updatingId !== null || isSubmitting;

  const imageCount =
    galleryItems.filter(
      (item) =>
        item.mediaType ===
        "IMAGE",
    ).length;

  const videoCount =
    galleryItems.filter(
      (item) =>
        item.mediaType ===
        "VIDEO",
    ).length;

  const homepageReelCount =
    galleryItems.filter(
      (item) =>
        item.mediaType ===
          "VIDEO" &&
        item.showOnHomepage,
    ).length;

  function clearSelectedImages() {
    selectedFilePreviewsRef.current.forEach(
      (preview) => {
        URL.revokeObjectURL(
          preview.previewUrl,
        );
      },
    );

    selectedFilePreviewsRef.current =
      [];

    setSelectedFiles([]);
    setSelectedFilePreviews(
      [],
    );

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  }

  function clearSelectedVideo() {
    if (
      selectedVideoPreviewRef.current
    ) {
      URL.revokeObjectURL(
        selectedVideoPreviewRef.current,
      );
    }

    selectedVideoPreviewRef.current =
      null;

    setSelectedVideo(null);

    setSelectedVideoPreview(
      null,
    );

    if (
      videoInputRef.current
    ) {
      videoInputRef.current.value =
        "";
    }
  }

  function clearSelections() {
    clearSelectedImages();
    clearSelectedVideo();
  }

  function openCreateImagesForm() {
    if (deletionLock.current) return;
    clearSelections();

    setEditingItem(null);
    setUploadMode("IMAGES");

    setForm({
      ...emptyForm,
    });

    setFormError(null);
    setIsDragging(false);
    setIsFormOpen(true);
  }

  function openCreateVideoForm() {
    if (deletionLock.current) return;
    clearSelections();

    setEditingItem(null);
    setUploadMode("VIDEO");

    setForm({
      ...emptyForm,
    });

    setFormError(null);
    setIsDragging(false);
    setIsFormOpen(true);
  }

  function openEditForm(
    item: GalleryImage,
  ) {
    if (deletionLock.current) return;
    clearSelections();

    setEditingItem(item);

    setUploadMode(
      item.mediaType ===
        "VIDEO"
        ? "VIDEO"
        : "IMAGES",
    );

    setForm({
      title: item.title,

      description:
        item.description ?? "",

      imageUrl:
        item.imageUrl,

      altText:
        item.altText ?? "",

      status:
        item.status,

      isFeatured:
        item.isFeatured,

      sortOrder:
        String(
          item.sortOrder,
        ),

      showOnHomepage:
        item.showOnHomepage,

      homepageSortOrder:
        String(
          item.homepageSortOrder,
        ),
    });

    setFormError(null);
    setIsDragging(false);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSubmitting) {
      return;
    }

    clearSelections();

    setIsFormOpen(false);
    setEditingItem(null);

    setForm({
      ...emptyForm,
    });

    setFormError(null);
    setIsDragging(false);
  }

  function addSelectedImages(
    incomingFiles: File[],
  ) {
    setFormError(null);

    if (
      incomingFiles.length ===
      0
    ) {
      return;
    }

    const existingKeys =
      new Set(
        selectedFiles.map(
          getFileKey,
        ),
      );

    const acceptedFiles:
      File[] = [];

    const validationMessages:
      string[] = [];

    for (
      const file of
      incomingFiles
    ) {
      if (
        !ACCEPTED_IMAGE_TYPES.includes(
          file.type,
        )
      ) {
        validationMessages.push(
          `${file.name}: unsupported file type. Use JPG, PNG, or WEBP.`,
        );

        continue;
      }

      if (
        file.size >
        MAX_IMAGE_FILE_SIZE
      ) {
        validationMessages.push(
          `${file.name}: file is larger than 5 MB.`,
        );

        continue;
      }

      const fileKey =
        getFileKey(file);

      if (
        existingKeys.has(
          fileKey,
        )
      ) {
        validationMessages.push(
          `${file.name}: this file is already selected.`,
        );

        continue;
      }

      if (
        selectedFiles.length +
          acceptedFiles.length >=
        MAX_IMAGE_FILES
      ) {
        validationMessages.push(
          `You can select a maximum of ${MAX_IMAGE_FILES} images.`,
        );

        break;
      }

      existingKeys.add(
        fileKey,
      );

      acceptedFiles.push(
        file,
      );
    }

    if (
      acceptedFiles.length >
      0
    ) {
      const newPreviews =
        acceptedFiles.map(
          (file) => ({
            file,

            previewUrl:
              URL.createObjectURL(
                file,
              ),
          }),
        );

      setSelectedFiles(
        (currentFiles) => [
          ...currentFiles,
          ...acceptedFiles,
        ],
      );

      setSelectedFilePreviews(
        (
          currentPreviews,
        ) => [
          ...currentPreviews,
          ...newPreviews,
        ],
      );
    }

    if (
      validationMessages.length >
      0
    ) {
      setFormError(
        validationMessages.join(
          " ",
        ),
      );
    }

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    addSelectedImages(
      Array.from(
        event.target.files ??
          [],
      ),
    );
  }

  function selectVideo(
    file: File | undefined,
  ) {
    setFormError(null);

    if (!file) {
      return;
    }

    if (
      !ACCEPTED_VIDEO_TYPES.includes(
        file.type,
      )
    ) {
      setFormError(
        "Only MP4, WebM, and MOV videos are allowed.",
      );

      return;
    }

    if (
      file.size >
      MAX_VIDEO_FILE_SIZE
    ) {
      setFormError(
        "The video must be 100 MB or smaller.",
      );

      return;
    }

    clearSelectedVideo();

    const previewUrl =
      URL.createObjectURL(file);

    selectedVideoPreviewRef.current =
      previewUrl;

    setSelectedVideo(file);

    setSelectedVideoPreview(
      previewUrl,
    );
  }

  function handleVideoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    selectVideo(
      event.target.files?.[0],
    );
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    if (!isSubmitting) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(false);

    if (isSubmitting) {
      return;
    }

    const files =
      Array.from(
        event.dataTransfer.files,
      );

    if (
      uploadMode ===
      "VIDEO"
    ) {
      selectVideo(
        files[0],
      );

      return;
    }

    addSelectedImages(
      files,
    );
  }

  function removeSelectedImage(
    fileToRemove: File,
  ) {
    if (isSubmitting) {
      return;
    }

    const fileKey =
      getFileKey(
        fileToRemove,
      );

    const previewToRemove =
      selectedFilePreviews.find(
        (preview) =>
          getFileKey(
            preview.file,
          ) === fileKey,
      );

    if (
      previewToRemove
    ) {
      URL.revokeObjectURL(
        previewToRemove.previewUrl,
      );
    }

    setSelectedFiles(
      (currentFiles) =>
        currentFiles.filter(
          (file) =>
            getFileKey(file) !==
            fileKey,
        ),
    );

    setSelectedFilePreviews(
      (
        currentPreviews,
      ) =>
        currentPreviews.filter(
          (preview) =>
            getFileKey(
              preview.file,
            ) !== fileKey,
        ),
    );

    setFormError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (deletionLock.current) return;

    const title =
      form.title.trim();

    const sortOrder =
      Number(
        form.sortOrder,
      );

    const homepageSortOrder =
      Number(
        form.homepageSortOrder,
      );

    if (!title) {
      setFormError(
        "The media title is required.",
      );

      return;
    }

    if (
      !editingItem &&
      uploadMode ===
        "IMAGES" &&
      selectedFiles.length ===
        0
    ) {
      setFormError(
        "Select at least one image to upload.",
      );

      return;
    }

    if (
      !editingItem &&
      uploadMode ===
        "VIDEO" &&
      !selectedVideo
    ) {
      setFormError(
        "Select a video to upload.",
      );

      return;
    }

    if (
      !Number.isInteger(
        sortOrder,
      ) ||
      sortOrder < 0
    ) {
      setFormError(
        "Sort order must be a non-negative whole number.",
      );

      return;
    }

    if (
      !Number.isInteger(
        homepageSortOrder,
      ) ||
      homepageSortOrder <
        0
    ) {
      setFormError(
        "Homepage reel order must be a non-negative whole number.",
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingItem) {
        const updateData:
          UpdateGalleryImageInput =
          {
            title,

            description:
              form.description.trim(),

            altText:
              form.altText.trim(),

            status:
              form.status,

            isFeatured:
              form.isFeatured,

            sortOrder,

            showOnHomepage:
              editingItem.mediaType ===
              "VIDEO"
                ? form.showOnHomepage
                : false,

            homepageSortOrder:
              editingItem.mediaType ===
              "VIDEO"
                ? homepageSortOrder
                : 0,
          };

        const updatedItem =
          await updateGalleryImage(
            editingItem.id,
            updateData,
          );

        setGalleryItems(
          (currentItems) =>
            currentItems.map(
              (item) =>
                item.id ===
                updatedItem.id
                  ? updatedItem
                  : item,
            ),
        );
      } else if (
        uploadMode ===
        "VIDEO" &&
        selectedVideo
      ) {
        const createdVideo =
          await uploadGalleryVideo(
            {
              file:
                selectedVideo,

              title,

              description:
                form.description.trim() ||
                undefined,

              altText:
                form.altText.trim() ||
                undefined,

              status:
                form.status,

              isFeatured:
                form.isFeatured,

              sortOrder,

              showOnHomepage:
                form.showOnHomepage,

              homepageSortOrder,
            },
          );

        setGalleryItems(
          (currentItems) => [
            createdVideo,
            ...currentItems,
          ],
        );
      } else {
        const response =
          await uploadGalleryImages(
            {
              files:
                selectedFiles,

              title,

              description:
                form.description.trim() ||
                undefined,

              altText:
                form.altText.trim() ||
                undefined,

              status:
                form.status,

              isFeatured:
                form.isFeatured,

              sortOrder,
            },
          );

        setGalleryItems(
          (currentItems) => [
            ...response.items,
            ...currentItems,
          ],
        );
      }

      clearSelections();

      setIsFormOpen(false);
      setEditingItem(null);

      setForm({
        ...emptyForm,
      });

      setFormError(null);
      setIsDragging(false);
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : editingItem
            ? "Failed to update the media item."
            : uploadMode ===
                "VIDEO"
              ? "Failed to upload the video."
              : "Failed to upload the images.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(
    item: GalleryImage,
  ) {
    if (deletionLock.current || isMutating) return;
    const confirmed =
      window.confirm(
        `Delete "${item.title}"? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    deletionLock.current = true;
    setDeletionError(null);
    setDeletionNotice(null);
    try {
      setDeletingId(
        item.id,
      );

      setError(null);

      const deleted = await deleteGalleryImage(item.id);
      if (deleted.deletion) applyDeletion(parseGalleryDeletion(deleted.deletion));
      else setDeletionNotice("Gallery record deleted. This API did not report physical file cleanup status.");
      setSelectedImageIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });

      setGalleryItems(
        (currentItems) =>
          currentItems.filter(
            (galleryItem) =>
              galleryItem.id !==
              item.id,
          ),
      );

      if (
        previewItem?.id ===
        item.id
      ) {
        setPreviewItem(null);
      }
    } catch (requestError) {
      setDeletionError(deletionErrorMessage(requestError));
    } finally {
      deletionLock.current = false;
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(
    item: GalleryImage,
  ) {
    if (deletionLock.current) return;
    const nextStatus:
      GalleryStatus =
      item.status ===
      "PUBLISHED"
        ? "DRAFT"
        : "PUBLISHED";

    try {
      setUpdatingId(
        item.id,
      );

      setError(null);

      const updatedItem =
        await updateGalleryImage(
          item.id,
          {
            status:
              nextStatus,
          },
        );

      setGalleryItems(
        (currentItems) =>
          currentItems.map(
            (galleryItem) =>
              galleryItem.id ===
              updatedItem.id
                ? updatedItem
                : galleryItem,
          ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update the media status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleHomepage(
    item: GalleryImage,
  ) {
    if (deletionLock.current) return;
    if (
      item.mediaType !==
      "VIDEO"
    ) {
      return;
    }

    try {
      setUpdatingId(
        item.id,
      );

      setError(null);

      const updatedItem =
        await updateGalleryImage(
          item.id,
          {
            showOnHomepage:
              !item.showOnHomepage,
          },
        );

      setGalleryItems(
        (currentItems) =>
          currentItems.map(
            (galleryItem) =>
              galleryItem.id ===
              updatedItem.id
                ? updatedItem
                : galleryItem,
          ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update homepage reel visibility.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const isEditingVideo =
    editingItem?.mediaType ===
    "VIDEO";

  const isVideoForm =
    !editingItem
      ? uploadMode ===
        "VIDEO"
      : isEditingVideo;

  return (
    <section className="admin-gallery" aria-busy={isBulkDeleting}>
      <fieldset className="admin-gallery__page-controls" disabled={isBulkDeleting || operationBusy !== null}>
      <header className="admin-gallery__header">
        <div className="admin-gallery__heading">
          <span className="admin-gallery__eyebrow">
            <Images size={15} />
            Gallery Media
          </span>

          <p>
            Manage photos, videos,
            published content and
            homepage festival reels.
          </p>
        </div>

        <div className="admin-gallery__header-actions">
          <button
            type="button"
            className="admin-gallery__add admin-gallery__add--secondary"
            onClick={
              openCreateImagesForm
            }
          >
            <ImageIcon
              size={17}
            />
            Add Images
          </button>

          <button
            type="button"
            className="admin-gallery__add"
            onClick={
              openCreateVideoForm
            }
          >
            <Video
              size={17}
            />
            Add Video
          </button>
        </div>
      </header>

      <div className="admin-gallery__stats">
        <article className="admin-gallery__stat-card">
          <div className="admin-gallery__stat-icon">
            <Images
              size={18}
            />
          </div>

          <div>
            <span>
              Total Media
            </span>

            <strong>
              {
                galleryItems.length
              }
            </strong>

            <small>
              All gallery records
            </small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--images">
          <div className="admin-gallery__stat-icon">
            <ImageIcon
              size={18}
            />
          </div>

          <div>
            <span>
              Images
            </span>

            <strong>
              {imageCount}
            </strong>

            <small>
              Gallery photos
            </small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--videos">
          <div className="admin-gallery__stat-icon">
            <Film size={18} />
          </div>

          <div>
            <span>
              Videos
            </span>

            <strong>
              {videoCount}
            </strong>

            <small>
              Gallery videos
            </small>
          </div>
        </article>

        <article className="admin-gallery__stat-card admin-gallery__stat-card--reels">
          <div className="admin-gallery__stat-icon">
            <Sparkles
              size={18}
            />
          </div>

          <div>
            <span>
              Homepage Reels
            </span>

            <strong>
              {
                homepageReelCount
              }
            </strong>

            <small>
              Featured on home
            </small>
          </div>
        </article>
      </div>

      <div className="admin-gallery__content">
        <div className="admin-gallery__toolbar">
          <div className="admin-gallery__search">
            <Search
              size={18}
            />

            <input
              type="search"
              placeholder="Search gallery media..."
              value={
                searchTerm
              }
              onChange={(
                event,
              ) =>
                setSearchTerm(
                  event.target
                    .value,
                )
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm(
                    "",
                  )
                }
                aria-label="Clear search"
              >
                <X
                  size={16}
                />
              </button>
            )}
          </div>

          <div className="admin-gallery__toolbar-filters">
            <div className="admin-gallery__filters">
              {mediaFilters.map(
                (filter) => (
                  <button
                    type="button"
                    key={
                      filter.value
                    }
                    className={
                      mediaFilter ===
                      filter.value
                        ? "admin-gallery__filter admin-gallery__filter--active"
                        : "admin-gallery__filter"
                    }
                    onClick={() =>
                      setMediaFilter(
                        filter.value,
                      )
                    }
                  >
                    {
                      filter.label
                    }
                  </button>
                ),
              )}
            </div>

            <div className="admin-gallery__filters">
              {statusFilters.map(
                (status) => (
                  <button
                    type="button"
                    key={status}
                    className={
                      statusFilter ===
                      status
                        ? "admin-gallery__filter admin-gallery__filter--active"
                        : "admin-gallery__filter"
                    }
                    onClick={() =>
                      setStatusFilter(
                        status,
                      )
                    }
                  >
                    {status ===
                    "ALL"
                      ? "Any Status"
                      : formatStatus(
                          status,
                        )}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="admin-gallery__selection-toolbar" aria-label="Image selection">
          <label className="admin-gallery__select-all">
            <input ref={selectAllRef} type="checkbox"
              checked={visibleImages.length > 0 && visibleSelectedCount === visibleImages.length}
              disabled={isLoading || !!error || isMutating || visibleImages.length === 0}
              onChange={event => {
                if (event.target.checked) setSelectedImageIds(current => selectVisibleImages(current, filteredItems));
                else setSelectedImageIds(current => new Set([...current].filter(id => !visibleImages.some(item => item.id === id))));
              }} />
            Select All <small>({visibleImages.length} visible images)</small>
          </label>
          <span className="admin-gallery__selection-count" role="status" aria-live="polite" aria-atomic="true">
            {selectedImageIds.size} images selected
            {hiddenSelectedCount > 0 && ` (${hiddenSelectedCount} hidden by filters)`}
          </span>
          <div className="admin-gallery__selection-actions">
            <button type="button" disabled={selectedImageIds.size === 0 || isMutating}
              onClick={() => setSelectedImageIds(new Set())}>Deselect All</button>
            <button ref={deleteSelectedRef} type="button" className="admin-gallery__bulk-delete"
              disabled={!apiVerified || checkingApi || isMutating || selectedImageIds.size === 0 || selectedImageIds.size > 100 || isLoading || !!error}
              aria-describedby="gallery-bulk-delete-help"
              onClick={() => { setDeletionError(null); confirmationRef.current?.showModal(); }}>
              <Trash2 size={15} aria-hidden="true" />
              {isBulkDeleting ? "Deleting records..." : "Delete Selected"}
            </button>
          </div>
          <p id="gallery-bulk-delete-help">
            Select All applies to visible images only. Deselect All clears every selection, including hidden images.
            Delete up to 100 images at a time. Videos are excluded.
          </p>
        </div>

        <div className="admin-gallery__api-status">
          <span>API: <code>{API_URL}</code></span>
          <span>{checkingApi ? "Checking batch deletion support..." : apiVerified ? "Batch deletion contract verified" : capabilityError}</span>
          <button type="button" disabled={checkingApi || isMutating} onClick={() => { setCheckingApi(true); void verifyApi(); }}>Check API / refresh operations</button>
        </div>
        {selectedImageIds.size > 100 && <p className="admin-gallery__notice" role="status">More than 100 images are selected. Deselect images before deleting; selections will not be split into automatic requests.</p>}
        {deletionNotice && <p className="admin-gallery__notice" role="status">{deletionNotice}</p>}
        {deletionError && <div className="admin-gallery__notice admin-gallery__notice--error" role="alert">
          <p>{deletionError}</p>
          <button type="button" disabled={isMutating} onClick={() => { void loadGallery(); setCheckingApi(true); void verifyApi(); }}>Refresh gallery and operations</button>
        </div>}
        {operations.length > 0 && <section className="admin-gallery__cleanup" aria-label="File cleanup operations">
          <h2>File cleanup</h2>
          <p>Deleting a record and cleaning up its files are separate outcomes. Legacy assets may be preserved.</p>
          {operations.map(operation => <div className="admin-gallery__cleanup-row" key={operation.operationId}>
            <div>
              <strong>{operation.status === "completed" ? "Cleanup completed" : operation.status === "cleanup_failed" ? "Cleanup needs attention" : "Cleanup pending"}</strong>
              <small>Operation {operation.operationId}</small>
              <span>{operation.deletedIds.length} records deleted | {operation.cleanup.pending} files pending | {operation.cleanup.failed} failed | {operation.preservedAssetIds.length} records with preserved assets</span>
            </div>
            <div className="admin-gallery__selection-actions">
              <button type="button" disabled={isMutating} onClick={() => void handleOperation(operation.operationId, false)}>Refresh status</button>
              {operation.status !== "completed" && <button type="button" disabled={isMutating || !apiVerified} onClick={() => void handleOperation(operation.operationId, true)}>{operationBusy === operation.operationId ? "Working..." : "Retry file cleanup"}</button>}
            </div>
          </div>)}
        </section>}

        {error && (
          <div className="admin-gallery__empty">
            <h2>
              Something went
              wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadGallery()
              }
            >
              Try Again
            </button>
          </div>
        )}

        {!error &&
          isLoading && (
            <div className="admin-gallery__empty">
              <Images
                size={30}
              />

              <h2>
                Loading gallery
              </h2>

              <p>
                Please wait while
                the media library
                loads.
              </p>
            </div>
          )}

        {!error &&
          !isLoading &&
          filteredItems.length >
            0 && (
            <div className="admin-gallery__grid">
              {filteredItems.map(
                (item) => {
                  const duration =
                    formatDuration(
                      item.duration,
                    );

                  return (
                    <article
                      className={`admin-gallery__card${selectedImageIds.has(item.id) ? " admin-gallery__card--selected" : ""}`}
                      key={
                        item.id
                      }
                    >
                      <div className="admin-gallery__image-wrap">
                        {item.mediaType ===
                        "VIDEO" ? (
                          <>
                            {item.thumbnailUrl ? (
                              <GalleryMediaImage
                                src={
                                  item.thumbnailUrl
                                }
                                alt={
                                  item.altText ??
                                  item.title
                                }
                              />
                            ) : (
                              <GalleryMedia mediaType="VIDEO" alt={item.altText || item.title}
                                src={
                                  item.imageUrl
                                }
                                muted
                                playsInline
                                preload="metadata"
                              />
                            )}

                            <div className="admin-gallery__video-play">
                              <Play
                                size={
                                  19
                                }
                                aria-hidden="true"
                              />
                            </div>
                          </>
                        ) : (
                          <GalleryMediaImage
                            src={
                              item.imageUrl
                            }
                            alt={
                              item.altText ??
                              item.title
                            }
                          />
                        )}

                        <div className="admin-gallery__image-overlay" />

                        <span className="admin-gallery__media-badge">
                          {item.mediaType ===
                          "VIDEO" ? (
                            <Video
                              size={
                                12
                              }
                            />
                          ) : (
                            <ImageIcon
                              size={
                                12
                              }
                            />
                          )}

                          {
                            item.mediaType
                          }
                        </span>

                        <span
                          className={`admin-gallery__status admin-gallery__status--${item.status.toLowerCase()}`}
                        >
                          <span />

                          {formatStatus(
                            item.status,
                          )}
                        </span>

                        <button
                          type="button"
                          className="admin-gallery__preview-button"
                          onClick={() =>
                            setPreviewItem(
                              item,
                            )
                          }
                          aria-label={`Preview ${item.title}`}
                        >
                          <Eye
                            size={
                              18
                            }
                          />
                        </button>
                      </div>

                      <div className="admin-gallery__body">
                        {item.mediaType === "IMAGE" && (
                          <label className="admin-gallery__selection-check">
                            <input
                              type="checkbox"
                              checked={selectedImageIds.has(item.id)}
                              onChange={() => { if (!isMutating) toggleImageSelection(item.id); }}
                              disabled={isMutating}
                              aria-label={`Select image: ${item.title}`}
                            />
                            Select image
                          </label>
                        )}
                        <div className="admin-gallery__meta-row">
                          <div className="admin-gallery__meta">
                            {item.mediaType ===
                            "VIDEO" ? (
                              <Film
                                size={
                                  15
                                }
                              />
                            ) : (
                              <ImageIcon
                                size={
                                  15
                                }
                              />
                            )}

                            <span>
                              {item.event
                                ?.title ??
                                "Waterfall Festival"}
                            </span>
                          </div>

                          {duration && (
                            <span className="admin-gallery__duration">
                              {
                                duration
                              }
                            </span>
                          )}
                        </div>

                        <h2>
                          {
                            item.title
                          }
                        </h2>

                        {item.description && (
                          <p className="admin-gallery__file-name">
                            {
                              item.description
                            }
                          </p>
                        )}

                        <div className="admin-gallery__card-tags">
                          {item.isFeatured && (
                            <span>
                              Featured
                            </span>
                          )}

                          {item.mediaType ===
                            "VIDEO" &&
                            item.showOnHomepage && (
                              <span className="admin-gallery__card-tag--reel">
                                Homepage
                                Reel #
                                {
                                  item.homepageSortOrder
                                }
                              </span>
                            )}
                        </div>

                        {item.mediaType ===
                          "VIDEO" && (
                          <button
                            type="button"
                            className={`admin-gallery__homepage-toggle ${
                              item.showOnHomepage
                                ? "admin-gallery__homepage-toggle--active"
                                : ""
                            }`}
                            disabled={
                              isMutating
                            }
                            onClick={() =>
                              void handleToggleHomepage(
                                item,
                              )
                            }
                          >
                            <Sparkles
                              size={
                                14
                              }
                            />

                            {item.showOnHomepage
                              ? "Remove from Homepage"
                              : "Add to Homepage Reels"}
                          </button>
                        )}

                        <fieldset className="admin-gallery__actions" disabled={isMutating}>
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                item,
                              )
                            }
                          >
                            <Pencil
                              size={
                                16
                              }
                            />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              isMutating
                            }
                            onClick={() =>
                              void handleToggleStatus(
                                item,
                              )
                            }
                          >
                            {item.status ===
                            "PUBLISHED" ? (
                              <>
                                <Eye
                                  size={
                                    16
                                  }
                                />

                                {updatingId ===
                                item.id
                                  ? "Updating..."
                                  : "Unpublish"}
                              </>
                            ) : (
                              <>
                                <Check
                                  size={
                                    16
                                  }
                                />

                                {updatingId ===
                                item.id
                                  ? "Updating..."
                                  : "Publish"}
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="admin-gallery__delete-action"
                            disabled={
                              deletingId ===
                              item.id
                            }
                            onClick={() =>
                              void handleDelete(
                                item,
                              )
                            }
                            aria-label={`Delete ${item.title}`}
                          >
                            <Trash2
                              size={
                                16
                              }
                            />
                          </button>
                        </fieldset>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}

        {!error &&
          !isLoading &&
          filteredItems.length ===
            0 && (
            <div className="admin-gallery__empty">
              <div className="admin-gallery__empty-icon">
                <Images
                  size={30}
                />
              </div>

              <h2>
                No gallery media
                found
              </h2>

              <p>
                Upload new media or
                change the current
                filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter(
                    "ALL",
                  );
                  setMediaFilter(
                    "ALL",
                  );
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
          onClick={
            closeForm
          }
        >
          <form
            className="admin-gallery__upload-modal"
            onSubmit={
              handleSubmit
            }
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <div className="admin-gallery__modal-header">
              <div>
                <span>
                  {editingItem
                    ? `Edit ${editingItem.mediaType === "VIDEO" ? "Video" : "Image"}`
                    : uploadMode ===
                        "VIDEO"
                      ? "Upload Video"
                      : "Upload Images"}
                </span>

                <h2>
                  {editingItem
                    ? "Update media"
                    : uploadMode ===
                        "VIDEO"
                      ? "Add festival video"
                      : "Add gallery images"}
                </h2>

                <p>
                  {editingItem
                    ? "Update publishing, metadata, ordering and homepage settings."
                    : uploadMode ===
                        "VIDEO"
                      ? "Upload an MP4, WebM or MOV video and optionally feature it in the homepage reels."
                      : "Choose up to 10 JPG, PNG or WEBP images and apply shared metadata."}
                </p>
              </div>

              <button
                type="button"
                className="admin-gallery__modal-close"
                onClick={
                  closeForm
                }
                disabled={
                  isSubmitting
                }
                aria-label="Close form"
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <div className="admin-gallery__modal-body">
              {!editingItem &&
                uploadMode ===
                  "IMAGES" && (
                  <>
                    <input
                      ref={
                        imageInputRef
                      }
                      className="admin-gallery__file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={
                        handleImageChange
                      }
                      disabled={
                        isSubmitting
                      }
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
                      tabIndex={
                        isSubmitting
                          ? -1
                          : 0
                      }
                      onClick={() => {
                        if (
                          !isSubmitting
                        ) {
                          imageInputRef.current?.click();
                        }
                      }}
                      onKeyDown={(
                        event,
                      ) => {
                        if (
                          !isSubmitting &&
                          (event.key ===
                            "Enter" ||
                            event.key ===
                              " ")
                        ) {
                          event.preventDefault();

                          imageInputRef.current?.click();
                        }
                      }}
                      onDragOver={
                        handleDragOver
                      }
                      onDragLeave={
                        handleDragLeave
                      }
                      onDrop={
                        handleDrop
                      }
                    >
                      <div className="admin-gallery__drop-icon">
                        <Images
                          size={
                            27
                          }
                        />
                      </div>

                      <h3>
                        Drop festival
                        images here
                      </h3>

                      <p>
                        JPG, PNG or
                        WEBP · maximum
                        5 MB each · up
                        to 10 files
                      </p>

                      <button
                        type="button"
                        disabled={
                          isSubmitting
                        }
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation();

                          imageInputRef.current?.click();
                        }}
                      >
                        <Images
                          size={
                            16
                          }
                        />
                        Choose Images
                      </button>
                    </div>

                    {selectedFilePreviews.length >
                      0 && (
                      <div className="admin-gallery__pending">
                        <div className="admin-gallery__pending-header">
                          <div>
                            <h3>
                              Selected
                              images
                            </h3>

                            <p>
                              {
                                selectedFilePreviews.length
                              }{" "}
                              of{" "}
                              {
                                MAX_IMAGE_FILES
                              }{" "}
                              files
                              selected
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={
                              clearSelectedImages
                            }
                            disabled={
                              isSubmitting
                            }
                          >
                            <Trash2
                              size={
                                15
                              }
                            />
                            Clear all
                          </button>
                        </div>

                        <div className="admin-gallery__pending-list">
                          {selectedFilePreviews.map(
                            (
                              preview,
                            ) => (
                              <article
                                className="admin-gallery__pending-item"
                                key={getFileKey(
                                  preview.file,
                                )}
                              >
                                <GalleryMediaImage
                                  src={
                                    preview.previewUrl
                                  }
                                  alt={
                                    preview.file.name
                                  }
                                />

                                <div className="admin-gallery__file-details">
                                  <FileImage
                                    size={
                                      17
                                    }
                                  />

                                  <div>
                                    <strong className="admin-gallery__file-name-text">
                                      {
                                        preview
                                          .file
                                          .name
                                      }
                                    </strong>

                                    <span className="admin-gallery__file-size">
                                      {formatFileSize(
                                        preview
                                          .file
                                          .size,
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="admin-gallery__remove-pending"
                                  onClick={() =>
                                    removeSelectedImage(
                                      preview.file,
                                    )
                                  }
                                  disabled={
                                    isSubmitting
                                  }
                                  aria-label={`Remove ${preview.file.name}`}
                                >
                                  <X
                                    size={
                                      17
                                    }
                                  />
                                </button>
                              </article>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

              {!editingItem &&
                uploadMode ===
                  "VIDEO" && (
                  <>
                    <input
                      ref={
                        videoInputRef
                      }
                      className="admin-gallery__file-input"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={
                        handleVideoChange
                      }
                      disabled={
                        isSubmitting
                      }
                    />

                    <div
                      className={`admin-gallery__drop-zone admin-gallery__drop-zone--video${
                        isDragging
                          ? " admin-gallery__drop-zone--dragging"
                          : ""
                      }${
                        isSubmitting
                          ? " admin-gallery__drop-zone--disabled"
                          : ""
                      }`}
                      role="button"
                      tabIndex={
                        isSubmitting
                          ? -1
                          : 0
                      }
                      onClick={() => {
                        if (
                          !isSubmitting
                        ) {
                          videoInputRef.current?.click();
                        }
                      }}
                      onKeyDown={(
                        event,
                      ) => {
                        if (
                          !isSubmitting &&
                          (event.key ===
                            "Enter" ||
                            event.key ===
                              " ")
                        ) {
                          event.preventDefault();

                          videoInputRef.current?.click();
                        }
                      }}
                      onDragOver={
                        handleDragOver
                      }
                      onDragLeave={
                        handleDragLeave
                      }
                      onDrop={
                        handleDrop
                      }
                    >
                      <div className="admin-gallery__drop-icon">
                        <Video
                          size={
                            27
                          }
                        />
                      </div>

                      <h3>
                        Drop a festival
                        video here
                      </h3>

                      <p>
                        MP4, WebM or MOV
                        · maximum 100 MB
                      </p>

                      <button
                        type="button"
                        disabled={
                          isSubmitting
                        }
                        onClick={(
                          event,
                        ) => {
                          event.stopPropagation();

                          videoInputRef.current?.click();
                        }}
                      >
                        <Video
                          size={
                            16
                          }
                        />
                        Choose Video
                      </button>
                    </div>

                    {selectedVideo &&
                      selectedVideoPreview && (
                        <div className="admin-gallery__video-pending">
                          <GalleryMedia mediaType="VIDEO" alt={selectedVideo?.name || "Video upload preview"}
                            src={
                              selectedVideoPreview
                            }
                            controls
                            muted
                            playsInline
                          />

                          <div className="admin-gallery__video-pending-info">
                            <div>
                              <Video
                                size={
                                  18
                                }
                              />

                              <div>
                                <strong>
                                  {
                                    selectedVideo.name
                                  }
                                </strong>

                                <span>
                                  {formatFileSize(
                                    selectedVideo.size,
                                  )}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={
                                clearSelectedVideo
                              }
                              disabled={
                                isSubmitting
                              }
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                              Remove
                            </button>
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
                    value={
                      form.title
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,

                          title:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder={
                      isVideoForm
                        ? "Waterfall Festival Night Reel"
                        : "Main Stage Crowd"
                    }
                    required
                    disabled={
                      isSubmitting
                    }
                  />
                </label>

                {editingItem && (
                  <label>
                    Media URL (managed by storage)
                    <input type="text" value={form.imageUrl} readOnly />
                  </label>
                )}

                <label>
                  Alt text

                  <input
                    type="text"
                    value={
                      form.altText
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,

                          altText:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Describe the visual content"
                    disabled={
                      isSubmitting
                    }
                  />
                </label>

                <label className="admin-gallery__description-field">
                  Description

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,

                          description:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Describe this festival moment..."
                    rows={4}
                    disabled={
                      isSubmitting
                    }
                  />
                </label>

                <label>
                  Status

                  <select
                    value={
                      form.status
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,

                          status:
                            event
                              .target
                              .value as GalleryStatus,
                        }),
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                    <option value="ARCHIVED">
                      Archived
                    </option>
                  </select>
                </label>

                <label>
                  Gallery order

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.sortOrder
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,

                          sortOrder:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                  />
                </label>

                <label className="admin-gallery__check-field">
                  <input
                    type="checkbox"
                    checked={
                      form.isFeatured
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,

                          isFeatured:
                            event
                              .target
                              .checked,
                        }),
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                  />

                  Featured media
                </label>

                {isVideoForm && (
                  <>
                    <label className="admin-gallery__check-field admin-gallery__check-field--reel">
                      <input
                        type="checkbox"
                        checked={
                          form.showOnHomepage
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              currentForm,
                            ) => ({
                              ...currentForm,

                              showOnHomepage:
                                event
                                  .target
                                  .checked,
                            }),
                          )
                        }
                        disabled={
                          isSubmitting
                        }
                      />

                      Show in homepage
                      reels
                    </label>

                    <label>
                      Homepage reel
                      order

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.homepageSortOrder
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              currentForm,
                            ) => ({
                              ...currentForm,

                              homepageSortOrder:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        disabled={
                          isSubmitting ||
                          !form.showOnHomepage
                        }
                      />
                    </label>
                  </>
                )}
              </div>

              {editingItem &&
                form.imageUrl && (
                  <div className="admin-gallery__edit-preview">
                    {editingItem.mediaType ===
                    "VIDEO" ? (
                      <GalleryMedia mediaType="VIDEO" alt={editingItem.altText || editingItem.title}
                        src={
                          form.imageUrl
                        }
                        poster={
                          editingItem.thumbnailUrl ??
                          undefined
                        }
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <GalleryMediaImage
                        src={
                          form.imageUrl
                        }
                        alt={
                          form.altText ||
                          form.title ||
                          "Preview"
                        }
                      />
                    )}

                    <div>
                      <strong>
                        Current{" "}
                        {editingItem.mediaType ===
                        "VIDEO"
                          ? "video"
                          : "image"}
                      </strong>

                      <p>
                        Update the
                        metadata without
                        re-uploading the
                        stored media
                        asset.
                      </p>
                    </div>
                  </div>
                )}

              {formError && (
                <div className="admin-gallery__upload-error">
                  <X
                    size={17}
                  />

                  <p>
                    {formError}
                  </p>
                </div>
              )}
            </div>

            <div className="admin-gallery__modal-footer">
              <button
                type="button"
                className="admin-gallery__cancel"
                onClick={
                  closeForm
                }
                disabled={
                  isSubmitting
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-gallery__confirm-upload"
                disabled={
                  isSubmitting
                }
              >
                {editingItem ? (
                  <Pencil
                    size={17}
                  />
                ) : (
                  <Upload
                    size={17}
                  />
                )}

                {isSubmitting
                  ? editingItem
                    ? "Saving..."
                    : uploadMode ===
                        "VIDEO"
                      ? "Uploading Video..."
                      : "Uploading Images..."
                  : editingItem
                    ? "Save Changes"
                    : uploadMode ===
                        "VIDEO"
                      ? "Upload Video"
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
          onClick={() =>
            setPreviewItem(null)
          }
        >
          <div
            className={`admin-gallery__preview-modal ${
              previewItem.mediaType ===
              "VIDEO"
                ? "admin-gallery__preview-modal--video"
                : ""
            }`}
            role="dialog"
            aria-modal="true"
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                setPreviewItem(
                  null,
                )
              }
              aria-label="Close media preview"
            >
              <X size={21} />
            </button>

            {previewItem.mediaType ===
            "VIDEO" ? (
              <GalleryMedia mediaType="VIDEO" alt={previewItem.altText || previewItem.title}
                src={
                  previewItem.imageUrl
                }
                poster={
                  previewItem.thumbnailUrl ??
                  undefined
                }
                controls
                autoPlay
                muted
                playsInline
              />
            ) : (
              <GalleryMediaImage
                src={
                  previewItem.imageUrl
                }
                alt={
                  previewItem.altText ??
                  previewItem.title
                }
              />
            )}

            <div className="admin-gallery__preview-info">
              <span>
                {previewItem.mediaType} ·{" "}
                {previewItem.event
                  ?.title ??
                  "Waterfall Festival"}
              </span>

              <h2>
                {
                  previewItem.title
                }
              </h2>

              {previewItem.description && (
                <p>
                  {
                    previewItem.description
                  }
                </p>
              )}

              <div className="admin-gallery__preview-tags">
                <span>
                  {formatStatus(
                    previewItem.status,
                  )}
                </span>

                {previewItem.isFeatured && (
                  <span>
                    Featured
                  </span>
                )}

                {previewItem.mediaType ===
                  "VIDEO" &&
                  previewItem.showOnHomepage && (
                    <span>
                      Homepage Reel #
                      {
                        previewItem.homepageSortOrder
                      }
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
      </fieldset>
      <dialog ref={confirmationRef} className="admin-gallery__delete-dialog"
        aria-labelledby="gallery-delete-title" aria-describedby="gallery-delete-description"
        onCancel={event => { if (isBulkDeleting) event.preventDefault(); }}
        onClose={() => deleteSelectedRef.current?.focus()}>
        <form onSubmit={event => { event.preventDefault(); void handleBatchDelete(); }}>
          <div className="admin-gallery__delete-dialog-body">
            <Trash2 size={28} aria-hidden="true" />
            <h2 id="gallery-delete-title">Delete {selectedImageIds.size} selected images?</h2>
            <p id="gallery-delete-description">This includes {hiddenSelectedCount} images hidden by filters. Gallery records will be permanently deleted. Physical file cleanup may remain pending or fail; protected legacy assets may be preserved. This action cannot be undone.</p>
          </div>
          <div className="admin-gallery__selection-actions">
            <button type="button" autoFocus disabled={isBulkDeleting} onClick={() => confirmationRef.current?.close()}>Cancel</button>
            <button type="submit" className="admin-gallery__confirm-delete" disabled={isBulkDeleting || selectedImageIds.size < 1 || selectedImageIds.size > 100 || !apiVerified}>
              {isBulkDeleting ? "Deleting records..." : `Delete ${selectedImageIds.size} images`}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

export default AdminGallery;