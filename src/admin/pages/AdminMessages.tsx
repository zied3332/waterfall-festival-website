import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Archive,
  CalendarDays,
  Eye,
  Inbox,
  LoaderCircle,
  MailCheck,
  Phone,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteAdminMessage,
  getAdminMessage,
  getAdminMessages,
  updateAdminMessage,
  type AdminContactMessage,
} from "../../services/contact.service";

import "../style/admin-messages.css";

type MessageStatus =
  | "ALL"
  | "NEW"
  | "READ"
  | "REPLIED"
  | "ARCHIVED";

type Feedback = {
  type: "success" | "error";
  message: string;
};

const dateFormatter = new Intl.DateTimeFormat(
  "en-GB",
  {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
);

const dateTimeFormatter =
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function formatMessageDate(date: string) {
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "Invalid date"
    : dateFormatter.format(parsedDate);
}

function formatMessageDateTime(date: string) {
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "Invalid date"
    : dateTimeFormatter.format(parsedDate);
}

function formatLabel(value?: string) {
  if (!value?.trim()) {
    return "Not specified";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getStatusClass(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, "-");
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred.",
) {
  if (isRecord(error)) {
    const response = error.response;

    if (isRecord(response)) {
      const data = response.data;

      if (isRecord(data)) {
        const message = data.message;

        if (typeof message === "string") {
          return message;
        }

        if (Array.isArray(message)) {
          const messages = message.filter(
            (item): item is string =>
              typeof item === "string",
          );

          if (messages.length > 0) {
            return messages.join(" ");
          }
        }
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function AdminMessages() {
  const navigate = useNavigate();
  const { messageId } = useParams<{
    messageId?: string;
  }>();

  const [messages, setMessages] = useState<
    AdminContactMessage[]
  >([]);
  const [totalMessages, setTotalMessages] =
    useState(0);

  const [selectedMessage, setSelectedMessage] =
    useState<AdminContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] =
    useState<AdminContactMessage | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState<MessageStatus>("ALL");

  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [isPreviewLoading, setIsPreviewLoading] =
    useState(false);
  const [updatingMessageId, setUpdatingMessageId] =
    useState<number | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] =
    useState(false);

  const [pageError, setPageError] =
    useState<string | null>(null);
  const [previewError, setPreviewError] =
    useState<string | null>(null);
  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const previewRequestIdRef = useRef(0);

  const updateMessageInState = useCallback(
    (updatedMessage: AdminContactMessage) => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === updatedMessage.id
            ? updatedMessage
            : message,
        ),
      );

      setSelectedMessage((currentMessage) =>
        currentMessage?.id === updatedMessage.id
          ? updatedMessage
          : currentMessage,
      );
    },
    [],
  );

  const loadMessages = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setPageError(null);

        const response =
          await getAdminMessages();

        setMessages(response.data);
        setTotalMessages(
          response.pagination.total,
        );
      } catch (error: unknown) {
        setPageError(
          getErrorMessage(
            error,
            "Messages could not be loaded.",
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  const markMessageAsRead = useCallback(
    async (
      message: AdminContactMessage,
    ): Promise<AdminContactMessage> => {
      if (message.status !== "NEW") {
        return message;
      }

      const updatedMessage =
        await updateAdminMessage(message.id, {
          status: "READ",
        });

      updateMessageInState(updatedMessage);

      return updatedMessage;
    },
    [updateMessageInState],
  );

  const openMessage = useCallback(
    async (id: number) => {
      const requestId =
        previewRequestIdRef.current + 1;

      previewRequestIdRef.current = requestId;

      try {
        setIsPreviewLoading(true);
        setPreviewError(null);

        const contactMessage =
          await getAdminMessage(id);

        const messageToDisplay =
          await markMessageAsRead(contactMessage);

        if (
          previewRequestIdRef.current !== requestId
        ) {
          return;
        }

        setSelectedMessage(messageToDisplay);
      } catch (error: unknown) {
        if (
          previewRequestIdRef.current !== requestId
        ) {
          return;
        }

        setSelectedMessage(null);
        setPreviewError(
          getErrorMessage(
            error,
            "The message could not be opened.",
          ),
        );
      } finally {
        if (
          previewRequestIdRef.current === requestId
        ) {
          setIsPreviewLoading(false);
        }
      }
    },
    [markMessageAsRead],
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!messageId) {
      previewRequestIdRef.current += 1;
      setSelectedMessage(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    const parsedMessageId = Number(messageId);

    if (
      !Number.isInteger(parsedMessageId) ||
      parsedMessageId <= 0
    ) {
      setSelectedMessage(null);
      setPreviewError(
        "The message ID in the URL is invalid.",
      );
      return;
    }

    void openMessage(parsedMessageId);
  }, [messageId, openMessage]);

  useEffect(() => {
    if (!messageToDelete) {
      return;
    }

    function handleEscapeKey(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isDeletingMessage
      ) {
        setMessageToDelete(null);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [
    isDeletingMessage,
    messageToDelete,
  ]);

  const statistics = useMemo(
    () => ({
      total: totalMessages,
      new: messages.filter(
        (message) =>
          message.status === "NEW",
      ).length,
      read: messages.filter(
        (message) =>
          message.status === "READ",
      ).length,
      replied: messages.filter(
        (message) =>
          message.status === "REPLIED",
      ).length,
    }),
    [messages, totalMessages],
  );

  const filteredMessages = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        message.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        message.name,
        message.email,
        message.subject ?? "",
        message.message,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [
    messages,
    searchQuery,
    statusFilter,
  ]);

  function handleViewMessage(
    message: AdminContactMessage,
  ) {
    navigate(
      `/admin/messages/${message.id}`,
    );
  }

  function handleClosePreview() {
    navigate("/admin/messages");
  }

  async function handleMarkAsRead(
    message: AdminContactMessage,
  ) {
    if (
      message.status !== "NEW" ||
      updatingMessageId !== null
    ) {
      return;
    }

    try {
      setUpdatingMessageId(message.id);
      setFeedback(null);

      const updatedMessage =
        await updateAdminMessage(message.id, {
          status: "READ",
        });

      updateMessageInState(updatedMessage);
      setFeedback({
        type: "success",
        message: "Message marked as read.",
      });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "The message status could not be updated.",
        ),
      });
    } finally {
      setUpdatingMessageId(null);
    }
  }

  async function handleArchiveMessage(
    message: AdminContactMessage,
  ) {
    if (
      message.status === "ARCHIVED" ||
      updatingMessageId !== null
    ) {
      return;
    }

    try {
      setUpdatingMessageId(message.id);
      setFeedback(null);

      const updatedMessage =
        await updateAdminMessage(message.id, {
          status: "ARCHIVED",
        });

      updateMessageInState(updatedMessage);
      setFeedback({
        type: "success",
        message: "Message archived.",
      });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "The message could not be archived.",
        ),
      });
    } finally {
      setUpdatingMessageId(null);
    }
  }

  async function handleDeleteMessage() {
    if (!messageToDelete) {
      return;
    }

    try {
      setIsDeletingMessage(true);
      setFeedback(null);

      await deleteAdminMessage(
        messageToDelete.id,
      );

      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) =>
            message.id !==
            messageToDelete.id,
        ),
      );

      setTotalMessages((currentTotal) =>
        Math.max(0, currentTotal - 1),
      );

      const deletedSelectedMessage =
        selectedMessage?.id ===
        messageToDelete.id;

      setMessageToDelete(null);

      if (deletedSelectedMessage) {
        navigate("/admin/messages");
      }

      setFeedback({
        type: "success",
        message:
          "Message deleted successfully.",
      });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "The message could not be deleted.",
        ),
      });
    } finally {
      setIsDeletingMessage(false);
    }
  }

  const showPreview =
    Boolean(messageId) ||
    Boolean(selectedMessage) ||
    isPreviewLoading ||
    Boolean(previewError);

  return (
    <section className="admin-messages">
      <header className="admin-messages__header">
        <div>
          <span className="admin-messages__breadcrumb">
            Admin / Messages
          </span>

          <h1>Messages</h1>

          <p>
            Review and manage enquiries submitted
            through the public contact form.
          </p>
        </div>

        <button
          type="button"
          className="admin-messages__refresh-button"
          onClick={() =>
            void loadMessages(true)
          }
          disabled={
            isLoading || isRefreshing
          }
        >
          <RefreshCw
            size={15}
            className={
              isRefreshing
                ? "admin-messages__spinning-icon"
                : undefined
            }
          />

          {isRefreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      {feedback && (
        <div
          className={`admin-messages__feedback admin-messages__feedback--${feedback.type}`}
          role={
            feedback.type === "error"
              ? "alert"
              : "status"
          }
        >
          {feedback.type === "error" ? (
            <AlertCircle size={17} />
          ) : (
            <MailCheck size={17} />
          )}

          <span>{feedback.message}</span>

          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="admin-messages__stats">
        <article className="admin-messages__stat-card">
          <span>Total</span>
          <strong>{statistics.total}</strong>
          <small>All contact messages</small>
        </article>

        <article className="admin-messages__stat-card">
          <span>New</span>
          <strong>{statistics.new}</strong>
          <small>Waiting for review</small>
        </article>

        <article className="admin-messages__stat-card">
          <span>Read</span>
          <strong>{statistics.read}</strong>
          <small>Already opened</small>
        </article>

        <article className="admin-messages__stat-card">
          <span>Replied</span>
          <strong>{statistics.replied}</strong>
          <small>Completed conversations</small>
        </article>
      </div>

      <div className="admin-messages__workspace">
        <div className="admin-messages__list-panel">
          <div className="admin-messages__toolbar">
            <div className="admin-messages__toolbar-copy">
              <h2>Contact Inbox</h2>
              <p>
                {filteredMessages.length} of{" "}
                {messages.length} loaded messages
              </p>
            </div>

            <div className="admin-messages__filters">
              <label className="admin-messages__search">
                <Search size={15} />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search messages..."
                  aria-label="Search messages"
                />
              </label>

              <label className="admin-messages__status-filter">
                <span className="sr-only">
                  Filter by status
                </span>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value as MessageStatus,
                    )
                  }
                >
                  <option value="ALL">
                    All statuses
                  </option>
                  <option value="NEW">New</option>
                  <option value="READ">
                    Read
                  </option>
                  <option value="REPLIED">
                    Replied
                  </option>
                  <option value="ARCHIVED">
                    Archived
                  </option>
                </select>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div
              className="admin-messages__state"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle
                size={27}
                className="admin-messages__spinning-icon"
              />

              <h3>Loading messages</h3>

              <p>
                Retrieving the latest contact
                enquiries.
              </p>
            </div>
          ) : pageError &&
            messages.length === 0 ? (
            <div
              className="admin-messages__state admin-messages__state--error"
              role="alert"
            >
              <AlertCircle size={27} />

              <h3>Messages could not be loaded</h3>

              <p>{pageError}</p>

              <button
                type="button"
                onClick={() =>
                  void loadMessages()
                }
              >
                Try again
              </button>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="admin-messages__state">
              <Inbox size={27} />

              <h3>
                {messages.length === 0
                  ? "No contact messages yet"
                  : "No matching messages"}
              </h3>

              <p>
                {messages.length === 0
                  ? "New contact submissions will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="admin-messages__table-wrap">
              <table className="admin-messages__table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMessages.map(
                    (message) => {
                      const isUpdating =
                        updatingMessageId ===
                        message.id;

                      return (
                        <tr
                          key={message.id}
                          className={
                            message.status ===
                            "NEW"
                              ? "admin-messages__row--new"
                              : undefined
                          }
                        >
                          <td>
                            <div className="admin-messages__sender">
                              <span className="admin-messages__avatar">
                                {message.name
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase() ||
                                  "?"}
                              </span>

                              <div>
                                <strong>
                                  {message.name}
                                </strong>

                                <a
                                  href={`mailto:${message.email}`}
                                >
                                  {message.email}
                                </a>
                              </div>
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="admin-messages__subject-button"
                              onClick={() =>
                                handleViewMessage(
                                  message,
                                )
                              }
                            >
                              <strong>
                                {message.subject?.trim() ||
                                  "No subject"}
                              </strong>

                              <span>
                                {message.message}
                              </span>
                            </button>
                          </td>

                          <td>
                            <time
                              dateTime={
                                message.createdAt
                              }
                            >
                              {formatMessageDate(
                                message.createdAt,
                              )}
                            </time>
                          </td>

                          <td>
                            <span
                              className={`admin-messages__status admin-messages__status--${getStatusClass(
                                message.status,
                              )}`}
                            >
                              {formatLabel(
                                message.status,
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="admin-messages__actions">
                              <button
                                type="button"
                                title="Open message"
                                aria-label={`Open message from ${message.name}`}
                                onClick={() =>
                                  handleViewMessage(
                                    message,
                                  )
                                }
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                type="button"
                                title="Mark as read"
                                aria-label={`Mark message from ${message.name} as read`}
                                disabled={
                                  message.status !==
                                    "NEW" ||
                                  updatingMessageId !==
                                    null
                                }
                                onClick={() =>
                                  void handleMarkAsRead(
                                    message,
                                  )
                                }
                              >
                                {isUpdating ? (
                                  <LoaderCircle
                                    size={15}
                                    className="admin-messages__spinning-icon"
                                  />
                                ) : (
                                  <MailCheck
                                    size={15}
                                  />
                                )}
                              </button>

                              <button
                                type="button"
                                title="Delete message"
                                aria-label={`Delete message from ${message.name}`}
                                className="admin-messages__action--danger"
                                onClick={() =>
                                  setMessageToDelete(
                                    message,
                                  )
                                }
                              >
                                <Trash2
                                  size={15}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showPreview && (
          <aside
            className="admin-messages__drawer"
            aria-label="Message details"
          >
            <div className="admin-messages__drawer-header">
              <div>
                <span>Message Details</span>
                <h2>
                  {selectedMessage?.subject?.trim() ||
                    "Contact message"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClosePreview}
                aria-label="Close message details"
              >
                <X size={18} />
              </button>
            </div>

            {isPreviewLoading ? (
              <div className="admin-messages__drawer-state">
                <LoaderCircle
                  size={27}
                  className="admin-messages__spinning-icon"
                />
                <h3>Opening message</h3>
                <p>
                  Retrieving the full message.
                </p>
              </div>
            ) : previewError ? (
              <div className="admin-messages__drawer-state admin-messages__drawer-state--error">
                <AlertCircle size={27} />
                <h3>Unable to open message</h3>
                <p>{previewError}</p>

                <button
                  type="button"
                  onClick={() => {
                    if (messageId) {
                      void openMessage(
                        Number(messageId),
                      );
                    }
                  }}
                >
                  Try again
                </button>
              </div>
            ) : selectedMessage ? (
              <>
                <div className="admin-messages__drawer-content">
                  <div className="admin-messages__contact-card">
                    <span className="admin-messages__contact-avatar">
                      {selectedMessage.name
                        .trim()
                        .charAt(0)
                        .toUpperCase() || "?"}
                    </span>

                    <div>
                      <strong>
                        {selectedMessage.name}
                      </strong>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>

                  <dl className="admin-messages__details">
                    <div>
                      <dt>
                        <Phone size={14} />
                        Phone
                      </dt>
                      <dd>
                        {selectedMessage.phone ? (
                          <a
                            href={`tel:${selectedMessage.phone}`}
                          >
                            {selectedMessage.phone}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        <CalendarDays size={14} />
                        Received
                      </dt>
                      <dd>
                        {formatMessageDateTime(
                          selectedMessage.createdAt,
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        <Tag size={14} />
                        Category
                      </dt>
                      <dd>
                        {formatLabel(
                          selectedMessage.category,
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        <AlertCircle size={14} />
                        Priority
                      </dt>
                      <dd>
                        {formatLabel(
                          selectedMessage.priority,
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="admin-messages__drawer-status">
                    <span>Status</span>

                    <strong
                      className={`admin-messages__status admin-messages__status--${getStatusClass(
                        selectedMessage.status,
                      )}`}
                    >
                      {formatLabel(
                        selectedMessage.status,
                      )}
                    </strong>
                  </div>

                  <div className="admin-messages__message-body">
                    <span>Message</span>
                    <p>
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="admin-messages__drawer-footer">
                  <button
                    type="button"
                    className="admin-messages__drawer-button"
                    disabled={
                      selectedMessage.status !==
                        "NEW" ||
                      updatingMessageId !== null
                    }
                    onClick={() =>
                      void handleMarkAsRead(
                        selectedMessage,
                      )
                    }
                  >
                    <MailCheck size={15} />
                    Mark as Read
                  </button>

                  <button
                    type="button"
                    className="admin-messages__drawer-button"
                    disabled={
                      selectedMessage.status ===
                        "ARCHIVED" ||
                      updatingMessageId !== null
                    }
                    onClick={() =>
                      void handleArchiveMessage(
                        selectedMessage,
                      )
                    }
                  >
                    <Archive size={15} />
                    Archive
                  </button>

                  <button
                    type="button"
                    className="admin-messages__drawer-button admin-messages__drawer-button--danger"
                    onClick={() =>
                      setMessageToDelete(
                        selectedMessage,
                      )
                    }
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </aside>
        )}
      </div>

      {messageToDelete && (
        <div
          className="admin-messages__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !isDeletingMessage
            ) {
              setMessageToDelete(null);
            }
          }}
        >
          <div
            className="admin-messages__confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-message-title"
          >
            <div className="admin-messages__confirm-icon">
              <Trash2 size={22} />
            </div>

            <h2 id="delete-message-title">
              Delete this message?
            </h2>

            <p>
              The message from{" "}
              <strong>
                {messageToDelete.name}
              </strong>{" "}
              will be permanently removed.
            </p>

            <div className="admin-messages__confirm-actions">
              <button
                type="button"
                className="admin-messages__cancel-button"
                disabled={isDeletingMessage}
                onClick={() =>
                  setMessageToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-messages__delete-button"
                disabled={isDeletingMessage}
                onClick={() =>
                  void handleDeleteMessage()
                }
              >
                {isDeletingMessage ? (
                  <LoaderCircle
                    size={15}
                    className="admin-messages__spinning-icon"
                  />
                ) : (
                  <Trash2 size={15} />
                )}

                {isDeletingMessage
                  ? "Deleting..."
                  : "Delete Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminMessages;