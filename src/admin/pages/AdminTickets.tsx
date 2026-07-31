import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Ticket,
  Trash2,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  createTicket,
  getTickets,
} from "../../services/ticket.service";

import type {
  CreateTicketPreviewDto,
  TicketListMeta,
  TicketPreview,
  TicketStatus,
} from "../../services/ticket.service";

import "../style/admin-tickets.css";

type Feedback = {
  type: "success" | "error";
  message: string;
};

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

type TicketFormState = {
  eventId: string;
  name: string;
  slug: string;
  shortDescription: string;
  category: string;
  status: TicketStatus;
  price: string;
  originalPrice: string;
  currency: string;
  availabilityMode: string;
  totalQuantity: string;
  remainingQuantity: string;
  availabilityLabel: string;
  externalPurchaseUrl: string;
  badge: string;
  isFeatured: boolean;
  sortOrder: string;
  benefits: string;
};

const INITIAL_FORM: TicketFormState = {
  eventId: "",
  name: "",
  slug: "",
  shortDescription: "",
  category: "VIP",
  status: "AVAILABLE",
  price: "",
  originalPrice: "",
  currency: "THB",
  availabilityMode: "MANUAL",
  totalQuantity: "",
  remainingQuantity: "",
  availabilityLabel: "",
  externalPurchaseUrl: "",
  badge: "",
  isFeatured: false,
  sortOrder: "0",
  benefits: "",
};

const EMPTY_META: TicketListMeta = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return fallbackMessage;
  }

  const apiError = error as ApiError;
  const responseMessage =
    apiError.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(" ");
  }

  if (typeof responseMessage === "string") {
    return responseMessage;
  }

  if (typeof apiError.message === "string") {
    return apiError.message;
  }

  return fallbackMessage;
}

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeStatus(status: string): string {
  return status
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");
}

function formatStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatPrice(
  price: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price.toLocaleString()} ${currency}`;
  }
}

function formatStock(
  ticket: TicketPreview,
): string {
  if (ticket.remainingQuantity === null) {
    return "Unlimited";
  }

  if (ticket.totalQuantity === null) {
    return ticket.remainingQuantity.toString();
  }

  return `${ticket.remainingQuantity} / ${ticket.totalQuantity}`;
}

function AdminTickets() {
  const [tickets, setTickets] = useState<
    TicketPreview[]
  >([]);

  const [meta, setMeta] =
    useState<TicketListMeta>(EMPTY_META);

  const [searchInput, setSearchInput] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<TicketStatus | "">("");

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const [form, setForm] =
    useState<TicketFormState>(INITIAL_FORM);

  const loadTickets = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setFeedback(null);

      try {
        const response = await getTickets({
          search: searchQuery || undefined,
          status: statusFilter || undefined,
          page,
          limit: 10,
          sortBy: "sortOrder",
          sortDirection: "asc",
        });

        setTickets(response.data);
        setMeta(response.meta);
      } catch (error: unknown) {
        setFeedback({
          type: "error",
          message: getErrorMessage(
            error,
            "Unable to load tickets.",
          ),
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      page,
      searchQuery,
      statusFilter,
    ],
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const stats = useMemo(() => {
    return tickets.reduce(
      (result, ticket) => {
        result.availableStock +=
          ticket.remainingQuantity ?? 0;

        if (
          ticket.status === "SOLD_OUT" ||
          ticket.remainingQuantity === 0
        ) {
          result.soldOut += 1;
        }

        if (ticket.isFeatured) {
          result.featured += 1;
        }

        return result;
      },
      {
        availableStock: 0,
        soldOut: 0,
        featured: 0,
      },
    );
  }, [tickets]);

  function updateFormField<
    Key extends keyof TicketFormState,
  >(
    key: Key,
    value: TicketFormState[Key],
  ): void {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleNameChange(
    value: string,
  ): void {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        current.slug ===
          createSlug(current.name) ||
        current.slug.length === 0
          ? createSlug(value)
          : current.slug,
    }));
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    setPage(1);
    setSearchQuery(searchInput.trim());
  }

  function openCreateModal(): void {
    setForm(INITIAL_FORM);
    setFeedback(null);
    setIsModalOpen(true);
  }

  function closeCreateModal(): void {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setForm(INITIAL_FORM);
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFeedback(null);

    const eventId = Number(form.eventId);
    const price = Number(form.price);

    if (
      !Number.isInteger(eventId) ||
      eventId < 1
    ) {
      setFeedback({
        type: "error",
        message:
          "Enter a valid event ID greater than zero.",
      });

      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setFeedback({
        type: "error",
        message:
          "Enter a valid ticket price.",
      });

      return;
    }

    const benefits = form.benefits
      .split("\n")
      .map((benefit) => benefit.trim())
      .filter(Boolean)
      .map((text, index) => ({
        text,
        sortOrder: index,
      }));

    const payload: CreateTicketPreviewDto = {
      eventId,
      name: form.name.trim(),
      slug: createSlug(form.slug),
      category: form.category.trim(),
      status: form.status,
      price,
      currency: form.currency
        .trim()
        .toUpperCase(),
      availabilityMode:
        form.availabilityMode.trim(),
      isFeatured: form.isFeatured,
      sortOrder:
        Number(form.sortOrder) || 0,
    };

    if (form.shortDescription.trim()) {
      payload.shortDescription =
        form.shortDescription.trim();
    }

    if (form.originalPrice) {
      payload.originalPrice = Number(
        form.originalPrice,
      );
    }

    if (form.totalQuantity) {
      payload.totalQuantity = Number(
        form.totalQuantity,
      );
    }

    if (form.remainingQuantity) {
      payload.remainingQuantity = Number(
        form.remainingQuantity,
      );
    }

    if (form.availabilityLabel.trim()) {
      payload.availabilityLabel =
        form.availabilityLabel.trim();
    }

    if (form.externalPurchaseUrl.trim()) {
      payload.externalPurchaseUrl =
        form.externalPurchaseUrl.trim();
    }

    if (form.badge.trim()) {
      payload.badge =
        form.badge.trim();
    }

    if (benefits.length > 0) {
      payload.benefits = benefits;
    }

    setIsSubmitting(true);

    try {
      await createTicket(payload);

      setIsModalOpen(false);
      setForm(INITIAL_FORM);
      setPage(1);
      setSearchInput("");
      setSearchQuery("");
      setStatusFilter("");

      setFeedback({
        type: "success",
        message:
          "Ticket created successfully.",
      });

      await loadTickets(true);
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "Unable to create the ticket.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-tickets">
      <div className="admin-tickets__header">
        <div>
          <span className="admin-tickets__eyebrow">
            Ticket Management
          </span>

          <h1>Tickets</h1>

          <p>
            Manage ticket previews, pricing,
            availability and Eventpop purchase
            links.
          </p>
        </div>

        <button
          type="button"
          className="admin-tickets__add"
          onClick={openCreateModal}
        >
          <Plus
            size={17}
            aria-hidden="true"
          />
          Add ticket
        </button>
      </div>

      {feedback ? (
        <div
          className={`admin-tickets__feedback admin-tickets__feedback--${feedback.type}`}
          role={
            feedback.type === "error"
              ? "alert"
              : "status"
          }
        >
          {feedback.type === "success" ? (
            <CheckCircle2
              size={18}
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              size={18}
              aria-hidden="true"
            />
          )}

          <span>{feedback.message}</span>
        </div>
      ) : null}

      <div className="admin-tickets__stats">
        <article className="admin-tickets__stat-card">
          <span>Total tickets</span>
          <strong>{meta.totalItems}</strong>
          <small>
            All matching ticket types
          </small>
        </article>

        <article className="admin-tickets__stat-card">
          <span>Available stock</span>
          <strong>
            {stats.availableStock}
          </strong>
          <small>
            Across the current page
          </small>
        </article>

        <article className="admin-tickets__stat-card">
          <span>Sold out</span>
          <strong>{stats.soldOut}</strong>
          <small>
            On the current page
          </small>
        </article>

        <article className="admin-tickets__stat-card">
          <span>Featured</span>
          <strong>{stats.featured}</strong>
          <small>
            On the current page
          </small>
        </article>
      </div>

      <div className="admin-tickets__toolbar">
        <form
          className="admin-tickets__search"
          onSubmit={handleSearchSubmit}
        >
          <Search
            size={17}
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value,
              )
            }
            placeholder="Search tickets..."
            aria-label="Search tickets"
          />
        </form>

        <div className="admin-tickets__filters">
          <label>
            <span className="sr-only">
              Filter by status
            </span>

            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1);

                setStatusFilter(
                  event.target
                    .value as TicketStatus | "",
                );
              }}
            >
              <option value="">
                All statuses
              </option>

              <option value="AVAILABLE">
                Available
              </option>

              <option value="LIMITED">
                Limited
              </option>

              <option value="SOLD_OUT">
                Sold out
              </option>
            </select>
          </label>

          <button
            type="button"
            className="admin-tickets__refresh"
            onClick={() =>
              void loadTickets(true)
            }
            disabled={isRefreshing}
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing
                  ? "admin-tickets__spin"
                  : undefined
              }
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="admin-tickets__table-card">
        <div className="admin-tickets__table-header">
          <div>
            <h2>Ticket list</h2>

            <p>
              Ticket previews displayed on the
              public festival website.
            </p>
          </div>

          <span>
            {meta.totalItems}{" "}
            {meta.totalItems === 1
              ? "ticket"
              : "tickets"}
          </span>
        </div>

        {isLoading ? (
          <div className="admin-tickets__state">
            <LoaderCircle
              size={28}
              className="admin-tickets__spin"
              aria-hidden="true"
            />

            <strong>
              Loading tickets
            </strong>

            <p>
              Retrieving ticket information
              from the backend.
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="admin-tickets__state">
            <Ticket
              size={30}
              aria-hidden="true"
            />

            <strong>
              No tickets found
            </strong>

            <p>
              Add a ticket or change your
              current filters.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
            >
              <Plus
                size={16}
                aria-hidden="true"
              />
              Add ticket
            </button>
          </div>
        ) : (
          <>
            <div className="admin-tickets__table-wrap">
              <table className="admin-tickets__table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Event</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>

                    <th className="admin-tickets__actions-title">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="admin-tickets__ticket-name">
                          <div className="admin-tickets__ticket-icon">
                            <Ticket
                              size={17}
                              aria-hidden="true"
                            />
                          </div>

                          <div>
                            <strong>
                              {ticket.name}
                            </strong>

                            <span>
                              {ticket.category}
                            </span>
                          </div>

                          {ticket.isFeatured ? (
                            <Star
                              size={15}
                              className="admin-tickets__featured"
                              aria-label="Featured ticket"
                            />
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <div className="admin-tickets__event">
                          <strong>
                            {ticket.event.title}
                          </strong>

                          <span>
                            {ticket.event
                              .location ||
                              "Location unavailable"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-tickets__price">
                          <strong>
                            {formatPrice(
                              ticket.price,
                              ticket.currency,
                            )}
                          </strong>

                          {ticket.originalPrice !==
                          null ? (
                            <span>
                              {formatPrice(
                                ticket.originalPrice,
                                ticket.currency,
                              )}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <span className="admin-tickets__stock">
                          {formatStock(ticket)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-tickets__status admin-tickets__status--${normalizeStatus(
                            ticket.status,
                          )}`}
                        >
                          {formatStatus(
                            ticket.status,
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="admin-tickets__actions">
                          {ticket.externalPurchaseUrl ? (
                            <a
                              className="admin-tickets__icon-btn"
                              href={
                                ticket.externalPurchaseUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open purchase page for ${ticket.name}`}
                              title="Open purchase page"
                            >
                              <ExternalLink
                                size={15}
                                aria-hidden="true"
                              />
                            </a>
                          ) : null}

                          <button
                            type="button"
                            className="admin-tickets__icon-btn"
                            disabled
                            aria-label={`Edit ${ticket.name}`}
                            title="Backend update endpoint not added yet"
                          >
                            <Pencil
                              size={15}
                              aria-hidden="true"
                            />
                          </button>

                          <button
                            type="button"
                            className="admin-tickets__icon-btn admin-tickets__icon-btn--danger"
                            disabled
                            aria-label={`Delete ${ticket.name}`}
                            title="Backend delete endpoint not added yet"
                          >
                            <Trash2
                              size={15}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-tickets__pagination">
              <span>
                Page {meta.page} of{" "}
                {Math.max(
                  meta.totalPages,
                  1,
                )}
              </span>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1,
                      ),
                    )
                  }
                  disabled={
                    !meta.hasPreviousPage
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    size={16}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  disabled={
                    !meta.hasNextPage
                  }
                  aria-label="Next page"
                >
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen ? (
        <div
          className="admin-tickets__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal();
            }
          }}
        >
          <section
            className="admin-tickets__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-ticket-title"
          >
            <div className="admin-tickets__modal-header">
              <div>
                <span>
                  Create ticket
                </span>

                <h2 id="create-ticket-title">
                  Add a ticket preview
                </h2>

                <p>
                  The purchase button will
                  redirect visitors to
                  Eventpop.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={isSubmitting}
                aria-label="Close modal"
              >
                <X
                  size={19}
                  aria-hidden="true"
                />
              </button>
            </div>

            <form
              className="admin-tickets__form"
              onSubmit={handleCreate}
            >
              <div className="admin-tickets__form-grid">
                <label>
                  <span>Ticket name</span>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value,
                      )
                    }
                    placeholder="VIP Weekend Pass"
                  />
                </label>

                <label>
                  <span>Slug</span>

                  <input
                    required
                    value={form.slug}
                    onChange={(event) =>
                      updateFormField(
                        "slug",
                        createSlug(
                          event.target.value,
                        ),
                      )
                    }
                    placeholder="vip-weekend-pass"
                  />
                </label>

                <label>
                  <span>Event ID</span>

                  <input
                    required
                    type="number"
                    min="1"
                    value={form.eventId}
                    onChange={(event) =>
                      updateFormField(
                        "eventId",
                        event.target.value,
                      )
                    }
                    placeholder="1"
                  />
                </label>

                <label>
                  <span>Category enum</span>

                  <input
                    required
                    value={form.category}
                    onChange={(event) =>
                      updateFormField(
                        "category",
                        event.target.value
                          .trimStart()
                          .toUpperCase(),
                      )
                    }
                    placeholder="VIP"
                  />
                </label>

                <label>
                  <span>Status</span>

                  <select
                    required
                    value={form.status}
                    onChange={(event) =>
                      updateFormField(
                        "status",
                        event.target
                          .value as TicketStatus,
                      )
                    }
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="SCHEDULED">
                      Scheduled
                    </option>

                    <option value="AVAILABLE">
                      Available
                    </option>

                    <option value="LIMITED">
                      Limited
                    </option>

                    <option value="SOLD_OUT">
                      Sold out
                    </option>

                    <option value="EXPIRED">
                      Expired
                    </option>

                    <option value="HIDDEN">
                      Hidden
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Availability mode enum
                  </span>

                  <input
                    required
                    value={
                      form.availabilityMode
                    }
                    onChange={(event) =>
                      updateFormField(
                        "availabilityMode",
                        event.target.value
                          .trimStart()
                          .toUpperCase(),
                      )
                    }
                    placeholder="MANUAL"
                  />
                </label>

                <label>
                  <span>Price</span>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateFormField(
                        "price",
                        event.target.value,
                      )
                    }
                    placeholder="4500"
                  />
                </label>

                <label>
                  <span>
                    Original price
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.originalPrice
                    }
                    onChange={(event) =>
                      updateFormField(
                        "originalPrice",
                        event.target.value,
                      )
                    }
                    placeholder="5000"
                  />
                </label>

                <label>
                  <span>Currency</span>

                  <input
                    required
                    maxLength={3}
                    value={form.currency}
                    onChange={(event) =>
                      updateFormField(
                        "currency",
                        event.target.value
                          .toUpperCase(),
                      )
                    }
                    placeholder="THB"
                  />
                </label>

                <label>
                  <span>
                    Total quantity
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.totalQuantity
                    }
                    onChange={(event) =>
                      updateFormField(
                        "totalQuantity",
                        event.target.value,
                      )
                    }
                    placeholder="300"
                  />
                </label>

                <label>
                  <span>
                    Remaining quantity
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.remainingQuantity
                    }
                    onChange={(event) =>
                      updateFormField(
                        "remainingQuantity",
                        event.target.value,
                      )
                    }
                    placeholder="300"
                  />
                </label>

                <label>
                  <span>Sort order</span>

                  <input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(event) =>
                      updateFormField(
                        "sortOrder",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label className="admin-tickets__field--wide">
                  <span>
                    Short description
                  </span>

                  <textarea
                    rows={3}
                    value={
                      form.shortDescription
                    }
                    onChange={(event) =>
                      updateFormField(
                        "shortDescription",
                        event.target.value,
                      )
                    }
                    placeholder="Premium access for the full weekend."
                  />
                </label>

                <label>
                  <span>
                    Availability label
                  </span>

                  <input
                    value={
                      form.availabilityLabel
                    }
                    onChange={(event) =>
                      updateFormField(
                        "availabilityLabel",
                        event.target.value,
                      )
                    }
                    placeholder="Selling fast"
                  />
                </label>

                <label>
                  <span>Badge</span>

                  <input
                    value={form.badge}
                    onChange={(event) =>
                      updateFormField(
                        "badge",
                        event.target.value,
                      )
                    }
                    placeholder="Best seller"
                  />
                </label>

                <label className="admin-tickets__field--wide">
                  <span>
                    Eventpop purchase URL
                  </span>

                  <input
                    type="url"
                    value={
                      form.externalPurchaseUrl
                    }
                    onChange={(event) =>
                      updateFormField(
                        "externalPurchaseUrl",
                        event.target.value,
                      )
                    }
                    placeholder="https://www.eventpop.me/..."
                  />
                </label>

                <label className="admin-tickets__field--wide">
                  <span>
                    Benefits, one per line
                  </span>

                  <textarea
                    rows={5}
                    value={form.benefits}
                    onChange={(event) =>
                      updateFormField(
                        "benefits",
                        event.target.value,
                      )
                    }
                    placeholder={
                      "Priority festival entry\nVIP lounge access\nComplimentary drinks"
                    }
                  />
                </label>

                <label className="admin-tickets__checkbox admin-tickets__field--wide">
                  <input
                    type="checkbox"
                    checked={
                      form.isFeatured
                    }
                    onChange={(event) =>
                      updateFormField(
                        "isFeatured",
                        event.target.checked,
                      )
                    }
                  />

                  <span>
                    Feature this ticket on the
                    public website
                  </span>
                </label>
              </div>

              <div className="admin-tickets__modal-actions">
                <button
                  type="button"
                  className="admin-tickets__cancel"
                  onClick={closeCreateModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-tickets__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle
                      size={17}
                      className="admin-tickets__spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Plus
                      size={17}
                      aria-hidden="true"
                    />
                  )}

                  {isSubmitting
                    ? "Creating..."
                    : "Create ticket"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default AdminTickets;