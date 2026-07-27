import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileQuestion,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { faqService } from "../../services/faq.service";
import type {
  CreateFaqInput,
  Faq,
  FaqStatus,
  UpdateFaqInput,
} from "../../types/faq";

import "../style/admin-faq.css";

type StatusFilter = "ALL" | FaqStatus;
type SortOption =
  | "SORT_ORDER"
  | "QUESTION_ASC"
  | "QUESTION_DESC"
  | "STATUS";

type FaqFormData = {
  question: string;
  answer: string;
  category: string;
  status: FaqStatus;
  sortOrder: string;
};

const emptyForm: FaqFormData = {
  question: "",
  answer: "",
  category: "General",
  status: "DRAFT",
  sortOrder: "0",
};

const statusLabels: Record<FaqStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const statusFilters: Array<{
  label: string;
  value: StatusFilter;
}> = [
  { label: "All statuses", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

const sortOptions: Array<{
  label: string;
  value: SortOption;
}> = [
  { label: "Sort order", value: "SORT_ORDER" },
  { label: "Question A–Z", value: "QUESTION_ASC" },
  { label: "Question Z–A", value: "QUESTION_DESC" },
  { label: "Status", value: "STATUS" },
];

function AdminFAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");
  const [sortOption, setSortOption] =
    useState<SortOption>("SORT_ORDER");

  const [selectedFaqId, setSelectedFaqId] =
    useState<number | null>(null);
  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  const [editingFaqId, setEditingFaqId] =
    useState<number | null>(null);
  const [formData, setFormData] =
    useState<FaqFormData>(emptyForm);

  const [faqToDelete, setFaqToDelete] =
    useState<Faq | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSaving, setIsSaving] =
    useState(false);
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  const [pageError, setPageError] =
    useState<string | null>(null);
  const [formError, setFormError] =
    useState<string | null>(null);
  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  async function loadFaqs(): Promise<void> {
    try {
      setIsLoading(true);
      setPageError(null);

      const data = await faqService.getAll();
      setFaqs(data);

      setSelectedFaqId((currentId) => {
        if (
          currentId !== null &&
          data.some((faq) => faq.id === currentId)
        ) {
          return currentId;
        }

        return data[0]?.id ?? null;
      });
    } catch (loadError) {
      setPageError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load FAQs.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadFaqs();
  }, []);

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent): void {
      if (event.key !== "Escape") {
        return;
      }

      setOpenMenuId(null);

      if (!isSaving) {
        setIsModalOpen(false);
        setEditingFaqId(null);
        setFormData(emptyForm);
        setFormError(null);
      }

      if (!isDeleting) {
        setFaqToDelete(null);
        setDeleteError(null);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [isDeleting, isSaving]);

  const counts = useMemo(
    () => ({
      ALL: faqs.length,
      PUBLISHED: faqs.filter(
        (faq) => faq.status === "PUBLISHED",
      ).length,
      DRAFT: faqs.filter(
        (faq) => faq.status === "DRAFT",
      ).length,
      ARCHIVED: faqs.filter(
        (faq) => faq.status === "ARCHIVED",
      ).length,
    }),
    [faqs],
  );

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      faqs
        .map((faq) => faq.category?.trim())
        .filter(
          (category): category is string =>
            Boolean(category),
        ),
    );

    return Array.from(uniqueCategories).sort(
      (firstCategory, secondCategory) =>
        firstCategory.localeCompare(secondCategory),
    );
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    const matchingFaqs = faqs.filter((faq) => {
      const category = faq.category || "General";

      const matchesSearch =
        !normalizedSearch ||
        faq.question
          .toLowerCase()
          .includes(normalizedSearch) ||
        faq.answer
          .toLowerCase()
          .includes(normalizedSearch) ||
        category
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        faq.status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

    return [...matchingFaqs].sort(
      (firstFaq, secondFaq) => {
        if (sortOption === "QUESTION_ASC") {
          return firstFaq.question.localeCompare(
            secondFaq.question,
          );
        }

        if (sortOption === "QUESTION_DESC") {
          return secondFaq.question.localeCompare(
            firstFaq.question,
          );
        }

        if (sortOption === "STATUS") {
          return firstFaq.status.localeCompare(
            secondFaq.status,
          );
        }

        return firstFaq.sortOrder - secondFaq.sortOrder;
      },
    );
  }, [
    categoryFilter,
    faqs,
    searchTerm,
    sortOption,
    statusFilter,
  ]);

  const selectedFaq = useMemo(
    () =>
      faqs.find(
        (faq) => faq.id === selectedFaqId,
      ) ?? null,
    [faqs, selectedFaqId],
  );

  useEffect(() => {
    if (
      selectedFaqId !== null &&
      !filteredFaqs.some(
        (faq) => faq.id === selectedFaqId,
      )
    ) {
      setSelectedFaqId(filteredFaqs[0]?.id ?? null);
    }
  }, [filteredFaqs, selectedFaqId]);

  function resetForm(): void {
    setEditingFaqId(null);
    setFormData(emptyForm);
    setFormError(null);
  }

  function openCreateModal(): void {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(faq: Faq): void {
    setEditingFaqId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? "General",
      status: faq.status,
      sortOrder: String(faq.sortOrder),
    });
    setFormError(null);
    setOpenMenuId(null);
    setIsModalOpen(true);
  }

  function closeModal(): void {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    resetForm();
  }

  function openDeleteModal(faq: Faq): void {
    setFaqToDelete(faq);
    setDeleteError(null);
    setOpenMenuId(null);
  }

  function closeDeleteModal(): void {
    if (isDeleting) {
      return;
    }

    setFaqToDelete(null);
    setDeleteError(null);
  }

  function clearFilters(): void {
    setSearchTerm("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSortOption("SORT_ORDER");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const question = formData.question.trim();
    const answer = formData.answer.trim();
    const category = formData.category.trim();
    const sortOrder = Number(formData.sortOrder);

    if (!question || !answer) {
      setFormError(
        "Question and answer are required.",
      );
      return;
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setFormError(
        "Sort order must be a non-negative integer.",
      );
      return;
    }

    const data: CreateFaqInput = {
      question,
      answer,
      category: category || undefined,
      status: formData.status,
      sortOrder,
    };

    try {
      setIsSaving(true);
      setFormError(null);

      if (editingFaqId !== null) {
        const updatedFaq = await faqService.update(
          editingFaqId,
          data,
        );

        setFaqs((currentFaqs) =>
          currentFaqs.map((faq) =>
            faq.id === updatedFaq.id
              ? updatedFaq
              : faq,
          ),
        );

        setSelectedFaqId(updatedFaq.id);
      } else {
        const createdFaq =
          await faqService.create(data);

        setFaqs((currentFaqs) => [
          createdFaq,
          ...currentFaqs,
        ]);

        setSelectedFaqId(createdFaq.id);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the FAQ.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!faqToDelete || isDeleting) {
      return;
    }

    const faqId = faqToDelete.id;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await faqService.remove(faqId);

      setFaqs((currentFaqs) =>
        currentFaqs.filter(
          (faq) => faq.id !== faqId,
        ),
      );

      if (selectedFaqId === faqId) {
        setSelectedFaqId(null);
      }

      setFaqToDelete(null);
    } catch (deleteFaqError) {
      setDeleteError(
        deleteFaqError instanceof Error
          ? deleteFaqError.message
          : "Could not delete the FAQ.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function toggleStatus(faq: Faq): Promise<void> {
    const nextStatus: FaqStatus =
      faq.status === "PUBLISHED"
        ? "DRAFT"
        : "PUBLISHED";

    const data: UpdateFaqInput = {
      status: nextStatus,
    };

    try {
      setUpdatingStatusId(faq.id);
      setPageError(null);

      const updatedFaq = await faqService.update(
        faq.id,
        data,
      );

      setFaqs((currentFaqs) =>
        currentFaqs.map((currentFaq) =>
          currentFaq.id === updatedFaq.id
            ? updatedFaq
            : currentFaq,
        ),
      );
    } catch (statusError) {
      setPageError(
        statusError instanceof Error
          ? statusError.message
          : "Could not update the FAQ status.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function duplicateFaq(faq: Faq): Promise<void> {
    const data: CreateFaqInput = {
      question: `${faq.question} (Copy)`,
      answer: faq.answer,
      category: faq.category ?? undefined,
      status: "DRAFT",
      sortOrder: faq.sortOrder + 1,
    };

    try {
      setPageError(null);

      const createdFaq =
        await faqService.create(data);

      setFaqs((currentFaqs) => [
        createdFaq,
        ...currentFaqs,
      ]);

      setSelectedFaqId(createdFaq.id);
      setOpenMenuId(null);
    } catch (duplicateError) {
      setPageError(
        duplicateError instanceof Error
          ? duplicateError.message
          : "Could not duplicate the FAQ.",
      );
    }
  }

  return (
    <section className="admin-faq">
      <header className="admin-faq__header">
        <div className="admin-faq__heading">
          <span className="admin-faq__eyebrow">
            <CircleHelp size={15} />
            FAQ management
          </span>

          <p>
            Manage questions and answers shown on
            the public website.
          </p>
        </div>

        <button
          type="button"
          className="admin-faq__add-button"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Add FAQ
        </button>
      </header>

      <div className="admin-faq__stats">
        <article className="admin-faq__stat-card">
          <div className="admin-faq__stat-icon">
            <CircleHelp size={18} />
          </div>

          <div>
            <span>Total FAQs</span>
            <strong>{counts.ALL}</strong>
            <small>All questions</small>
          </div>
        </article>

        <article className="admin-faq__stat-card admin-faq__stat-card--success">
          <div className="admin-faq__stat-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Published</span>
            <strong>{counts.PUBLISHED}</strong>
            <small>Visible on website</small>
          </div>
        </article>

        <article className="admin-faq__stat-card admin-faq__stat-card--warning">
          <div className="admin-faq__stat-icon">
            <FileQuestion size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>{counts.DRAFT}</strong>
            <small>Not published</small>
          </div>
        </article>

        <article className="admin-faq__stat-card admin-faq__stat-card--muted">
          <div className="admin-faq__stat-icon">
            <Archive size={18} />
          </div>

          <div>
            <span>Archived</span>
            <strong>{counts.ARCHIVED}</strong>
            <small>Hidden from use</small>
          </div>
        </article>
      </div>

      {pageError && (
        <div
          className="admin-faq__message admin-faq__message--error"
          role="alert"
        >
          <AlertCircle size={16} />
          <span>{pageError}</span>

          <button
            type="button"
            onClick={() => setPageError(null)}
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="admin-faq__workspace">
        <main className="admin-faq__content">
          <div className="admin-faq__toolbar">
            <div className="admin-faq__search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search FAQs..."
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
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              aria-label="Filter by category"
            >
              <option value="ALL">All categories</option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter,
                )
              }
              aria-label="Filter by status"
            >
              {statusFilters.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target.value as SortOption,
                )
              }
              aria-label="Sort FAQs"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="admin-faq__clear-button"
              onClick={clearFilters}
            >
              <RefreshCw size={15} />
              Clear
            </button>
          </div>

          <div className="admin-faq__table-header">
            <div>
              <h2>Questions</h2>
              <p>
                Showing {filteredFaqs.length} of{" "}
                {faqs.length} FAQs
              </p>
            </div>

            <span>{filteredFaqs.length} results</span>
          </div>

          {isLoading ? (
            <div className="admin-faq__state">
              <LoaderCircle
                size={28}
                className="admin-faq__loading-icon"
              />

              <h3>Loading FAQs</h3>

              <p>
                Retrieving FAQ content from the server.
              </p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="admin-faq__state">
              <div className="admin-faq__state-icon">
                <CircleHelp size={25} />
              </div>

              <h3>No FAQs found</h3>

              <p>
                Adjust your filters or create a new
                question.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
              >
                <Plus size={15} />
                Add FAQ
              </button>
            </div>
          ) : (
            <div className="admin-faq__table-wrapper">
              <table className="admin-faq__table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Order</th>
                    <th aria-label="FAQ actions" />
                  </tr>
                </thead>

                <tbody>
                  {filteredFaqs.map((faq) => (
                    <tr
                      key={faq.id}
                      className={
                        selectedFaqId === faq.id
                          ? "admin-faq__row admin-faq__row--selected"
                          : "admin-faq__row"
                      }
                      onClick={() =>
                        setSelectedFaqId(faq.id)
                      }
                    >
                      <td data-label="Question">
                        <div className="admin-faq__question">
                          <button
                            type="button"
                            className="admin-faq__row-selector"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedFaqId(faq.id);
                            }}
                            aria-label={`Open details for ${faq.question}`}
                          >
                            <ChevronRight size={16} />
                          </button>

                          <div>
                            <strong>
                              {faq.question}
                            </strong>

                            <p>{faq.answer}</p>
                          </div>
                        </div>
                      </td>

                      <td data-label="Category">
                        <span className="admin-faq__category">
                          {faq.category || "General"}
                        </span>
                      </td>

                      <td data-label="Status">
                        <button
                          type="button"
                          className={`admin-faq__status admin-faq__status--${faq.status.toLowerCase()}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void toggleStatus(faq);
                          }}
                          disabled={
                            updatingStatusId === faq.id
                          }
                          title={
                            faq.status === "PUBLISHED"
                              ? "Move to draft"
                              : "Publish FAQ"
                          }
                        >
                          {updatingStatusId === faq.id ? (
                            <LoaderCircle
                              size={12}
                              className="admin-faq__loading-icon"
                            />
                          ) : (
                            <span />
                          )}

                          {statusLabels[faq.status]}
                        </button>
                      </td>

                      <td data-label="Order">
                        <span className="admin-faq__sort-order">
                          {faq.sortOrder}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <div className="admin-faq__actions">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedFaqId(faq.id);
                            }}
                            aria-label={`View ${faq.question}`}
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditModal(faq);
                            }}
                            aria-label={`Edit ${faq.question}`}
                            title="Edit FAQ"
                          >
                            <Edit3 size={16} />
                          </button>

                          <div className="admin-faq__more-wrapper">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuId(
                                  (currentId) =>
                                    currentId === faq.id
                                      ? null
                                      : faq.id,
                                );
                              }}
                              aria-label={`More actions for ${faq.question}`}
                              aria-expanded={
                                openMenuId === faq.id
                              }
                              title="More actions"
                            >
                              <MoreHorizontal size={17} />
                            </button>

                            {openMenuId === faq.id && (
                              <div
                                className="admin-faq__action-menu"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(faq)
                                  }
                                >
                                  <Edit3 size={15} />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void duplicateFaq(faq)
                                  }
                                >
                                  <Copy size={15} />
                                  Duplicate
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void toggleStatus(faq)
                                  }
                                >
                                  {faq.status ===
                                  "PUBLISHED" ? (
                                    <EyeOff size={15} />
                                  ) : (
                                    <Eye size={15} />
                                  )}

                                  {faq.status ===
                                  "PUBLISHED"
                                    ? "Move to draft"
                                    : "Publish"}
                                </button>

                                <button
                                  type="button"
                                  className="admin-faq__delete-menu-button"
                                  onClick={() =>
                                    openDeleteModal(faq)
                                  }
                                >
                                  <Trash2 size={15} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        <aside className="admin-faq__details-panel">
          {selectedFaq ? (
            <>
              <div className="admin-faq__details-header">
                <div>
                  <span>FAQ details</span>
                  <h2>{selectedFaq.question}</h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedFaqId(null)
                  }
                  aria-label="Close FAQ details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-faq__details-body">
                <section>
                  <span>Answer</span>
                  <p>{selectedFaq.answer}</p>
                </section>

                <dl>
                  <div>
                    <dt>Category</dt>
                    <dd>
                      <span className="admin-faq__category">
                        {selectedFaq.category ||
                          "General"}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span
                        className={`admin-faq__status admin-faq__status--${selectedFaq.status.toLowerCase()}`}
                      >
                        <span />
                        {
                          statusLabels[
                            selectedFaq.status
                          ]
                        }
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt>Sort order</dt>
                    <dd>{selectedFaq.sortOrder}</dd>
                  </div>
                </dl>
              </div>

              <div className="admin-faq__details-actions">
                <button
                  type="button"
                  onClick={() =>
                    openEditModal(selectedFaq)
                  }
                >
                  <Edit3 size={16} />
                  Edit FAQ
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void duplicateFaq(selectedFaq)
                  }
                >
                  <Copy size={16} />
                  Duplicate FAQ
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void toggleStatus(selectedFaq)
                  }
                  disabled={
                    updatingStatusId === selectedFaq.id
                  }
                >
                  {selectedFaq.status ===
                  "PUBLISHED" ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                  {selectedFaq.status === "PUBLISHED"
                    ? "Move to Draft"
                    : "Publish FAQ"}
                </button>

                <button
                  type="button"
                  className="admin-faq__details-delete"
                  onClick={() =>
                    openDeleteModal(selectedFaq)
                  }
                >
                  <Trash2 size={16} />
                  Delete FAQ
                </button>
              </div>
            </>
          ) : (
            <div className="admin-faq__details-empty">
              <CircleHelp size={25} />
              <h2>Select an FAQ</h2>
              <p>
                Choose a question to review its full
                answer and management options.
              </p>
            </div>
          )}
        </aside>
      </div>

      {isModalOpen && (
        <div
          className="admin-faq__modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className="admin-faq__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-editor-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-faq__modal-header">
              <div>
                <span>FAQ editor</span>

                <h2 id="faq-editor-title">
                  {editingFaqId === null
                    ? "Create FAQ"
                    : "Edit FAQ"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                disabled={isSaving}
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="admin-faq__form"
              onSubmit={(event) =>
                void handleSubmit(event)
              }
            >
              {formError && (
                <div
                  className="admin-faq__message admin-faq__message--error"
                  role="alert"
                >
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <label>
                <span>Question</span>

                <input
                  type="text"
                  value={formData.question}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      question: event.target.value,
                    }))
                  }
                  placeholder="Enter the customer question"
                  required
                />
              </label>

              <label>
                <span>Answer</span>

                <textarea
                  value={formData.answer}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      answer: event.target.value,
                    }))
                  }
                  placeholder="Write a clear and helpful answer"
                  required
                />

                <small>
                  {formData.answer.length} characters
                </small>
              </label>

              <div className="admin-faq__form-grid">
                <label>
                  <span>Category</span>

                  <input
                    type="text"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        category:
                          event.target.value,
                      }))
                    }
                    placeholder="General"
                  />
                </label>

                <label>
                  <span>Status</span>

                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        status: event.target
                          .value as FaqStatus,
                      }))
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
              </div>

              <label>
                <span>Sort order</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.sortOrder}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      sortOrder:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <div className="admin-faq__form-actions">
                <button
                  type="button"
                  className="admin-faq__cancel-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-faq__save-button"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle
                        size={15}
                        className="admin-faq__loading-icon"
                      />
                      Saving...
                    </>
                  ) : editingFaqId === null ? (
                    <>
                      <Plus size={15} />
                      Create FAQ
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {faqToDelete && (
        <div
          className="admin-faq__modal-backdrop"
          role="presentation"
          onMouseDown={closeDeleteModal}
        >
          <div
            className="admin-faq__delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-faq-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-faq__delete-close"
              onClick={closeDeleteModal}
              aria-label="Close delete confirmation"
              disabled={isDeleting}
            >
              <X size={18} />
            </button>

            <div className="admin-faq__delete-icon">
              <Trash2 size={22} />
            </div>

            <h2 id="delete-faq-title">
              Delete this FAQ?
            </h2>

            <p>
              You are about to delete{" "}
              <strong>{faqToDelete.question}</strong>.
              This action cannot be undone.
            </p>

            {deleteError && (
              <div
                className="admin-faq__message admin-faq__message--error"
                role="alert"
              >
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="admin-faq__delete-actions">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-faq__confirm-delete"
                onClick={() =>
                  void handleDelete()
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="admin-faq__loading-icon"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete FAQ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminFAQ;